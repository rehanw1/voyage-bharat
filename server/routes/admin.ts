import { Router } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { db, auditLog } from '../db';
import { requireAuth, requireAdmin, type AuthedRequest } from '../middleware/authMiddleware';

const router = Router();
router.use(requireAuth);
router.use(requireAdmin); // after requireAuth sets req.user

router.get('/stats', (_req: AuthedRequest, res) => {
  const users = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;
  const bookings = (db.prepare('SELECT COUNT(*) as c FROM bookings').get() as { c: number }).c;
  const favorites = (db.prepare('SELECT COUNT(*) as c FROM favorites').get() as { c: number }).c;
  res.json({ users, bookings, favorites });
});

router.get('/users', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT id, email, display_name, role, email_verified, created_at FROM users ORDER BY created_at DESC`
    )
    .all();
  res.json({ users: rows });
});

router.patch('/users/:id', (req: AuthedRequest, res) => {
  const id = z.string().uuid().safeParse(req.params.id);
  const body = z
    .object({
      displayName: z.string().min(1).max(80).optional(),
      role: z.enum(['user', 'admin']).optional(),
      emailVerified: z.boolean().optional(),
    })
    .safeParse(req.body);
  if (!id.success || !body.success) return res.status(400).json({ error: 'Invalid input.' });

  const target = db.prepare('SELECT id FROM users WHERE id = ?').get(id.data);
  if (!target) return res.status(404).json({ error: 'User not found.' });

  const { displayName, role, emailVerified } = body.data;
  if (displayName != null) db.prepare('UPDATE users SET display_name = ? WHERE id = ?').run(displayName, id.data);
  if (role != null) db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id.data);
  if (emailVerified != null) db.prepare('UPDATE users SET email_verified = ? WHERE id = ?').run(emailVerified ? 1 : 0, id.data);

  auditLog('admin_user_updated', req.user!.id, req.ip, { targetUserId: id.data });
  res.json({ ok: true });
});

router.delete('/users/:id', (req: AuthedRequest, res) => {
  const id = z.string().uuid().safeParse(req.params.id);
  if (!id.success) return res.status(400).json({ error: 'Invalid id.' });
  if (id.data === req.user!.id) return res.status(400).json({ error: 'Cannot delete your own account.' });

  const r = db.prepare('DELETE FROM users WHERE id = ?').run(id.data);
  if (r.changes === 0) return res.status(404).json({ error: 'Not found.' });
  auditLog('admin_user_deleted', req.user!.id, req.ip, { targetUserId: id.data });
  res.json({ ok: true });
});

router.get('/bookings', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT b.id, b.user_id, b.payment_intent_id, b.item_json, b.payment_json, b.created_at, u.email
       FROM bookings b JOIN users u ON u.id = b.user_id ORDER BY b.created_at DESC LIMIT 500`
    )
    .all();
  res.json({ bookings: rows });
});

router.get('/audit', (_req, res) => {
  const rows = db.prepare(`SELECT id, event_type, user_id, ip, details, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 300`).all();
  res.json({ logs: rows });
});

const destSchema = z.object({
  name: z.string().min(1).max(120),
  region: z.string().min(1).max(40),
  theme: z.string().min(1).max(40),
  budget: z.string().min(1).max(40),
  image: z.string().min(1).max(2000),
  description: z.string().min(1).max(2000),
  longDescription: z.string().min(1).max(20000),
});

router.get('/destinations', (_req, res) => {
  const rows = db
    .prepare(`SELECT id, name, region, theme, budget, image, description, long_description, sort_order FROM destinations ORDER BY sort_order`)
    .all();
  res.json({ destinations: rows });
});

router.post('/destinations', (req: AuthedRequest, res) => {
  const parsed = destSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid destination.' });
  const id = randomUUID();
  const maxSo =
    (db.prepare('SELECT MAX(sort_order) as m FROM destinations').get() as { m: number | null }).m ?? -1;
  const d = parsed.data;
  db.prepare(
    `INSERT INTO destinations (id, name, region, theme, budget, image, description, long_description, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, d.name, d.region, d.theme, d.budget, d.image, d.description, d.longDescription, maxSo + 1);
  auditLog('admin_destination_created', req.user!.id, req.ip, { id });
  res.status(201).json({ id });
});

router.patch('/destinations/:id', (req: AuthedRequest, res) => {
  const id = z.string().min(1).max(64).safeParse(req.params.id);
  const parsed = destSchema.partial().safeParse(req.body);
  if (!id.success || !parsed.success) return res.status(400).json({ error: 'Invalid input.' });

  const exists = db.prepare('SELECT id FROM destinations WHERE id = ?').get(id.data);
  if (!exists) return res.status(404).json({ error: 'Not found.' });

  const p = parsed.data;
  const fields: string[] = [];
  const vals: unknown[] = [];
  if (p.name != null) {
    fields.push('name = ?');
    vals.push(p.name);
  }
  if (p.region != null) {
    fields.push('region = ?');
    vals.push(p.region);
  }
  if (p.theme != null) {
    fields.push('theme = ?');
    vals.push(p.theme);
  }
  if (p.budget != null) {
    fields.push('budget = ?');
    vals.push(p.budget);
  }
  if (p.image != null) {
    fields.push('image = ?');
    vals.push(p.image);
  }
  if (p.description != null) {
    fields.push('description = ?');
    vals.push(p.description);
  }
  if (p.longDescription != null) {
    fields.push('long_description = ?');
    vals.push(p.longDescription);
  }
  if (!fields.length) return res.json({ ok: true });
  vals.push(id.data);
  db.prepare(`UPDATE destinations SET ${fields.join(', ')} WHERE id = ?`).run(...vals);
  auditLog('admin_destination_updated', req.user!.id, req.ip, { id: id.data });
  res.json({ ok: true });
});

router.delete('/destinations/:id', (req: AuthedRequest, res) => {
  const id = z.string().min(1).max(64).safeParse(req.params.id);
  if (!id.success) return res.status(400).json({ error: 'Invalid id.' });
  const r = db.prepare('DELETE FROM destinations WHERE id = ?').run(id.data);
  if (r.changes === 0) return res.status(404).json({ error: 'Not found.' });
  auditLog('admin_destination_deleted', req.user!.id, req.ip, { id: id.data });
  res.json({ ok: true });
});

export default router;
