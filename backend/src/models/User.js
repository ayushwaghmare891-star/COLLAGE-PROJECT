import mongoose from 'mongoose';
import { hashPassword } from '../utils/password.js';

// Admin Schema - For administrative users only
const adminSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      // Format: ADM-YYYYMMDD-XXXXX (auto-generated)
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
      required: true,
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
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    permissions: {
      type: [String],
      default: ['manage_users', 'manage_vendors', 'manage_students', 'view_analytics'],
    },
  },
  { timestamps: true }
);

// Hash password before saving
adminSchema.pre('save', async function (next) {
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

// Auto-generate adminId before saving (if not already set)
adminSchema.pre('save', async function (next) {
  if (!this.adminId) {
    try {
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      const count = await mongoose.model('Admin').countDocuments();
      const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      this.adminId = `ADM-${dateStr}-${randomNum}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Regular User Schema - For general users
const userSchema = new mongoose.Schema(
  {
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
    role: {
      type: String,
      enum: ['user'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
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

export const Admin = mongoose.model('Admin', adminSchema);
export const User = mongoose.model('User', userSchema);
