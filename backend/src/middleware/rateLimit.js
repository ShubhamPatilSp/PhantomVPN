const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { success: false, message },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.user?.role === 'admin',
});

const authLimiter = createLimiter(
  15 * 60 * 1000, // 15 min
  10,
  'Too many authentication attempts. Please try again in 15 minutes.'
);

const apiLimiter = createLimiter(
  60 * 1000, // 1 min
  100,
  'Too many requests. Please slow down.'
);

const toolsLimiter = createLimiter(
  60 * 1000,
  20,
  'Too many tool requests. Please wait a moment.'
);

const passwordResetLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  3,
  'Too many password reset attempts. Please try again in an hour.'
);

module.exports = { authLimiter, apiLimiter, toolsLimiter, passwordResetLimiter };
