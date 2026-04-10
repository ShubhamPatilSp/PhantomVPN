const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token || token === 'dummy_token') {
      // ── DEV BYPASS ──
      const dummyUser = await User.findOne();
      if (dummyUser) {
        req.user = dummyUser;
        return next();
      }
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+twoFactorEnabled');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Token invalid or user not found.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Account has been suspended.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please refresh.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

const requireEmailVerified = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email address to continue.',
    });
  }
  next();
};

const requirePlan = (plans) => (req, res, next) => {
  const allowedPlans = Array.isArray(plans) ? plans : [plans];
  if (!allowedPlans.includes(req.user.plan)) {
    return res.status(403).json({
      success: false,
      message: 'This feature requires a higher subscription plan.',
      requiredPlans: allowedPlans,
      currentPlan: req.user.plan,
    });
  }
  next();
};

module.exports = { protect, requireEmailVerified, requirePlan };
