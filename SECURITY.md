# Security model

This project uses a **Node.js API + SQLite** backend so authentication and authorization are enforced on the server. The browser never receives password hashes or session secrets.

## Authentication

- **Passwords**: Hashed with **bcrypt** (cost factor 12) before storage. Plain passwords are never stored.
- **Sessions**: **HTTP-only cookies** (`vb.sid`) via `express-session`. Rolling expiry + optional absolute max session age (`SESSION_ABSOLUTE_MAX_MS`).
- **Session fixation**: New session ID on login (`session.regenerate`).
- **Email verification**: Required for bookings, payments, and favorites (`requireEmailVerified` middleware).
- **Password reset**: Time-limited tokens (1 hour) in the database; generic responses to reduce email enumeration.
- **Login rate limiting**: `express-rate-limit` on login, register, forgot-password, and global API routes.

## Authorization (IDOR)

- Favorites, bookings, and payment intents are always scoped by **`user_id` from the session**, not from client-supplied user IDs.
- Admin routes require `role === 'admin'` after `requireAuth`.
- Destinations list is public; admin CRUD is protected.

## Secrets & keys

- **Do not** put `SESSION_SECRET`, database credentials, or AI keys in frontend code or `VITE_*` variables.
- `GEMINI_API_KEY` (if used) belongs only in server-side scripts or environment on the host — **not** in Vite `define`.

## Input validation

- Request bodies validated with **Zod** on the API. Reject oversized payloads (`express.json` limit).

## Deployment hardening (recommended)

1. **HTTPS** everywhere; set `NODE_ENV=production` and `secure: true` on session cookies (already tied to `NODE_ENV`).
2. **Reverse proxy** (nginx/Caddy) with TLS termination; set `trust proxy` appropriately.
3. **SQLite file** on private disk only — not web-accessible; no public DB port.
4. **Logging / monitoring**: Audit events are stored in `audit_logs`. Forward API logs to your platform (CloudWatch, Datadog, etc.) for anomaly detection.
5. **Rate limiting** at the edge (Cloudflare, nginx) for additional bot protection.

## Abuse / bots

- Application-level rate limits cover login, registration, and general API traffic.
- For production, add WAF / CAPTCHA on auth endpoints if you face automated abuse.

## Sandbox payments

Card handling uses **sandbox test PANs** only; QR codes encode a **UPI intent string** for presentation. No card data is sent to real acquirers in this codebase.
