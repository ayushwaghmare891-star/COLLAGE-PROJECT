import mongoose from 'mongoose';
import { hashPassword } from '../utils/password.js';

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      // Format: STU-YYYYMMDD-XXXXX (auto-generated)
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: {
      type: String,
      default: '',
    },
    lastName: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    studentIdDocument: {
      type: String,
      default: '',
    },
    studentIdFileName: {
      type: String,
      default: '',
    },
    studentIdUploadedAt: {
      type: Date,
      default: null,
    },
    documentVerified: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    college: {
      type: String,
      default: '',
    },
    enrollmentYear: {
      type: Number,
      default: null,
    },
    redeemedOffers: [
      {
        offerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Offer',
        },
        code: String,
        redeemedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    this.password = await hashPassword(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

// Auto-generate studentId before saving (if not already set)
studentSchema.pre('save', async function (next) {
  if (!this.studentId) {
    try {
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      const count = await mongoose.model('Student').countDocuments();
      const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      this.studentId = `STU-${dateStr}-${randomNum}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

export const Student = mongoose.model('Student', studentSchema);
