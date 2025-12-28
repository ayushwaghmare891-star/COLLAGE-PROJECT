import { Student } from '../models/Student.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

export const studentRegister = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, college, enrollmentYear, role } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email, and password' });
    }

    // Validate username length
    if (username.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Check if student exists
    const existingStudent = await Student.findOne({ $or: [{ email }, { username }] });
    if (existingStudent) {
      if (existingStudent.email === email) {
        return res.status(409).json({ message: 'Email already registered' });
      }
      if (existingStudent.username === username) {
        return res.status(409).json({ message: 'Username already taken' });
      }
    }

    // Create new student (password will be hashed by pre-save hook)
    const student = new Student({
      username,
      email,
      password,
      firstName,
      lastName,
      college,
      enrollmentYear,
      role: role || 'student', // Default to 'student' if role not provided
      approvalStatus: 'approved', // Auto-approve students on registration so they can access offers immediately
    });

    await student.save();

    const token = generateToken(student._id);

    res.status(201).json({
      message: 'Student registered successfully. You can now browse and redeem offers!',
      token,
      user: {
        id: student._id,
        studentId: student.studentId,
        username: student.username,
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName,
        type: 'student',
      },
      verificationStatus: 'verified',
      canAccessOffers: true,
    });
  } catch (error) {
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map(err => err.message)
        .join(', ');
      return res.status(400).json({ message: 'Validation failed', error: messages });
    }
    res.status(500).json({ message: 'Student registration failed', error: error.message });
  }
};

export const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find student
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if student is approved by admin
    if (student.approvalStatus === 'pending') {
      return res.status(403).json({ 
        message: 'Your account is pending admin approval. Please wait for verification.' 
      });
    }

    if (student.approvalStatus === 'rejected') {
      return res.status(403).json({ 
        message: 'Your account has been rejected. Reason: ' + (student.rejectionReason || 'Not specified'),
        rejectionReason: student.rejectionReason
      });
    }

    // Check if student account is active
    if (student.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended' });
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(student._id);

    // Update student online status and last login
    await Student.findByIdAndUpdate(student._id, {
      isOnline: true,
      lastLogin: new Date(),
    });

    res.json({
      message: 'Student login successful',
      token,
      user: {
        id: student._id,
        studentId: student.studentId,
        username: student.username,
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName,
        role: student.role,
        isEmailVerified: student.isEmailVerified,
        approvalStatus: student.approvalStatus,
        verificationStatus: student.approvalStatus === 'approved' ? 'verified' : 'pending',
        permissions: student.permissions || [],
        savedOffersCount: student.savedOffers ? student.savedOffers.length : 0,
        redeemedOffersCount: student.redeemedOffers ? student.redeemedOffers.length : 0,
      },
      canAccessOffers: student.approvalStatus === 'approved',
    });
  } catch (error) {
    res.status(500).json({ message: 'Student login failed', error: error.message });
  }
};

export const studentLogout = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (userId) {
      // Mark student as offline
      await Student.findByIdAndUpdate(userId, { isOnline: false });
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};
