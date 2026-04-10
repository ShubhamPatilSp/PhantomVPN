const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User.model');
const { AuditLog, Notification, Referral } = require('../models/index');
const emailService = require('../services/email.service');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });
  return { accessToken, refreshToken };
};

const getClientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, referralCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: Date.now() + 24 * 60 * 60 * 1000,
    });

    // Handle referral
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer) {
        user.referredBy = referrer._id;
      }
    }

    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(user.email, user.name, verificationToken);

    // Create referral record if applicable
    if (user.referredBy) {
      await Referral.create({
        referrerId: user.referredBy,
        referredUserId: user._id,
        status: 'pending',
      });
    }

    // Audit log
    await AuditLog.create({
      userId: user._id,
      action: 'USER_REGISTER',
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password +twoFactorSecret +twoFactorEnabled +loginAttempts +lockUntil');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Check lockout
    if (user.isLocked()) {
      const lockRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        message: `Account locked. Try again in ${lockRemaining} minutes.`,
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: `Account suspended. Reason: ${user.banReason || 'Violation of terms of service.'}`,
      });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      await user.incrementLoginAttempts();
      const remaining = 5 - (user.loginAttempts + 1);
      return res.status(401).json({
        success: false,
        message: remaining > 0
          ? `Invalid credentials. ${remaining} attempts remaining.`
          : 'Account locked for 30 minutes due to too many failed attempts.',
      });
    }

    // 2FA check
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({
          success: false,
          requiresTwoFactor: true,
          message: 'Two-factor authentication code required.',
        });
      }
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 1,
      });
      if (!verified) {
        return res.status(401).json({ success: false, message: 'Invalid 2FA code.' });
      }
    }

    // Reset login attempts
    await User.updateOne({ _id: user._id }, {
      $set: { loginAttempts: 0, lastLoginAt: new Date(), lastLoginIp: getClientIp(req) },
      $unset: { lockUntil: 1 },
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token
    await User.updateOne({ _id: user._id }, {
      $push: {
        refreshTokens: {
          $each: [{ token: refreshToken, createdAt: new Date() }],
          $slice: -5, // Keep last 5 refresh tokens
        },
      },
    });

    // Check for new login from new location and send alert
    const clientIp = getClientIp(req);
    if (user.lastLoginIp && user.lastLoginIp !== clientIp) {
      await Notification.create({
        userId: user._id,
        type: 'security',
        title: 'New Login Detected',
        message: `A new login was detected from IP ${clientIp}. If this wasn't you, please secure your account immediately.`,
        link: '/settings',
      });
      emailService.sendLoginAlertEmail(user.email, user.name, clientIp, req.headers['user-agent']).catch(console.error);
    }

    await AuditLog.create({
      userId: user._id,
      action: 'USER_LOGIN',
      ip: clientIp,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Login successful.',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        preferences: user.preferences,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken && req.user) {
      await User.updateOne(
        { _id: req.user._id },
        { $pull: { refreshTokens: { token: refreshToken } } }
      );
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Logout failed.' });
  }
};

// POST /api/auth/refresh-token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({
      _id: decoded.id,
      'refreshTokens.token': refreshToken,
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    // Rotate tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    await User.updateOne(
      { _id: user._id },
      {
        $pull: { refreshTokens: { token: refreshToken } },
        $push: { refreshTokens: { token: newRefreshToken, createdAt: new Date() } },
      }
    );

    res.json({ success: true, accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
};

// GET /api/auth/verify-email/:token
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Verification link is invalid or has expired.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpiry = null;
    await user.save();

    // Check and complete referral
    if (user.referredBy) {
      await Referral.updateOne(
        { referredUserId: user._id },
        { status: 'converted' }
      );
      await User.updateOne(
        { _id: user.referredBy },
        { $inc: { totalReferrals: 1, rewardDaysEarned: 30 } }
      );
      await Notification.create({
        userId: user.referredBy,
        type: 'referral',
        title: 'Referral Converted!',
        message: `Your referral just verified their email. You've earned 30 free days!`,
        link: '/settings?tab=referrals',
      });
    }

    // Welcome notification
    await Notification.create({
      userId: user._id,
      type: 'system',
      title: 'Welcome to PhantomVPN!',
      message: 'Your email is verified. Start protecting your privacy today.',
      link: '/dashboard',
    });

    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Email verification failed.' });
  }
};

// POST /api/auth/resend-verification
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a verification link was sent.' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await emailService.sendVerificationEmail(user.email, user.name, verificationToken);

    res.json({ success: true, message: 'Verification email sent. Please check your inbox.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to resend verification email.' });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond the same to prevent user enumeration
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

    res.json({ success: true, message: 'Password reset email sent. Check your inbox.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send reset email.' });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' });
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    await Notification.create({
      userId: user._id,
      type: 'security',
      title: 'Password Changed',
      message: 'Your password was changed successfully. If you did not do this, contact support immediately.',
    });

    res.json({ success: true, message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Password reset failed.' });
  }
};

// POST /api/auth/2fa/enable
exports.enable2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `PhantomVPN (${req.user.email})`,
      issuer: 'PhantomVPN',
    });

    await User.updateOne({ _id: req.user._id }, { twoFactorSecret: secret.base32 });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      secret: secret.base32,
      qrCode,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to enable 2FA.' });
  }
};

// POST /api/auth/2fa/verify
exports.verify2FA = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id).select('+twoFactorSecret');

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid 2FA code.' });
    }

    await User.updateOne({ _id: user._id }, { twoFactorEnabled: true });

    await Notification.create({
      userId: user._id,
      type: 'security',
      title: '2FA Enabled',
      message: 'Two-factor authentication has been enabled for your account.',
    });

    res.json({ success: true, message: '2FA enabled successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to verify 2FA.' });
  }
};

// POST /api/auth/2fa/disable
exports.disable2FA = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id).select('+twoFactorSecret +twoFactorEnabled');

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ success: false, message: '2FA is not enabled.' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid 2FA code.' });
    }

    await User.updateOne({ _id: user._id }, { twoFactorEnabled: false, twoFactorSecret: null });

    await Notification.create({
      userId: user._id,
      type: 'security',
      title: '2FA Disabled',
      message: 'Two-factor authentication has been disabled. We recommend keeping it on.',
    });

    res.json({ success: true, message: '2FA disabled successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to disable 2FA.' });
  }
};
