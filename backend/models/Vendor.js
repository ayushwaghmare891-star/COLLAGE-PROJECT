import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'vendor',
    enum: ['vendor'],
  },
  
  // Document verification status
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  
  // Admin approval status
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  approvalRemarks: String,
  approvedAt: Date,
  
  verificationDocuments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VerificationDocument',
  }],
  
  isActive: {
    type: Boolean,
    default: true,
  },
  isSuspended: {
    type: Boolean,
    default: false,
  },
  suspensionReason: String,
  
  // Vendor specific fields
  businessName: {
    type: String,
    required: true,
  },
  businessType: String,
  businessRegistration: String,
  gstNumber: String,
  businessEmail: String,
  businessAddress: String,
  
  // Contact information
  mobileNumber: String,
  phoneNumber: String,
  city: String,
  state: String,
  
  // Profile
  businessLogo: String,
  businessDescription: String,
  website: String,
  
  // Account metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0,
  },
  
  // Offers and discounts
  offers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
  }],
  
  // Coupons
  coupons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
  }],
});

// Update the updatedAt field before saving
vendorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Vendor', vendorSchema);
