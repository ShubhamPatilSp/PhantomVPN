/**
 * Centralized configuration module.
 * Consolidates all environment variables with defaults and validation.
 */
require('dotenv').config();

const config = {
  // ── Server ──────────────────────────────────────────────────────
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',

  // ── Database ────────────────────────────────────────────────────
  mongoUri: process.env.MONGODB_URI || '',

  // ── JWT ─────────────────────────────────────────────────────────
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
    accessExpire: process.env.JWT_EXPIRE || '15m',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',
  },

  // ── Frontend ────────────────────────────────────────────────────
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // ── Email ───────────────────────────────────────────────────────
  email: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || '"PhantomVPN" <noreply@phantomvpn.com>',
  },

  // ── Google OAuth ────────────────────────────────────────────────
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
  },

  // ── Cloudinary ──────────────────────────────────────────────────
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  // ── Rate Limiting ───────────────────────────────────────────────
  rateLimit: {
    auth: { windowMs: 15 * 60 * 1000, max: 10 },
    api: { windowMs: 60 * 1000, max: 100 },
    tools: { windowMs: 60 * 1000, max: 20 },
    passwordReset: { windowMs: 60 * 60 * 1000, max: 3 },
  },

  // ── Security ────────────────────────────────────────────────────
  bcryptRounds: 12,
  maxLoginAttempts: 5,
  lockoutDuration: 30 * 60 * 1000, // 30 minutes

  // ── Plan Limits ─────────────────────────────────────────────────
  plans: {
    free: { dataGB: 10, devices: 1, speedMbps: 100 },
    pro: { dataGB: Infinity, devices: 6, speedMbps: 10000 },
    business: { dataGB: Infinity, devices: 10, speedMbps: 10000 },
  },
};

// Validate critical production config
if (config.isProd) {
  const required = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

module.exports = config;
