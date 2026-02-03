import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Verify student is approved by admin before accessing protected routes
export const verifyStudentApproval = async (req, res, next) => {
  try {
    // Only apply to students
    if (req.user.role !== 'student') {
      return next();
    }

    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if student is verified by admin
    if (!student.isVerified || student.verificationStatus !== 'verified') {
      return res.status(403).json({
        message: 'Your account is pending admin verification. Please wait for admin approval.',
        verificationStatus: student.verificationStatus,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Verification check failed', error: error.message });
  }
};

export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Insufficient permissions for this action' });
    }

    next();
  };
};