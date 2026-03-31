import { Router } from 'express';
import { z } from 'zod';
import QRCode from 'qrcode';
import { randomUUID } from 'crypto';
import { db, auditLog } from '../db';
import { requireAuth, requireEmailVerified, type AuthedRequest } from '../middleware/authMiddleware';
import { strictLimiter } from '../middleware/rateLimits';
import {
  buildQrPayload,
  makePaymentIntentId,
  makeReceiptId,
  validateAndAuthorizeCard,
  type CardPayload,
} from '../services/paymentEngine';

const router = Router();
router.use(requireAuth);
router.use(requireEmailVerified);
router.use(strictLimiter);

router.post('/intent', async (req: AuthedRequest, res) => {
  const parsed = z
    .object({
      amountInr: z.number().int().positive().max(50_000_000),
      title: z.string().min(1).max(200),
      subtitle: z.string().max(500).optional(),
      itemId: z.string().min(1).max(120),
    })
    .safeParse(req.body);

  if (!parsed.success) return res.status(400).json({ error: 'Invalid checkout data.' });

  const { amountInr, title, subtitle, itemId } = parsed.data;
  const uid = req.user!.id;
  const upiRef = `VB${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
  const qrPayload = buildQrPayload(amountInr, upiRef);
  let qrDataUrl: string;
  try {
    qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 280, margin: 2, errorCorrectionLevel: 'M' });
  } catch {
    return res.status(500).json({ error: 'Could not generate payment QR.' });
  }

  const id = makePaymentIntentId();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO payment_intents (id, user_id, amount_inr, title, subtitle, item_ref, qr_payload, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'requires_payment_method', ?, ?)`
  ).run(id, uid, amountInr, title, subtitle ?? null, itemId, qrPayload, now, now);

  auditLog('payment_intent_created', uid, req.ip, { paymentIntentId: id, amountInr });

  res.json({
    id,
    status: 'requires_payment_method',
    qrDataUrl,
    upiReference: upiRef,
    amountInr,
  });
});

router.post('/:id/refresh-qr', async (req: AuthedRequest, res) => {
  const id = z.string().min(10).max(80).safeParse(req.params.id);
  if (!id.success) return res.status(400).json({ error: 'Invalid payment id.' });

  const row = db
    .prepare(
      `SELECT id, user_id, amount_inr, status FROM payment_intents WHERE id = ?`
    )
    .get(id.data) as { id: string; user_id: string; amount_inr: number; status: string } | undefined;

  if (!row || row.user_id !== req.user!.id) return res.status(404).json({ error: 'Payment not found.' });
  if (row.status === 'succeeded') return res.status(400).json({ error: 'Payment already completed.' });

  const upiRef = `VB${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
  const qrPayload = buildQrPayload(row.amount_inr, upiRef);
  const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 280, margin: 2, errorCorrectionLevel: 'M' });
  const now = new Date().toISOString();
  db.prepare(`UPDATE payment_intents SET qr_payload = ?, updated_at = ? WHERE id = ?`).run(qrPayload, now, row.id);

  res.json({ qrDataUrl, upiReference: upiRef });
});

const cardBody = z.object({
  cardNumber: z.string().min(12).max(23),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/),
  cvc: z.string().min(3).max(4),
  name: z.string().min(1).max(120),
});

router.post('/:id/confirm', async (req: AuthedRequest, res) => {
  const id = z.string().min(10).max(80).safeParse(req.params.id);
  const parsed = cardBody.safeParse(req.body);
  if (!id.success || !parsed.success) return res.status(400).json({ error: 'Invalid card details.' });

  const row = db
    .prepare(
      `SELECT id, user_id, amount_inr, title, subtitle, item_ref, status FROM payment_intents WHERE id = ?`
    )
    .get(id.data) as
    | {
        id: string;
        user_id: string;
        amount_inr: number;
        title: string;
        subtitle: string | null;
        item_ref: string;
        status: string;
      }
    | undefined;

  if (!row || row.user_id !== req.user!.id) return res.status(404).json({ error: 'Payment not found.' });
  if (row.status === 'succeeded') return res.status(400).json({ error: 'Already paid.' });

  const method: CardPayload = parsed.data;
  const now = new Date().toISOString();

  const simulateDelay = (ms: number) => new Promise((r) => setTimeout(r, ms));
  await simulateDelay(400 + Math.floor(Math.random() * 500));

  db.prepare(`UPDATE payment_intents SET status = 'processing', updated_at = ?, last_error = NULL WHERE id = ?`).run(now, row.id);
  await simulateDelay(600 + Math.floor(Math.random() * 900));

  try {
    const { brand, last4 } = validateAndAuthorizeCard(method);
    const receiptId = makeReceiptId();
    db.prepare(
      `UPDATE payment_intents SET status = 'succeeded', card_brand = ?, card_last4 = ?, receipt_id = ?, updated_at = ?, last_error = NULL WHERE id = ?`
    ).run(brand, last4, receiptId, now, row.id);

    const item = {
      id: row.item_ref,
      title: row.title,
      subtitle: row.subtitle ?? undefined,
      amountInr: row.amount_inr,
    };
    const payment = {
      status: 'paid',
      method: 'card',
      brand,
      last4,
      paymentIntentId: row.id,
      receiptId,
    };

    const bookingId = randomUUID();
    db.prepare(
      `INSERT INTO bookings (id, user_id, payment_intent_id, item_json, payment_json, created_at) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(bookingId, row.user_id, row.id, JSON.stringify(item), JSON.stringify(payment), now);

    auditLog('payment_succeeded', row.user_id, req.ip, { paymentIntentId: row.id, receiptId });

    res.json({
      success: true,
      receiptId,
      paymentIntentId: row.id,
      item,
      payment,
      bookingId,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Payment failed.';
    db.prepare(`UPDATE payment_intents SET status = 'failed', last_error = ?, updated_at = ? WHERE id = ?`).run(
      message,
      now,
      row.id
    );

    const item = {
      id: row.item_ref,
      title: row.title,
      subtitle: row.subtitle ?? undefined,
      amountInr: row.amount_inr,
    };
    const payment = {
      status: 'failed',
      method: 'card',
      paymentIntentId: row.id,
      error: message,
    };
    const bookingId = randomUUID();
    db.prepare(
      `INSERT INTO bookings (id, user_id, payment_intent_id, item_json, payment_json, created_at) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(bookingId, row.user_id, row.id, JSON.stringify(item), JSON.stringify(payment), now);

    auditLog('payment_failed', row.user_id, req.ip, { paymentIntentId: row.id, error: message });

    res.status(402).json({ success: false, error: message, paymentIntentId: row.id });
  }
});

export default router;
