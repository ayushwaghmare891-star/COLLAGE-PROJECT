import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  email: {
    type: String,
    lowercase: true,
    sparse: true,
  },
  phone: {
    type: String,
    sparse: true,
  },
  otp: {
    type: String,
    required: true,
  },
  otpType: {
    type: String,
    enum: ['email', 'phone', 'both'],
    default: 'email',
  },
  purpose: {
    type: String,
    enum: ['signup', 'login', 'password-reset', 'email-verification', 'phone-verification'],
    default: 'email-verification',
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5, // Maximum 5 attempts before lockout
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  lastResendAt: {
    type: Date,
    default: null,
  },
  resendCount: {
    type: Number,
    default: 0,
    max: 3, // Maximum 3 resends
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-delete expired OTPs (TTL index)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Hash OTP before saving (security improvement)
otpSchema.pre('save', async function (next) {
  if (this.isModified('otp')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.otp = await bcrypt.hash(this.otp, salt);
    } catch (error) {
      return next(error);
    }
  }
  this.updatedAt = new Date();
  next();
});

// Method to compare OTP
otpSchema.methods.compareOtp = async function (plainOtp) {
  try {
    return await bcrypt.compare(plainOtp, this.otp);
  } catch (error) {
    console.error('Error comparing OTP:', error);
    return false;
  }
};

// Method to check if OTP is expired
otpSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

// Method to check if max attempts reached
otpSchema.methods.maxAttemptsReached = function () {
  return this.attempts >= 5;
};

// Method to check if resend is allowed (minimum 60 seconds between resends)
otpSchema.methods.canResend = function () {
  if (this.resendCount >= 3) {
    return false; // Max 3 resends allowed
  }
  if (!this.lastResendAt) {
    return true; // First resend
  }
  const timeSinceLastResend = Date.now() - this.lastResendAt.getTime();
  return timeSinceLastResend >= 60000; // 60 seconds
};

export default mongoose.model('Otp', otpSchema);
