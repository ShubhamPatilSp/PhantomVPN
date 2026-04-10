/**
 * Settings model — persists admin platform settings to the database.
 * Singleton pattern: only one settings document should exist.
 */
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'PhantomVPN',
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  registrationEnabled: {
    type: Boolean,
    default: true,
  },
  freeDataLimitGB: {
    type: Number,
    default: 10,
  },
  referralRewardDays: {
    type: Number,
    default: 30,
  },
  maxFreeDevices: {
    type: Number,
    default: 1,
  },
  maxProDevices: {
    type: Number,
    default: 6,
  },
  maxBusinessDevices: {
    type: Number,
    default: 10,
  },
  minimumPasswordLength: {
    type: Number,
    default: 8,
  },
  emailVerificationRequired: {
    type: Boolean,
    default: true,
  },
  smtpEnabled: {
    type: Boolean,
    default: true,
  },
  privacyPolicyUrl: {
    type: String,
    default: '/privacy',
  },
  termsUrl: {
    type: String,
    default: '/terms',
  },
  supportEmail: {
    type: String,
    default: 'support@phantomvpn.com',
  },
}, {
  timestamps: true,
});

/**
 * Get the singleton settings document (creates one if it doesn't exist).
 */
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

/**
 * Update settings (upsert).
 */
settingsSchema.statics.updateSettings = async function (updates) {
  const settings = await this.findOneAndUpdate(
    {},
    updates,
    { new: true, upsert: true, runValidators: true }
  );
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
