import mongoose from 'mongoose';

const loginSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  ipAddress: String,
  userAgent: String,
  deviceInfo: {
    browser: String,
    os: String,
    device: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  loginTime: {
    type: Date,
    default: Date.now,
  },
  logoutTime: Date,
  expiryTime: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  },
  lastActivityTime: {
    type: Date,
    default: Date.now,
  },
  loginStatus: {
    type: String,
    enum: ['success', 'failed'],
    required: true,
  },
  loginAttempt: {
    type: Number,
    default: 1,
  },
  failureReason: String, // Stores reason if login failed
  location: {
    city: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
});

// Index for efficient queries
loginSessionSchema.index({ user: 1, loginTime: -1 });
loginSessionSchema.index({ email: 1, loginTime: -1 });
loginSessionSchema.index({ expiryTime: 1 });

export default mongoose.model('LoginSession', loginSessionSchema);
