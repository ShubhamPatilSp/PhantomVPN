const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimit');
const {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  twoFactorSchema,
} = require('../utils/validators');
const config = require('../config');
const User = require('../models/User.model');

// ── Standard Auth ─────────────────────────────────────────────────
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', protect, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authLimiter, authController.resendVerification);
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/2fa/enable', protect, authController.enable2FA);
router.post('/2fa/verify', protect, validate(twoFactorSchema), authController.verify2FA);
router.post('/2fa/disable', protect, validate(twoFactorSchema), authController.disable2FA);

// ── Google OAuth ──────────────────────────────────────────────────
router.get('/google', (req, res, next) => {
  if (!config.google.clientId) {
    return res.status(501).json({ success: false, message: 'Google OAuth is not configured.' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

router.get('/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false, failureRedirect: `${config.frontendUrl}/login?error=google_failed` }, (err, user) => {
      if (err || !user) {
        return res.redirect(`${config.frontendUrl}/login?error=google_failed`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  async (req, res) => {
    try {
      const user = req.user;
      const accessToken = jwt.sign({ id: user._id }, config.jwt.secret, { expiresIn: config.jwt.accessExpire });
      const refreshToken = jwt.sign({ id: user._id }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpire });

      await User.updateOne({ _id: user._id }, {
        $push: { refreshTokens: { $each: [{ token: refreshToken, createdAt: new Date() }], $slice: -5 } },
        $set: { lastLoginAt: new Date() },
      });

      // Redirect to frontend with tokens in URL hash (frontend reads and stores them)
      res.redirect(`${config.frontendUrl}/login?accessToken=${accessToken}&refreshToken=${refreshToken}&userId=${user._id}`);
    } catch (err) {
      console.error('Google OAuth callback error:', err);
      res.redirect(`${config.frontendUrl}/login?error=google_failed`);
    }
  }
);

module.exports = router;
