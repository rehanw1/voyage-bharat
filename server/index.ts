import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import { initDb } from './db';
import authRoutes from './routes/auth';
import publicRoutes from './routes/public';
import favoritesRoutes from './routes/favorites';
import bookingsRoutes from './routes/bookings';
import paymentsRoutes from './routes/payments';
import adminRoutes from './routes/admin';
import chatRoutes from './routes/chat';
import { apiLimiter } from './middleware/rateLimits';

initDb();

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());

const sessionSecret =
  process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === 'production' ? '' : 'development-only-secret-min-32-characters-long!');

if (!sessionSecret || sessionSecret.length < 16) {
  console.error('FATAL: Set SESSION_SECRET (min 16 characters).');
  process.exit(1);
}

app.use(
  session({
    name: 'vb.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: Number(process.env.SESSION_MAX_AGE_MS || 24 * 60 * 60 * 1000),
    },
  })
);

app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', chatRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'voyage-bharat-api' });
});

// Structured error handler (no stack to client in production)
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[api-error]', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error.' : String(err),
  });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
