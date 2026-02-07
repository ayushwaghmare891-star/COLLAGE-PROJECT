import express from 'express';
import Vendor from '../models/Vendor.js';
import Offer from '../models/Offer.js';
import VerificationDocument from '../models/VerificationDocument.js';
import Student from '../models/Student.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { io } from '../server.js';

const router = express.Router();

// ========== VENDOR DASHBOARD ==========

// Get vendor profile
router.get('/profile', authenticateToken, authorizeRole('vendor'), async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.id).select('-password');
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    // Get vendor statistics
    const totalOffers = await Offer.countDocuments({ vendor: req.user.id });
    const activeOffers = await Offer.countDocuments({ vendor: req.user.id, isActive: true });
    const totalRedemptions = await Offer.aggregate([
      { $match: { vendor: req.user.id } },
      { $group: { _id: null, total: { $sum: '$currentRedemptions' } } },
    ]);

    res.json({
      success: true,
      data: {
        ...vendor.toObject(),
        stats: {
          totalOffers,
          activeOffers,
          totalRedemptions: totalRedemptions[0]?.total || 0,
        }
      },
    });
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor profile',
      error: error.message,
    });
  }
});

// Get vendor dashboard overview
router.get('/dashboard/overview', authenticateToken, authorizeRole('vendor'), async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    const totalOffers = await Offer.countDocuments({ vendor: vendorId });
    const activeOffers = await Offer.countDocuments({ vendor: vendorId, isActive: true });
    
    const redemptionData = await Offer.aggregate([
      { $match: { vendor: vendorId } },
      { $group: { 
        _id: null, 
        totalRedemptions: { $sum: '$currentRedemptions' },
        totalDiscount: { $sum: { $multiply: ['$discountValue', '$currentRedemptions'] } }
      } },
    ]);

    const overview = {
      totalOffers,
      activeOffers,
      totalRedemptions: redemptionData[0]?.totalRedemptions || 0,
      totalDiscount: redemptionData[0]?.totalDiscount || 0,
      timestamp: new Date()
    };

    // Broadcast to vendor room
    io.to(`vendor:${vendorId}`).emit('vendor:overview:updated', overview);

    res.json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard overview',
      error: error.message,
    });
  }
});

// Get vendor analytics
router.get('/analytics', authenticateToken, authorizeRole('vendor'), async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { period = '30' } = req.query;
    
    const daysBack = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const offers = await Offer.find({ 
      vendorId,
      createdAt: { $gte: startDate }
    }).lean();

    const analytics = {
      period: `Last ${daysBack} days`,
      totalOffers: offers.length,
      activeOffers: offers.filter(o => o.isActive).length,
      totalRedemptions: offers.reduce((sum, o) => sum + (o.currentRedemptions || 0), 0),
      totalDiscount: offers.reduce((sum, o) => sum + (o.discountValue || 0) * (o.currentRedemptions || 0), 0),
      offers: offers.map(o => ({
        _id: o._id,
        title: o.title,
        category: o.category,
        discount: o.discountValue,
        redemptions: o.currentRedemptions || 0,
        isActive: o.isActive,
        createdAt: o.createdAt
      })),
      timestamp: new Date()
    };

    // Broadcast to vendor room
    io.to(`vendor:${vendorId}`).emit('vendor:analytics:updated', analytics);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message,
    });
  }
});

// Get vendor orders (redemptions)
router.get('/orders', authenticateToken, authorizeRole('vendor'), async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { page = 1, limit = 10, status = 'all' } = req.query;
    
    const skip = (page - 1) * limit;
    let filter = { vendor: vendorId };
    
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const total = await Offer.countDocuments(filter);
    const orders = await Offer.find(filter)
      .select('title category discountValue currentRedemptions maxRedemptions isActive createdAt')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    // Broadcast to vendor room
    io.to(`vendor:${vendorId}`).emit('vendor:orders:updated', {
      orders,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: {
        orders: orders.map(o => ({
          id: o._id,
          title: o.title,
          category: o.category,
          originalPrice: o.originalPrice || 0,
          discount: o.discountValue,
          redemptions: o.currentRedemptions || 0,
          maxRedemptions: o.maxRedemptions || 0,
          status: o.isActive ? 'active' : 'inactive',
          createdAt: o.createdAt
        })),
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
        timestamp: new Date()
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
});

// Get vendor products/offers
router.get('/products', authenticateToken, authorizeRole('vendor'), async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { page = 1, limit = 10, search = '', category = 'all' } = req.query;
    
    const skip = (page - 1) * limit;
    let filter = { vendor: vendorId };
    
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    
    if (category !== 'all') {
      filter.category = category;
    }

    const total = await Offer.countDocuments(filter);
    const products = await Offer.find(filter)
      .select('title category discountValue isActive createdAt description')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    // Broadcast to vendor room
    io.to(`vendor:${vendorId}`).emit('vendor:products:updated', {
      products,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: {
        products: products.map(p => ({
          id: p._id,
          name: p.title,
          category: p.category,
          price: p.discountValue,
          status: p.isActive ? 'active' : 'inactive',
          description: p.description,
          createdAt: p.createdAt
        })),
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
        timestamp: new Date()
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
});

// Get vendor discounts
router.get('/discounts', authenticateToken, authorizeRole('vendor'), async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    const discounts = await Offer.find({ vendor: vendorId })
      .select('title discountValue discountType isActive createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Broadcast to vendor room
    io.to(`vendor:${vendorId}`).emit('vendor:discounts:updated', {
      discounts: discounts.map(d => ({
        id: d._id,
        name: d.title,
        discount: d.discountValue,
        type: d.discountType || 'percentage',
        status: d.isActive ? 'active' : 'inactive',
        createdAt: d.createdAt
      })),
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: {
        discounts: discounts.map(d => ({
          id: d._id,
          name: d.title,
          discount: d.discountValue,
          type: d.discountType || 'percentage',
          status: d.isActive ? 'active' : 'inactive',
          createdAt: d.createdAt
        })),
        timestamp: new Date()
      },
    });
  } catch (error) {
    console.error('Error fetching discounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discounts',
      error: error.message,
    });
  }
});

// Get vendor notifications
router.get('/notifications', authenticateToken, authorizeRole('vendor'), async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;

    // Get recent offers for notification context
    const recentOffers = await Offer.find({ vendor: vendorId })
      .select('title isActive approvalStatus createdAt updatedAt')
      .skip(skip)
      .limit(limit)
      .sort({ updatedAt: -1 })
      .lean();

    const notifications = recentOffers.map(offer => ({
      id: offer._id,
      type: offer.approvalStatus === 'approved' ? 'success' : offer.approvalStatus === 'pending' ? 'pending' : 'warning',
      title: offer.title,
      message: `Offer status: ${offer.approvalStatus}`,
      timestamp: offer.updatedAt || offer.createdAt,
      read: false
    }));

    // Broadcast to vendor room
    io.to(`vendor:${vendorId}`).emit('vendor:notifications:updated', {
      notifications,
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: { page: parseInt(page), limit: parseInt(limit), total: recentOffers.length },
        timestamp: new Date()
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
    });
  }
});

// Update vendor profile
router.put('/profile/update', authenticateToken, authorizeRole('vendor'), async (req, res) => {
  try {
    const { businessName, businessType, mobileNumber, businessEmail, businessAddress, city, state, businessDescription, website } = req.body;
    
    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.user.id,
      {
        businessName,
        businessType,
        mobileNumber,
        businessEmail,
        businessAddress,
        city,
        state,
        businessDescription,
        website,
        updatedAt: new Date(),
      },
      { new: true }
    ).select('-password');

    // Broadcast profile update
    io.to(`vendor:${req.user.id}`).emit('vendor:profile:updated', {
      vendor: updatedVendor,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedVendor,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
});

// Get pending student verifications (documents requiring review)
router.get('/pending-verifications', authenticateToken, authorizeRole('vendor'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get pending verification documents
    const verificationDocuments = await VerificationDocument.find({ status: 'pending' })
      .populate({
        path: 'user',
        select: 'name email university verificationStatus',
        model: 'Student',
        match: { verificationStatus: 'pending' }
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await VerificationDocument.countDocuments({ status: 'pending' });

    const pendingVerifications = verificationDocuments
      .filter(doc => doc.user) // Only include docs where user is still pending
      .map(doc => ({
        id: doc._id,
        studentName: doc.user?.name || 'Unknown',
        email: doc.user?.email || 'N/A',
        university: doc.user?.university || 'Not specified',
        documentType: doc.documentType,
        submittedAt: new Date(doc.createdAt).toLocaleString(),
        status: 'pending',
        documentUrl: doc.fileUrl,
        fileName: doc.fileName
      }));

    // Broadcast to vendor room if needed
    io.to(`vendor:${req.user.id}`).emit('vendor:verifications:updated', {
      verifications: pendingVerifications,
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: {
        verifications: pendingVerifications,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
        timestamp: new Date()
      },
    });
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending verifications',
      error: error.message,
    });
  }
});

// Health check for vendor endpoints
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Vendor API is healthy',
    timestamp: new Date()
  });
});

export default router;
