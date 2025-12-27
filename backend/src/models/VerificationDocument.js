import mongoose from 'mongoose';

const verificationDocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userType: {
      type: String,
      enum: ['student', 'vendor'],
      required: true,
    },
    documentType: {
      type: String,
      enum: ['student-id', 'business-license', 'aadhar', 'pan', 'passport', 'other'],
      required: true,
    },
    documentPath: {
      type: String,
      required: true,
    },
    documentFileName: {
      type: String,
      required: true,
    },
    documentSize: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: '',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
verificationDocumentSchema.index({ userId: 1, userType: 1 });
verificationDocumentSchema.index({ status: 1 });
verificationDocumentSchema.index({ uploadedAt: -1 });

export const VerificationDocument = mongoose.model('VerificationDocument', verificationDocumentSchema);
