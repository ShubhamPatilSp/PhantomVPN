const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  flag: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
    uppercase: true,
    length: 2,
  },
  region: {
    type: String,
    enum: ['americas', 'europe', 'asia', 'africa', 'oceania', 'middleeast'],
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
  port: {
    type: Number,
    default: 51820,
  },
  publicKey: {
    type: String,
    default: null,
  },
  load: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  ping: {
    type: Number,
    default: 0,
  },
  isOnline: {
    type: Boolean,
    default: true,
  },
  isObfuscated: {
    type: Boolean,
    default: false,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  supportsP2P: {
    type: Boolean,
    default: false,
  },
  supportsStreaming: {
    type: Boolean,
    default: false,
  },
  supportsTor: {
    type: Boolean,
    default: false,
  },
  maxCapacity: {
    type: Number,
    default: 1000,
  },
  currentConnections: {
    type: Number,
    default: 0,
  },
  bandwidth: {
    upload: { type: Number, default: 0 },
    download: { type: Number, default: 0 },
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  speedMbps: {
    type: Number,
    default: 10000,
  },
}, {
  timestamps: true,
});

serverSchema.index({ country: 1 });
serverSchema.index({ region: 1 });
serverSchema.index({ isOnline: 1 });
serverSchema.index({ load: 1 });

serverSchema.virtual('loadPercentage').get(function () {
  return Math.round((this.currentConnections / this.maxCapacity) * 100);
});

module.exports = mongoose.model('Server', serverSchema);
