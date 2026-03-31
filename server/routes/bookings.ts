import { Router } from 'express';
import { db } from '../db';
import { requireAuth, requireEmailVerified, type AuthedRequest } from '../middleware/authMiddleware';

const router = Router();
router.use(requireAuth);
router.use(requireEmailVerified);

router.get('/', (req: AuthedRequest, res) => {
  const rows = db
    .prepare(
      `SELECT id, payment_intent_id, item_json, payment_json, created_at FROM bookings WHERE user_id = ? ORDER BY created_at DESC`
    )
    .all(req.user!.id) as { id: string; payment_intent_id: string; item_json: string; payment_json: string; created_at: string }[];

  res.json({
    bookings: rows.map((r) => ({
      id: r.id,
      paymentIntentId: r.payment_intent_id,
      item: JSON.parse(r.item_json),
      payment: JSON.parse(r.payment_json),
      createdAt: r.created_at,
    })),
  });
});

export default router;
