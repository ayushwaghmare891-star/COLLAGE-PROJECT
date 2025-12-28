import nodemailer from 'nodemailer';
import { User, Admin } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Vendor } from '../models/Vendor.js';
import { VerificationDocument } from '../models/VerificationDocument.js';

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
    let student = await Student.findById(userId).select('studentId isEmailVerified documentVerified approvalStatus studentIdUploadedAt');
    
    if (student) {
      // Check approvalStatus first - if approved, status is verified
      let verificationStatus = 'not-verified';
      if (student.approvalStatus === 'approved') {
        verificationStatus = 'verified';
      } else if (student.approvalStatus === 'pending' || student.studentIdUploadedAt) {
        verificationStatus = 'pending';
      }
      
      return res.status(200).json({
        success: true,
        verificationStatus: verificationStatus,
        isVerified: student.approvalStatus === 'approved' || student.documentVerified,
        isEmailVerified: student.isEmailVerified,
        documentVerified: student.documentVerified,
        approvalStatus: student.approvalStatus,
        uploadedAt: student.studentIdUploadedAt,
      });
    }

    // Try User collection (general users)
    let user = await User.findById(userId).select('isEmailVerified studentIdDocument studentIdUploadedAt');
    
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

    // Try Admin collection
    const admin = await Admin.findById(userId).select('isEmailVerified');
    if (admin) {
      return res.status(200).json({
        success: true,
        verificationStatus: 'verified',
        isVerified: true,
        isEmailVerified: admin.isEmailVerified,
        documentVerified: false,
        uploadedAt: null,
      });
    }

    // Try Vendor collection
    const vendor = await Vendor.findById(userId).select('isEmailVerified');
    if (vendor) {
      return res.status(200).json({
        success: true,
        verificationStatus: 'verified',
        isVerified: true,
        isEmailVerified: vendor.isEmailVerified,
        documentVerified: false,
        uploadedAt: null,
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

// Upload document for student verification
export const uploadStudentDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.userId; // From auth middleware
    const { documentType = 'student-id' } = req.body;

    // Validate document type
    const validDocTypes = ['student-id', 'aadhar', 'passport', 'other'];
    if (!validDocTypes.includes(documentType)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Only images and PDFs are allowed' });
    }

    // Check if student exists
    const student = await Student.findById(userId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const fileName = req.file.filename || `student-${userId}-${Date.now()}`;
    const filePath = `/uploads/documents/${fileName}`;

    // Create verification document record
    const verificationDoc = new VerificationDocument({
      userId,
      userType: 'student',
      documentType,
      documentPath: filePath,
      documentFileName: fileName,
      documentSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'pending',
    });

    await verificationDoc.save();

    // Update student with document reference and set approval status to pending
    await Student.findByIdAndUpdate(userId, {
      studentIdDocument: filePath,
      studentIdFileName: fileName,
      studentIdUploadedAt: new Date(),
      approvalStatus: 'pending', // Student is now requesting verification
    });

    res.status(201).json({
      message: 'Student document uploaded successfully and is pending verification',
      success: true,
      verificationDocument: {
        id: verificationDoc._id,
        status: verificationDoc.status,
        uploadedAt: verificationDoc.uploadedAt,
      },
      file: {
        fileName,
        filePath,
        fileSize: req.file.size,
      },
    });
  } catch (error) {
    console.error('Error uploading student document:', error);
    res.status(500).json({
      message: 'Error uploading student document',
      error: error.message,
    });
  }
};

// Upload document for vendor verification
export const uploadVendorDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.userId; // From auth middleware
    const { documentType = 'business-license' } = req.body;

    // Validate document type
    const validDocTypes = ['business-license', 'pan', 'aadhar', 'other'];
    if (!validDocTypes.includes(documentType)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Only images and PDFs are allowed' });
    }

    // Check if vendor exists
    const vendor = await Vendor.findById(userId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const fileName = req.file.filename || `vendor-${userId}-${Date.now()}`;
    const filePath = `/uploads/documents/${fileName}`;

    // Create verification document record
    const verificationDoc = new VerificationDocument({
      userId,
      userType: 'vendor',
      documentType,
      documentPath: filePath,
      documentFileName: fileName,
      documentSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'pending',
    });

    await verificationDoc.save();

    // Update vendor with document reference and set status to pending-verification
    await Vendor.findByIdAndUpdate(userId, {
      businessDocument: filePath,
      businessDocumentFileName: fileName,
      businessDocumentUploadedAt: new Date(),
      status: 'pending-verification',
    });

    res.status(201).json({
      message: 'Vendor document uploaded successfully and is pending verification',
      success: true,
      verificationDocument: {
        id: verificationDoc._id,
        status: verificationDoc.status,
        uploadedAt: verificationDoc.uploadedAt,
      },
      file: {
        fileName,
        filePath,
        fileSize: req.file.size,
      },
    });
  } catch (error) {
    console.error('Error uploading vendor document:', error);
    res.status(500).json({
      message: 'Error uploading vendor document',
      error: error.message,
    });
  }
};

// Get all pending verification documents for admin
export const getPendingDocuments = async (req, res) => {
  try {
    const { userType = 'all', page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let filter = { status: 'pending' };
    
    if (userType !== 'all') {
      filter.userType = userType; // 'student' or 'vendor'
    }

    const pendingDocuments = await VerificationDocument.find(filter)
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'username email businessName ownerFirstName studentId vendorId')
      .lean();

    const total = await VerificationDocument.countDocuments(filter);

    // Enrich documents with user details
    const enrichedDocuments = await Promise.all(
      pendingDocuments.map(async (doc) => {
        let userDetails = {};
        if (doc.userType === 'student') {
          const student = await Student.findById(doc.userId, 'username email firstName lastName studentId college').lean();
          userDetails = {
            name: `${student?.firstName || ''} ${student?.lastName || ''}`.trim() || student?.username,
            email: student?.email,
            studentId: student?.studentId,
            college: student?.college,
          };
        } else if (doc.userType === 'vendor') {
          const vendor = await Vendor.findById(doc.userId, 'businessName email ownerFirstName ownerLastName vendorId').lean();
          userDetails = {
            name: vendor?.businessName,
            ownerName: `${vendor?.ownerFirstName || ''} ${vendor?.ownerLastName || ''}`.trim(),
            email: vendor?.email,
            vendorId: vendor?.vendorId,
          };
        }
        return { ...doc, userDetails };
      })
    );

    res.json({
      message: 'Pending verification documents fetched successfully',
      documents: enrichedDocuments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching pending documents:', error);
    res.status(500).json({
      message: 'Error fetching pending documents',
      error: error.message,
    });
  }
};

// Verify/approve a document
export const verifyDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { status, remarks } = req.body; // status: 'verified' or 'rejected'
    const adminId = req.userId; // From auth middleware

    // Validate status
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "verified" or "rejected"' });
    }

    // Find and update verification document
    const verificationDoc = await VerificationDocument.findByIdAndUpdate(
      documentId,
      {
        status,
        verifiedBy: adminId,
        verifiedAt: new Date(),
        remarks: remarks || '',
      },
      { new: true }
    );

    if (!verificationDoc) {
      return res.status(404).json({ message: 'Verification document not found' });
    }

    // Update user based on status
    if (verificationDoc.userType === 'student') {
      await Student.findByIdAndUpdate(verificationDoc.userId, {
        documentVerified: status === 'verified',
        // Set approval status based on document verification
        approvalStatus: status === 'verified' ? 'approved' : 'rejected',
      });
    } else if (verificationDoc.userType === 'vendor') {
      const newStatus = status === 'verified' ? 'active' : 'pending-verification';
      await Vendor.findByIdAndUpdate(verificationDoc.userId, {
        documentVerified: status === 'verified',
        status: newStatus,
      });
    }

    res.json({
      message: `Document ${status} successfully`,
      success: true,
      verificationDocument: verificationDoc,
    });
  } catch (error) {
    console.error('Error verifying document:', error);
    res.status(500).json({
      message: 'Error verifying document',
      error: error.message,
    });
  }
};

// Approve verification document
export const approveVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;

    // Find the verification document
    const verificationDoc = await VerificationDocument.findById(id);
    
    if (!verificationDoc) {
      return res.status(404).json({ message: 'Verification document not found' });
    }

    // Update verification document status
    verificationDoc.status = 'verified';
    verificationDoc.verifiedBy = adminId;
    verificationDoc.verifiedAt = new Date();
    await verificationDoc.save();

    // Update the user's document verification status
    if (verificationDoc.userType === 'student') {
      await Student.findByIdAndUpdate(
        verificationDoc.userId,
        {
          documentVerified: true,
          approvalStatus: 'approved',
          approvedAt: new Date(),
          approvedBy: adminId,
        }
      );
    } else if (verificationDoc.userType === 'vendor') {
      await Vendor.findByIdAndUpdate(
        verificationDoc.userId,
        {
          documentVerified: true,
          approvalStatus: 'approved',
          approvedAt: new Date(),
          approvedBy: adminId,
        }
      );
    }

    res.json({
      message: 'Verification approved successfully',
      success: true,
      verificationDocument: verificationDoc,
    });
  } catch (error) {
    console.error('Error approving verification:', error);
    res.status(500).json({
      message: 'Error approving verification',
      error: error.message,
    });
  }
};

// Reject verification document
export const rejectVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.id;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    // Find the verification document
    const verificationDoc = await VerificationDocument.findById(id);
    
    if (!verificationDoc) {
      return res.status(404).json({ message: 'Verification document not found' });
    }

    // Update verification document status
    verificationDoc.status = 'rejected';
    verificationDoc.verifiedBy = adminId;
    verificationDoc.verifiedAt = new Date();
    verificationDoc.rejectionReason = reason;
    await verificationDoc.save();

    // Update the user's document verification status
    if (verificationDoc.userType === 'student') {
      await Student.findByIdAndUpdate(
        verificationDoc.userId,
        {
          approvalStatus: 'rejected',
          rejectionReason: reason,
        }
      );
    } else if (verificationDoc.userType === 'vendor') {
      await Vendor.findByIdAndUpdate(
        verificationDoc.userId,
        {
          approvalStatus: 'rejected',
          rejectionReason: reason,
        }
      );
    }

    res.json({
      message: 'Verification rejected successfully',
      success: true,
      verificationDocument: verificationDoc,
    });
  } catch (error) {
    console.error('Error rejecting verification:', error);
    res.status(500).json({
      message: 'Error rejecting verification',
      error: error.message,
    });
  }
};