import type { Request, Response, NextFunction } from 'express';
import { db } from '../db';

export type AuthedRequest = Request & { user?: UserRow };

export type UserRow = {
  id: string;
  email: string;
  display_name: string;
  role: string;
  email_verified: number;
  created_at: string;
};

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const row = db.prepare('SELECT id, email, display_name, role, email_verified, created_at FROM users WHERE id = ?').get(userId) as UserRow | undefined;
  if (!row) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: 'Session invalid.' });
  }
  req.user = row;
  next();
}

export function requireEmailVerified(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user?.email_verified) {
    return res.status(403).json({ error: 'Please verify your email before continuing.', code: 'EMAIL_NOT_VERIFIED' });
  }
  next();
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }
  next();
}
