import mongoose from 'mongoose';

const verificationDocumentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  documentType: {
    type: String,
    enum: [
      'student_id',
      'enrollment_letter',
      'transcript',
      'business_license',
      'pan',
      'aadhar',
      'passport',
      'other'
    ],
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: String,
  fileSize: Number,
  mimeType: String,
  cloudinaryPublicId: String, // For tracking uploaded file on Cloudinary
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  rejectionReason: String,
  remarks: String,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('VerificationDocument', verificationDocumentSchema);
