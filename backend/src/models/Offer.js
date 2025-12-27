import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    offerType: {
      type: String,
      enum: ['percentage', 'fixed', 'bogo', 'bundle', 'seasonal'],
      default: 'percentage',
    },
    offerValue: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    productName: {
      type: String,
      default: '',
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
    },
    image: {
      type: String,
      default: '',
    },
    code: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    terms: {
      type: String,
      default: '',
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    createdBy: {
      type: String,
      // Stores the vendorId string for reference
      required: true,
    },
    appliedCount: {
      type: Number,
      default: 0,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Index for faster queries
offerSchema.index({ vendorId: 1 });
offerSchema.index({ isActive: 1, endDate: 1 });
offerSchema.index({ code: 1 });
offerSchema.index({ approvalStatus: 1 });

export const Offer = mongoose.model('Offer', offerSchema);
