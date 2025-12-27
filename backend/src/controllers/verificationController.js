import nodemailer from 'nodemailer';
import { User, Admin } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Vendor } from '../models/Vendor.js';

// Create transporter - use test account if credentials not available
let transporter;

const initializeTransporter = async () => {
  if (process.env.MAILTRAP_USER && process.env.MAILTRAP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST || 'smtp.mailtrap.io',
      port: process.env.MAILTRAP_PORT || 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  } else {
    // Use Ethereal test account for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

await initializeTransporter();

export const sendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Search across all user types
    let user = await User.findOne({ email });
    if (!user) {
      user = await Admin.findOne({ email });
    }
    if (!user) {
      user = await Student.findOne({ email });
    }
    if (!user) {
      user = await Vendor.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // TODO: Save verification code to database with expiry (implement VerificationCode model)
    // await VerificationCode.create({ userId: user._id, code: verificationCode, expiresAt: new Date(Date.now() + 10 * 60 * 1000) })

    // Send email
    const mailOptions = {
      from: process.env.MAILTRAP_FROM || 'noreply@collage.com',
      to: email,
      subject: 'Email Verification - Collage',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #333;">Verify Your Email</h2>
            <p style="color: #666; font-size: 16px;">Your verification code is:</p>
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb;">${verificationCode}</span>
            </div>
            <p style="color: #999; font-size: 14px;">This code expires in 10 minutes.</p>
            <p style="color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              If you didn't request this verification code, please ignore this email.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    // Log preview URL for test accounts
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    res.json({ 
      message: 'Verification email sent successfully',
      code: verificationCode, // For testing only - remove in production
      previewUrl: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl(info) : undefined
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ 
      message: 'Error sending verification email', 
      error: error.message 
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    // TODO: Implement proper verification code validation with database
    // const verification = await VerificationCode.findOne({ code, expiresAt: { $gt: new Date() } })
    // if (!verification) {
    //   return res.status(400).json({ message: 'Invalid or expired verification code' })
    // }

    // Try to verify user across all types
    let user = await User.findOneAndUpdate(
      { email },
      { isEmailVerified: true },
      { new: true }
    ).select('-password');

    if (!user) {
      user = await Admin.findOneAndUpdate(
        { email },
        { isEmailVerified: true },
        { new: true }
      ).select('-password');
    }

    if (!user) {
      user = await Student.findOneAndUpdate(
        { email },
        { isEmailVerified: true },
        { new: true }
      ).select('-password');
    }

    if (!user) {
      user = await Vendor.findOneAndUpdate(
        { email },
        { isEmailVerified: true },
        { new: true }
      ).select('-password');
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Email verified successfully', 
      success: true,
      user 
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ 
      message: 'Error verifying email', 
      error: error.message 
    });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Search across all user types
    let user = await User.findOne({ email });
    if (!user) {
      user = await Admin.findOne({ email });
    }
    if (!user) {
      user = await Student.findOne({ email });
    }
    if (!user) {
      user = await Vendor.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const mailOptions = {
      from: process.env.MAILTRAP_FROM || 'noreply@collage.com',
      to: email,
      subject: 'Email Verification - Collage (Resend)',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #333;">Verify Your Email</h2>
            <p style="color: #666; font-size: 16px;">Your verification code is:</p>
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb;">${verificationCode}</span>
            </div>
            <p style="color: #999; font-size: 14px;">This code expires in 10 minutes.</p>
            <p style="color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              If you didn't request this verification code, please ignore this email.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    res.json({ 
      message: 'Verification email resent successfully',
      code: verificationCode, // For testing only - remove in production
      previewUrl: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl(info) : undefined
    });
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({ 
      message: 'Error resending verification email', 
      error: error.message 
    });
  }
};

export const uploadStudentId = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.userId; // From auth middleware
    const fileName = req.file.filename || `student-id-${userId}-${Date.now()}`;
    const filePath = req.file.path || `/uploads/${fileName}`;
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(mimeType)) {
      return res.status(400).json({ message: 'Invalid file type. Only images and PDFs are allowed' });
    }

    // Search across all user types to find the user
    let user = await User.findByIdAndUpdate(
      userId,
      {
        studentIdDocument: filePath,
        studentIdFileName: fileName,
        studentIdUploadedAt: new Date(),
        isEmailVerified: true,
      },
      { new: true }
    ).select('-password');

    if (!user) {
      user = await Student.findByIdAndUpdate(
        userId,
        {
          studentIdDocument: filePath,
          studentIdFileName: fileName,
          studentIdUploadedAt: new Date(),
          isEmailVerified: true,
        },
        { new: true }
      ).select('-password');
    }

    if (!user) {
      user = await Vendor.findByIdAndUpdate(
        userId,
        {
          studentIdDocument: filePath,
          studentIdFileName: fileName,
          studentIdUploadedAt: new Date(),
        },
        { new: true }
      ).select('-password');
    }

    if (!user) {
      user = await Admin.findByIdAndUpdate(
        userId,
        {
          studentIdDocument: filePath,
          studentIdFileName: fileName,
          studentIdUploadedAt: new Date(),
        },
        { new: true }
      ).select('-password');
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(201).json({
      message: 'Student ID uploaded successfully',
      success: true,
      user,
      file: {
        fileName,
        filePath,
        fileSize,
        uploadedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error uploading student ID:', error);
    res.status(500).json({
      message: 'Error uploading student ID',
      error: error.message,
    });
  }
};
// Get verification status for a student
export const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Search in Student collection first
    let student = await Student.findById(userId).select('studentId isEmailVerified documentVerified studentIdUploadedAt');
    
    if (student) {
      return res.status(200).json({
        success: true,
        verificationStatus: student.documentVerified ? 'verified' : student.studentIdUploadedAt ? 'pending' : 'not-verified',
        isVerified: student.documentVerified,
        isEmailVerified: student.isEmailVerified,
        documentVerified: student.documentVerified,
        uploadedAt: student.studentIdUploadedAt,
      });
    }

    // If not found in Student, try User collection
    const user = await User.findById(userId).select('isEmailVerified studentIdDocument studentIdUploadedAt');
    
    if (user) {
      return res.status(200).json({
        success: true,
        verificationStatus: user.studentIdDocument ? 'pending' : 'not-verified',
        isVerified: false,
        isEmailVerified: user.isEmailVerified,
        documentVerified: !!user.studentIdDocument,
        uploadedAt: user.studentIdUploadedAt,
      });
    }

    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  } catch (error) {
    console.error('Error getting verification status:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting verification status',
      error: error.message,
    });
  }
};