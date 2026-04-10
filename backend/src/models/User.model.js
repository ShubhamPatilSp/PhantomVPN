const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  password: {
    type: String,
    minlength: 8,
    select: false,
  },
  avatar: {
    type: String,
    default: null,
  },
  googleId: {
    type: String,
    default: null,
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'business'],
    default: 'free',
  },
  planExpiry: {
    type: Date,
    default: null,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    default: null,
    select: false,
  },
  emailVerificationExpiry: {
    type: Date,
    default: null,
    select: false,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  banReason: {
    type: String,
    default: null,
  },
  passwordResetToken: {
    type: String,
    default: null,
    select: false,
  },
  passwordResetExpiry: {
    type: Date,
    default: null,
    select: false,
  },
  twoFactorSecret: {
    type: String,
    default: null,
    select: false,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  referralCode: {
    type: String,
    unique: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  totalReferrals: {
    type: Number,
    default: 0,
  },
  rewardDaysEarned: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
  lastLoginIp: {
    type: String,
    default: null,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
  }],
  preferences: {
    dns: { type: String, default: '1.1.1.1' },
    protocol: { type: String, enum: ['wireguard', 'openvpn', 'ikev2'], default: 'wireguard' },
    killSwitch: { type: Boolean, default: false },
    splitTunnel: { type: Boolean, default: false },
    autoConnect: { type: Boolean, default: false },
    theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
    language: { type: String, default: 'en' },
    notifications: {
      email: { type: Boolean, default: true },
      security: { type: Boolean, default: true },
      usage: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false },
    },
  },
  devices: [{
    deviceId: String,
    name: String,
    os: String,
    lastSeen: Date,
    ip: String,
  }],
  dataUsed: {
    type: Number,
    default: 0,
  },
  dataUsedThisMonth: {
    type: Number,
    default: 0,
  },
  dataResetDate: {
    type: Date,
    default: () => {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      d.setDate(1);
      return d;
    },
  },
}, {
  timestamps: true,
});

// Pre-save: hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre-save: generate referral code
userSchema.pre('save', function (next) {
  if (!this.referralCode) {
    this.referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  next();
});

// Method: compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method: check if account is locked
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Method: increment login attempts
userSchema.methods.incrementLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 }; // 30 min lockout
  }
  return this.updateOne(updates);
};

// Virtual: isActive
userSchema.virtual('isActive').get(function () {
  return !this.isBanned && this.isEmailVerified;
});

// Virtual: planActive
userSchema.virtual('planActive').get(function () {
  if (this.plan === 'free') return true;
  return this.planExpiry && this.planExpiry > new Date();
});

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.twoFactorSecret;
    delete ret.emailVerificationToken;
    delete ret.passwordResetToken;
    delete ret.refreshTokens;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
