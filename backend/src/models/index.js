const mongoose = require('mongoose');

// Connection model
const connectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  serverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server',
    required: true,
  },
  connectedAt: {
    type: Date,
    default: Date.now,
  },
  disconnectedAt: {
    type: Date,
    default: null,
  },
  duration: {
    type: Number,
    default: 0,
  },
  dataUploaded: {
    type: Number,
    default: 0,
  },
  dataDownloaded: {
    type: Number,
    default: 0,
  },
  clientIp: {
    type: String,
    default: null,
  },
  protocol: {
    type: String,
    enum: ['wireguard', 'openvpn', 'ikev2'],
    default: 'wireguard',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

connectionSchema.index({ userId: 1, connectedAt: -1 });
connectionSchema.index({ serverId: 1 });

// Plan model
const planSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['free', 'pro', 'business'],
    required: true,
    unique: true,
  },
  displayName: String,
  price: {
    monthly: { type: Number, default: 0 },
    yearly: { type: Number, default: 0 },
  },
  features: [String],
  maxDevices: { type: Number, default: 1 },
  maxDataGB: { type: Number, default: 10 },
  maxSpeedMbps: { type: Number, default: 100 },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

// BlogPost model
const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  author: { type: String, default: 'PhantomVPN Team' },
  category: {
    type: String,
    enum: ['guides', 'security', 'privacy', 'streaming', 'news', 'comparisons'],
    default: 'guides',
  },
  tags: [String],
  coverImage: { type: String, default: null },
  readingTime: { type: Number, default: 5 },
  isPublished: { type: Boolean, default: true },
  publishedAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
}, { timestamps: true });

blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ isPublished: 1, publishedAt: -1 });

// Notification model
const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['security', 'plan', 'usage', 'referral', 'system', 'login'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  link: { type: String, default: null },
}, { timestamps: true });

notificationSchema.index({ userId: 1, isRead: 1 });

// Referral model
const referralSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'converted'],
    default: 'pending',
  },
  rewardGiven: { type: Boolean, default: false },
  rewardDays: { type: Number, default: 30 },
}, { timestamps: true });

// AuditLog model
const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  action: { type: String, required: true },
  ip: String,
  userAgent: String,
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });

module.exports = {
  Connection: mongoose.model('Connection', connectionSchema),
  Plan: mongoose.model('Plan', planSchema),
  BlogPost: mongoose.model('BlogPost', blogPostSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  Referral: mongoose.model('Referral', referralSchema),
  AuditLog: mongoose.model('AuditLog', auditLogSchema),
};
