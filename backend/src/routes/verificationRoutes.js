import express from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middleware/auth.js';
import {
  sendVerificationEmail,
  verifyEmail,
  resendVerificationEmail,
  uploadStudentId,
  getVerificationStatus,
} from '../controllers/verificationController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/student-ids/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'student-id-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and PDFs are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Route names matching frontend API calls
router.post('/send-code', sendVerificationEmail);
router.post('/send-email', sendVerificationEmail); // Keep for backwards compatibility
router.post('/verify-code', verifyEmail);
router.post('/verify-email', verifyEmail); // Keep for backwards compatibility
router.post('/resend-email', resendVerificationEmail);

// Get verification status
router.get('/status', authMiddleware, getVerificationStatus);
router.get('/:userId/status', getVerificationStatus);

// File upload route - single file with field name 'studentId'
router.post('/upload-student-id', authMiddleware, upload.single('studentId'), uploadStudentId);

export default router;
