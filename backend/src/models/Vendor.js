import mongoose from 'mongoose';
import { hashPassword } from '../utils/password.js';

const vendorSchema = new mongoose.Schema(
  {
    vendorId: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      // Format: VEN-YYYYMMDD-XXXXX (auto-generated)
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
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
    ownerFirstName: {
      type: String,
      required: true,
      default: '',
    },
    ownerLastName: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    businessLogo: {
      type: String,
      default: '',
    },
    businessDescription: {
      type: String,
      default: '',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'pending-verification'],
      default: 'pending-verification',
    },
    businessDocument: {
      type: String,
      default: '',
    },
    businessDocumentFileName: {
      type: String,
      default: '',
    },
    businessDocumentUploadedAt: {
      type: Date,
      default: null,
    },
    documentVerified: {
      type: Boolean,
      default: false,
    },
    businessPhone: {
      type: String,
      default: '',
    },
    businessAddress: {
      type: String,
      default: '',
    },
    businessCity: {
      type: String,
      default: '',
    },
    businessState: {
      type: String,
      default: '',
    },
    businessZipCode: {
      type: String,
      default: '',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Hash password before saving
vendorSchema.pre('save', async function (next) {
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

// Auto-generate vendorId before saving (if not already set)
vendorSchema.pre('save', async function (next) {
  if (!this.vendorId) {
    try {
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      const count = await mongoose.model('Vendor').countDocuments();
      const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      this.vendorId = `VEN-${dateStr}-${randomNum}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

export const Vendor = mongoose.model('Vendor', vendorSchema);
