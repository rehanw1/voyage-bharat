import { Router } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { db } from '../db';
import { requireAuth, requireEmailVerified, type AuthedRequest } from '../middleware/authMiddleware';

const router = Router();
router.use(requireAuth);
router.use(requireEmailVerified);

router.get('/', (req: AuthedRequest, res) => {
  const rows = db
    .prepare('SELECT id, destination_id, payload, created_at FROM favorites WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user!.id) as { id: string; destination_id: string; payload: string; created_at: string }[];

  res.json({
    favorites: rows.map((r) => ({
      id: r.id,
      destinationId: r.destination_id,
      ...JSON.parse(r.payload),
      createdAt: r.created_at,
    })),
  });
});

const payloadSchema = z.object({
  destinationId: z.string().min(1).max(64),
  name: z.string().min(1).max(120),
  region: z.string().max(40).optional(),
  theme: z.string().max(40).optional(),
  budget: z.string().max(40).optional(),
  image: z.string().max(2000).optional(),
  description: z.string().max(2000).optional(),
  longDescription: z.string().max(20000).optional(),
});

router.post('/', (req: AuthedRequest, res) => {
  const parsed = payloadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid destination data.' });

  const { destinationId, ...rest } = parsed.data;
  const uid = req.user!.id;

  const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND destination_id = ?').get(uid, destinationId);
  if (existing) {
    return res.status(409).json({ error: 'Already in favorites.' });
  }

  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO favorites (id, user_id, destination_id, payload, created_at) VALUES (?, ?, ?, ?, ?)`
  ).run(id, uid, destinationId, JSON.stringify(rest), now);

  res.status(201).json({ id, destinationId, ...rest, createdAt: now });
});

router.delete('/:id', (req: AuthedRequest, res) => {
  const id = z.string().uuid().safeParse(req.params.id);
  if (!id.success) return res.status(400).json({ error: 'Invalid id.' });

  const r = db.prepare('DELETE FROM favorites WHERE id = ? AND user_id = ?').run(id.data, req.user!.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Not found.' });
  res.json({ ok: true });
});

export default router;
