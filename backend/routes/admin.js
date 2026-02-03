import express from 'express';
import Student from '../models/Student.js';
import Admin from '../models/Admin.js';
import Offer from '../models/Offer.js';
import Coupon from '../models/Coupon.js';
import VerificationDocument from '../models/VerificationDocument.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { io } from '../server.js';

const router = express.Router();

// DEBUG: Check if students exist in database
router.get('/debug/students-count', async (req, res) => {
  try {
    const count = await Student.countDocuments();
    const students = await Student.find().select('email name approvalStatus verificationStatus createdAt').limit(10);
    res.json({
      totalStudents: count,
      recentStudents: students,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      error: error.message,
      totalStudents: 0
    });
  }
});

// Get admin profile (all admin information)
router.get('/profile', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const adminId = req.user.id;
    
    const admin = await Admin.findById(adminId).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    // Fetch platform statistics for admin dashboard
    const totalStudents = await Student.countDocuments();
    const totalOffers = await Offer.countDocuments({ isActive: true });
    const totalAdmins = await Admin.countDocuments();
    
    const totalRedemptions = await Offer.aggregate([
      { $group: { _id: null, total: { $sum: '$currentRedemptions' } } },
    ]);

    res.json({
      success: true,
      data: {
        ...admin.toObject(),
        stats: {
          totalStudents,
          totalOffers,
          totalAdmins,
          totalRedemptions: totalRedemptions[0]?.total || 0,
        }
      },
    });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin profile',
      error: error.message,
    });
  }
});

// Get admin dashboard
router.get('/dashboard', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalOffers = await Offer.countDocuments({ isActive: true });
    const totalRedemptions = await Offer.aggregate([
      { $group: { _id: null, total: { $sum: '$currentRedemptions' } } },
    ]);

    res.json({
      totalStudents,
      totalOffers,
      totalRedemptions: totalRedemptions[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard', error: error.message });
  }
});

// Get all admins
router.get('/all-admins', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const admins = await Admin.find(filter)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Admin.countDocuments(filter);

    res.json({
      success: true,
      admins,
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        total,
        totalPages: Math.ceil(total / limit)
      },
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch admins', 
      error: error.message 
    });
  }
});

// Get all students
router.get('/students', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, verificationStatus = 'all', search = '' } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (verificationStatus !== 'all') {
      filter.verificationStatus = verificationStatus;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(filter)
      .select('-password')
      .skip(skip)
      .limit(limit);

    const total = await Student.countDocuments(filter);

    res.json({
      students,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
});

// Verify student (check documents and verify them)
router.post('/students/:studentId/verify', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const updateData = { verificationStatus: status, updatedAt: new Date() };
    
    // If verified by admin, also set isVerified to true
    if (status === 'verified') {
      updateData.isVerified = true;
    }

    const student = await Student.findByIdAndUpdate(
      req.params.studentId,
      updateData,
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Broadcast real-time update
    io.emit('student:verification-updated', {
      studentId: req.params.studentId,
      verificationStatus: status,
      student,
      changedBy: req.user.id,
      timestamp: new Date()
    });

    res.json({ 
      success: true,
      message: `Student ${status} successfully`, 
      student 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to verify student', 
      error: error.message 
    });
  }
});

// Approve/Reject student account (final approval after document verification)
router.post('/students/:studentId/approval', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { approvalStatus, remarks } = req.body;

    if (!['approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({ 
        success: false,
        message: 'approvalStatus must be "approved" or "rejected"'
      });
    }

    const updateData = { 
      approvalStatus, 
      approvalRemarks: remarks || '',
      updatedAt: new Date() 
    };
    
    if (approvalStatus === 'approved') {
      updateData.approvedAt = new Date();
    }

    const student = await Student.findByIdAndUpdate(
      req.params.studentId,
      updateData,
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found' 
      });
    }

    // Broadcast real-time update to all connected admins
    io.emit('student:status-updated', {
      studentId: req.params.studentId,
      approvalStatus,
      student,
      changedBy: req.user.id,
      timestamp: new Date()
    });

    // Email notifications removed

    res.json({ 
      success: true,
      message: `Student account ${approvalStatus} successfully`, 
      student 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to update student approval status', 
      error: error.message 
    });
  }
});

// Get fraud reports
router.get('/fraud-reports', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Placeholder for fraud reports
    res.json({
      reports: [],
      pagination: { page: parseInt(page), limit: parseInt(limit), total: 0 },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch fraud reports', error: error.message });
  }
});

// Mark as fraudulent
router.post('/discounts/:discountId/mark-fraudulent', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { reason } = req.body;

    const offer = await Offer.findByIdAndUpdate(
      req.params.discountId,
      { isActive: false },
      { new: true }
    );

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.json({ message: 'Offer marked as fraudulent', offer });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark fraudulent', error: error.message });
  }
});

// Get platform analytics
router.get('/analytics', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const students = await Student.countDocuments();
    const offers = await Offer.countDocuments({ isActive: true });
    const redemptions = await Offer.aggregate([
      { $group: { _id: null, total: { $sum: '$currentRedemptions' } } },
    ]);

    res.json({
      totalStudents: students,
      totalOffers: offers,
      totalRedemptions: redemptions[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
});

// Update user role (deprecated - users cannot change roles)
router.put('/users/:userId/role', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    res.status(400).json({
      message: 'Cannot change user role. Users are stored in role-specific databases.',
      note: 'Deletes and recreate user with different role'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user role', error: error.message });
  }
});

// Get active users stats
router.get('/active-users', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalUsers = totalStudents;
    
    // Assuming online status is tracked - using login sessions as proxy
    // For now, returning estimates based on recent activity
    const onlineUsers = Math.floor(totalUsers * 0.3); // 30% online estimate
    const offlineUsers = totalUsers - onlineUsers;
    
    const stats = {
      totalUsers,
      onlineUsers,
      offlineUsers,
      students: {
        total: totalStudents,
        online: Math.floor(totalStudents * 0.35),
        offline: totalStudents - Math.floor(totalStudents * 0.35),
      },
    };

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch active users stats', error: error.message });
  }
});

// Get all offers (for admin dashboard)
router.get('/offers', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all', search = '' } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const offers = await Offer.find(filter)
      .populate('vendorId', 'name businessName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Offer.countDocuments(filter);

    res.json({
      offers,
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        total,
        totalPages: Math.ceil(total / limit)
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch offers', error: error.message });
  }
});

// Get offers stats
router.get('/offers-stats', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const activeOffers = await Offer.countDocuments({ isActive: true });
    const totalOffers = await Offer.countDocuments();
    const inactiveOffers = totalOffers - activeOffers;
    
    // Calculate percentage change (comparing active to total)
    const changePercentage = totalOffers > 0 
      ? `${Math.round((activeOffers / totalOffers) * 100)}%`
      : '0%';

    res.json({
      activeOffers,
      totalOffers,
      inactiveOffers,
      changePercentage,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch offers stats', error: error.message });
  }
});

// Delete user
router.delete('/users/:userId', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    // Try to find and delete from Student collection
    let user = await Student.findByIdAndDelete(req.params.userId);
    
    // If not found, try Vendor collection
    if (!user) {
      user = await Vendor.findByIdAndDelete(req.params.userId);
    }
    
    // If not found, try Admin collection
    if (!user) {
      user = await Admin.findByIdAndDelete(req.params.userId);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Broadcast real-time deletion to all connected admins
    io.emit('user:deleted', {
      userId: req.params.userId,
      userType: user.role || 'student',
      deletedBy: req.user.id,
      timestamp: new Date()
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

// ==================== COUPON APPROVAL ROUTES ====================

// Get all pending coupons for admin approval
router.get('/coupons/pending', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const pendingCoupons = await Coupon.find({ approvalStatus: 'pending' })
      .populate('vendor', 'name businessName email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: pendingCoupons.length,
      coupons: pendingCoupons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending coupons',
      error: error.message,
    });
  }
});

// Get all coupons with their approval status
router.get('/coupons/all', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate('vendor', 'name businessName email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons',
      error: error.message,
    });
  }
});

// Approve a coupon
router.post('/coupons/:couponId/approve', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.couponId);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    if (coupon.approvalStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Coupon is already ${coupon.approvalStatus}`,
      });
    }

    coupon.approvalStatus = 'approved';
    coupon.approvedBy = req.user.id;
    coupon.approvalDate = new Date();
    await coupon.save();

    // Broadcast approval event
    io.emit('coupon:approved', {
      couponId: coupon._id,
      code: coupon.code,
      vendor: coupon.vendor,
      approvedAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Coupon approved successfully',
      coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve coupon',
      error: error.message,
    });
  }
});

// Reject a coupon
router.post('/coupons/:couponId/reject', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    const coupon = await Coupon.findById(req.params.couponId);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    if (coupon.approvalStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Coupon is already ${coupon.approvalStatus}`,
      });
    }

    coupon.approvalStatus = 'rejected';
    coupon.approvedBy = req.user.id;
    coupon.approvalDate = new Date();
    coupon.rejectionReason = rejectionReason || 'Rejected by admin';
    await coupon.save();

    // Broadcast rejection event
    io.emit('coupon:rejected', {
      couponId: coupon._id,
      code: coupon.code,
      vendor: coupon.vendor,
      reason: coupon.rejectionReason,
      rejectedAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Coupon rejected',
      coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject coupon',
      error: error.message,
    });
  }
});

// Admin: Delete any coupon
router.delete('/coupons/:couponId', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.couponId);
    
    if (!coupon) {
      return res.status(404).json({ 
        success: false,
        message: 'Coupon not found' 
      });
    }

    res.json({
      success: true,
      message: `Coupon ${coupon.code} deleted successfully`,
      coupon: coupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete coupon',
      error: error.message
    });
  }
});

export default router;
