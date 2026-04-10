/**
 * Joi validation schemas for all API endpoints.
 * Uses the 'joi' package (already installed but never wired up).
 */
const Joi = require('joi');

// ── Auth Schemas ──────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required()
    .messages({ 'string.min': 'Name must be at least 2 characters', 'any.required': 'Name is required' }),
  email: Joi.string().email().lowercase().trim().required()
    .messages({ 'string.email': 'Invalid email format', 'any.required': 'Email is required' }),
  password: Joi.string().min(8).max(128).required()
    .messages({ 'string.min': 'Password must be at least 8 characters', 'any.required': 'Password is required' }),
  referralCode: Joi.string().alphanum().max(16).optional().allow(''),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
  twoFactorCode: Joi.string().length(6).pattern(/^\d+$/).optional().allow(''),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).max(128).required(),
});

const twoFactorSchema = Joi.object({
  code: Joi.string().length(6).pattern(/^\d+$/).required()
    .messages({ 'string.length': '2FA code must be 6 digits', 'string.pattern.base': '2FA code must be numeric' }),
});

// ── User Schemas ──────────────────────────────────────────────────

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).optional(),
  preferences: Joi.object({
    dns: Joi.string().optional(),
    protocol: Joi.string().valid('wireguard', 'openvpn', 'ikev2').optional(),
    killSwitch: Joi.boolean().optional(),
    splitTunnel: Joi.boolean().optional(),
    autoConnect: Joi.boolean().optional(),
    theme: Joi.string().valid('dark', 'light', 'system').optional(),
    language: Joi.string().max(5).optional(),
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      security: Joi.boolean().optional(),
      usage: Joi.boolean().optional(),
      newsletter: Joi.boolean().optional(),
    }).optional(),
  }).optional(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

// ── VPN Schemas ───────────────────────────────────────────────────

const connectSchema = Joi.object({
  serverId: Joi.string().required().messages({ 'any.required': 'Server ID is required' }),
});

// ── Plan Schemas ──────────────────────────────────────────────────

const subscribeSchema = Joi.object({
  planName: Joi.string().valid('free', 'pro', 'business').required(),
  billing: Joi.string().valid('monthly', 'yearly').default('monthly'),
});

// ── Admin Schemas ─────────────────────────────────────────────────

const createServerSchema = Joi.object({
  name: Joi.string().trim().required(),
  country: Joi.string().required(),
  city: Joi.string().required(),
  flag: Joi.string().required(),
  countryCode: Joi.string().uppercase().length(2).required(),
  region: Joi.string().valid('americas', 'europe', 'asia', 'africa', 'oceania', 'middleeast').required(),
  ip: Joi.string().required(),
  port: Joi.number().integer().default(51820),
  ping: Joi.number().integer().min(0).default(30),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  isOnline: Joi.boolean().default(true),
  isPremium: Joi.boolean().default(false),
  supportsStreaming: Joi.boolean().default(false),
  supportsP2P: Joi.boolean().default(false),
  supportsTor: Joi.boolean().default(false),
  isObfuscated: Joi.boolean().default(false),
});

const banUserSchema = Joi.object({
  reason: Joi.string().max(500).default('Violation of terms of service'),
});

// ── Validation Middleware Factory ──────────────────────────────────

/**
 * Creates Express middleware that validates req.body against a Joi schema.
 * @param {Joi.ObjectSchema} schema
 * @param {string} source - 'body' | 'query' | 'params'
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map(d => d.message).join('. ');
    return res.status(400).json({
      success: false,
      message: messages,
      errors: error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message,
      })),
    });
  }

  req[source] = value;
  next();
};

module.exports = {
  // Schemas
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  twoFactorSchema,
  updateProfileSchema,
  changePasswordSchema,
  connectSchema,
  subscribeSchema,
  createServerSchema,
  banUserSchema,
  // Middleware
  validate,
};
