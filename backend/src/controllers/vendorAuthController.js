import { Vendor } from '../models/Vendor.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

export const vendorRegister = async (req, res) => {
  try {
    const { 
      businessName, 
      email, 
      password, 
      ownerFirstName, 
      ownerLastName,
      businessPhone,
      businessAddress,
      businessCity,
      businessState,
      businessZipCode,
      businessDescription
    } = req.body;

    // Validate input
    if (!businessName || !email || !password || !ownerFirstName) {
      return res.status(400).json({ message: 'Please provide business name, email, password, and owner name' });
    }

    // Validate owner name length
    if (ownerFirstName.trim().length < 3) {
      return res.status(400).json({ message: 'Owner first name must be at least 3 characters long' });
    }

    // Validate business name length
    if (businessName.trim().length < 2) {
      return res.status(400).json({ message: 'Business name must be at least 2 characters long' });
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

    // Check if vendor exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(409).json({ message: 'Vendor account already exists with this email' });
    }

    // Create new vendor (password will be hashed by pre-save hook)
    const vendor = new Vendor({
      businessName,
      email,
      password,
      ownerFirstName,
      ownerLastName,
      businessPhone,
      businessAddress,
      businessCity,
      businessState,
      businessZipCode,
      businessDescription,
      approvalStatus: 'approved', // Auto-approve vendors for testing
      status: 'active', // Set to active for testing
    });

    await vendor.save();

    const token = generateToken(vendor._id);

    res.status(201).json({
      message: 'Vendor registered successfully. Please upload business verification documents.',
      token,
      user: {
        id: vendor._id,
        vendorId: vendor.vendorId,
        businessName: vendor.businessName,
        email: vendor.email,
        ownerFirstName: vendor.ownerFirstName,
        ownerLastName: vendor.ownerLastName,
        status: vendor.status,
        type: 'vendor',
      },
      requiresDocumentVerification: true,
      documentUploadUrl: '/api/verification/upload-vendor-document',
      verificationStatus: 'pending',
    });
  } catch (error) {
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map(err => err.message)
        .join(', ');
      return res.status(400).json({ message: 'Validation failed', error: messages });
    }
    res.status(500).json({ message: 'Vendor registration failed', error: error.message });
  }
};

export const vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find vendor
    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if vendor is approved by admin
    if (vendor.approvalStatus === 'pending') {
      return res.status(403).json({ 
        message: 'Your vendor account is pending admin approval. Please wait for verification.' 
      });
    }

    if (vendor.approvalStatus === 'rejected') {
      return res.status(403).json({ 
        message: 'Your vendor account has been rejected. Reason: ' + (vendor.rejectionReason || 'Not specified'),
        rejectionReason: vendor.rejectionReason
      });
    }

    // Check if vendor account is active or pending verification
    if (vendor.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended' });
    }

    if (vendor.status === 'inactive') {
      return res.status(403).json({ message: 'Your account is inactive. Please contact support.' });
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, vendor.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(vendor._id);

    // Update vendor online status and last login
    await Vendor.findByIdAndUpdate(vendor._id, {
      isOnline: true,
      lastLogin: new Date(),
    });

    res.json({
      message: 'Vendor login successful',
      token,
      user: {
        id: vendor._id,
        vendorId: vendor.vendorId,
        businessName: vendor.businessName,
        email: vendor.email,
        ownerFirstName: vendor.ownerFirstName,
        ownerLastName: vendor.ownerLastName,
        status: vendor.status,
        type: 'vendor',
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Vendor login failed', error: error.message });
  }
};

export const vendorLogout = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (userId) {
      // Mark vendor as offline
      await Vendor.findByIdAndUpdate(userId, { isOnline: false });
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};
