import rateLimit from 'express-rate-limit';

const windowMs = 15 * 60 * 1000;

export const apiLimiter = rateLimit({
  windowMs,
  max: Number(process.env.RATE_LIMIT_API_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

export const loginLimiter = rateLimit({
  windowMs,
  max: Number(process.env.RATE_LIMIT_LOGIN_MAX || 5),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  skipSuccessfulRequests: true,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_REGISTER_MAX || 3),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many accounts created from this IP. Try again later.' },
});

export const strictLimiter = rateLimit({
  windowMs,
  max: Number(process.env.RATE_LIMIT_STRICT_MAX || 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded.' },
});
