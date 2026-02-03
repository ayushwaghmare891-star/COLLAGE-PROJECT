import express from 'express';
import {
  signup,
  unifiedLogin,
  studentLogin,
  vendorLogin,
  adminLogin,
  getCurrentUser,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import Student from '../models/Student.js';

const router = express.Router();

// Auth routes
router.post('/register', signup);
router.post('/login', unifiedLogin);  // New unified login endpoint
router.post('/student/login', studentLogin);
router.post('/vendor/login', vendorLogin);
router.post('/admin/login', adminLogin);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, updateProfile);
router.post('/change-password', authenticateToken, changePassword);
router.delete('/account', authenticateToken, deleteAccount);

// Get student verification and approval status (real-time)
router.get('/student/status', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('-password');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      verificationStatus: student.verificationStatus,
      approvalStatus: student.approvalStatus,
      isVerified: student.isVerified,
      verificationDocuments: student.verificationDocuments,
      approvedAt: student.approvedAt,
      message: 'Status fetched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch status',
      error: error.message
    });
  }
});

export default router;
