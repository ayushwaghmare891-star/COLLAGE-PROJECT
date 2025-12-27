import { Admin } from '../models/User.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

// Admin Registration - Only for authorized admins (typically created by system)
export const adminRegister = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

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

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    if (existingAdmin) {
      if (existingAdmin.email === email) {
        return res.status(409).json({ message: 'Admin email already registered' });
      }
      if (existingAdmin.username === username) {
        return res.status(409).json({ message: 'Admin username already taken' });
      }
    }

    // Create new admin
    const admin = new Admin({
      username,
      email,
      password,
      firstName,
      lastName,
      role: 'admin',
    });

    await admin.save();

    const token = generateToken(admin._id);

    res.status(201).json({
      message: 'Admin registered successfully',
      token,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: 'admin',
        adminId: admin.adminId,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map(err => err.message)
        .join(', ');
      return res.status(400).json({ message: 'Validation failed', error: messages });
    }
    res.status(500).json({ message: 'Admin registration failed', error: error.message });
  }
};

// Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Check admin status
    if (admin.status === 'suspended') {
      return res.status(403).json({ message: 'Your admin account has been suspended' });
    }

    if (admin.status === 'inactive') {
      return res.status(403).json({ message: 'Your admin account is inactive' });
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = generateToken(admin._id);

    // Update admin online status and last login
    await Admin.findByIdAndUpdate(admin._id, {
      isOnline: true,
      lastLogin: new Date(),
    });

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: 'admin',
        adminId: admin.adminId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Admin login failed', error: error.message });
  }
};

// Admin Logout
export const adminLogout = async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (adminId) {
      await Admin.findByIdAndUpdate(adminId, {
        isOnline: false,
      });
    }
    res.json({ message: 'Admin logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (userId) {
      // Mark user as offline
      await User.findByIdAndUpdate(userId, { isOnline: false });
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};
