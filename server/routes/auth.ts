import { Router, type Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { db, auditLog } from '../db';
import { requireAuth, type AuthedRequest } from '../middleware/authMiddleware';
import { loginLimiter, registerLimiter } from '../middleware/rateLimits';

const router = Router();

const emailSchema = z.string().trim().toLowerCase().email().max(254);
const passwordSchema = z.string().min(8).max(128);
const displayNameSchema = z.string().trim().min(1).max(80);

function hoursFromNow(h: number) {
  return new Date(Date.now() + h * 3600 * 1000).toISOString();
}

router.post('/register', registerLimiter, (req, res) => {
  const parsed = z
    .object({
      email: emailSchema,
      password: passwordSchema,
      displayName: displayNameSchema,
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input.', details: parsed.error.flatten() });
  }

  const { email, password, displayName } = parsed.data;
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    auditLog('register_duplicate_email', null, req.ip, { email });
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const hash = bcrypt.hashSync(password, 12);
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO users (id, email, password_hash, display_name, role, email_verified, created_at)
     VALUES (?, ?, ?, ?, 'user', 0, ?)`
  ).run(id, email, hash, displayName, now);

  const vToken = randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '').slice(0, 8);
  db.prepare(`INSERT INTO email_verification_tokens (token, user_id, expires_at) VALUES (?, ?, ?)`).run(
    vToken,
    id,
    hoursFromNow(24)
  );

  auditLog('register_success', id, req.ip, { email });

  const dev = process.env.NODE_ENV !== 'production';
  res.status(201).json({
    message: 'Account created. Verify your email to unlock bookings and payments.',
    ...(dev ? { verificationToken: vToken } : {}),
  });
});

router.post('/login', loginLimiter, (req, res) => {
  const parsed = z.object({ email: emailSchema, password: z.string().min(1).max(128) }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input.' });
  }

  const { email, password } = parsed.data;
  const row = db
    .prepare('SELECT id, email, password_hash, display_name, role, email_verified FROM users WHERE email = ?')
    .get(email) as
    | { id: string; email: string; password_hash: string; display_name: string; role: string; email_verified: number }
    | undefined;

  const fail = () => {
    auditLog('login_failed', null, req.ip, { email });
    return res.status(401).json({ error: 'Invalid email or password.' });
  };

  if (!row) return fail();
  if (!bcrypt.compareSync(password, row.password_hash)) return fail();

  req.session.regenerate((err) => {
    if (err) {
      auditLog('login_session_error', row.id, req.ip, {});
      return res.status(500).json({ error: 'Could not start session.' });
    }
    req.session.userId = row.id;
    req.session.createdAt = Date.now();
    auditLog('login_success', row.id, req.ip, { email: row.email });
    res.json({
      user: {
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        role: row.role,
        emailVerified: !!row.email_verified,
      },
    });
  });
});

router.post('/logout', (req, res) => {
  const uid = req.session?.userId ?? null;
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed.' });
    auditLog('logout', uid, req.ip, {});
    res.clearCookie('vb.sid', { path: '/' });
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  const userId = req.session?.userId;
  if (!userId) return res.json({ user: null });
  const row = db
    .prepare('SELECT id, email, display_name, role, email_verified, created_at FROM users WHERE id = ?')
    .get(userId) as
    | { id: string; email: string; display_name: string; role: string; email_verified: number; created_at: string }
    | undefined;
  if (!row) {
    req.session.destroy(() => {});
    return res.json({ user: null });
  }
  res.json({
    user: {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      role: row.role,
      emailVerified: !!row.email_verified,
      createdAt: row.created_at,
    },
  });
});

router.post('/verify-email', (req, res) => {
  const parsed = z.object({ token: z.string().min(10).max(200) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid token.' });

  const { token } = parsed.data;
  const row = db
    .prepare(
      `SELECT t.user_id, t.expires_at FROM email_verification_tokens t WHERE t.token = ?`
    )
    .get(token) as { user_id: string; expires_at: string } | undefined;

  if (!row || new Date(row.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired verification link.' });
  }

  db.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').run(row.user_id);
  db.prepare('DELETE FROM email_verification_tokens WHERE token = ?').run(token);
  auditLog('email_verified', row.user_id, req.ip, {});
  res.json({ message: 'Email verified successfully.' });
});

router.post('/forgot-password', loginLimiter, (req, res) => {
  const parsed = z.object({ email: emailSchema }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid email.' });

  const { email } = parsed.data;
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: string } | undefined;

  // Always same response to prevent email enumeration
  const generic = { message: 'If an account exists, password reset instructions have been sent.' };

  if (!user) {
    auditLog('password_reset_unknown_email', null, req.ip, { email });
    return res.json(generic);
  }

  const token = randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '');
  db.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?').run(user.id);
  db.prepare(`INSERT INTO password_reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)`).run(token, user.id, hoursFromNow(1));
  auditLog('password_reset_requested', user.id, req.ip, {});

  const dev = process.env.NODE_ENV !== 'production';
  res.json({
    ...generic,
    ...(dev ? { resetToken: token } : {}),
  });
});

router.post('/reset-password', loginLimiter, (req, res) => {
  const parsed = z
    .object({
      token: z.string().min(10).max(200),
      newPassword: passwordSchema,
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input.' });

  const { token, newPassword } = parsed.data;
  const row = db
    .prepare(`SELECT user_id, expires_at FROM password_reset_tokens WHERE token = ?`)
    .get(token) as { user_id: string; expires_at: string } | undefined;

  if (!row || new Date(row.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired reset link.' });
  }

  const hash = bcrypt.hashSync(newPassword, 12);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, row.user_id);
  db.prepare('DELETE FROM password_reset_tokens WHERE token = ?').run(token);
  auditLog('password_reset_completed', row.user_id, req.ip, {});
  res.json({ message: 'Password updated. You can sign in with your new password.' });
});

// Session expiry check (rolling max age handled by express-session; this enforces absolute max)
router.use(requireAuth as (req: AuthedRequest, res: Response, next: import('express').NextFunction) => void);
router.get('/session-check', (req: AuthedRequest, res) => {
  const maxMs = Number(process.env.SESSION_ABSOLUTE_MAX_MS || 7 * 24 * 60 * 60 * 1000);
  const created = req.session.createdAt ?? Date.now();
  if (Date.now() - created > maxMs) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
  res.json({ ok: true });
});

export default router;
