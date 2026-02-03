import express from 'express';
import Offer from '../models/Offer.js';
import Student from '../models/Student.js';
import Coupon from '../models/Coupon.js';
import { authenticateToken, authorizeRole, verifyStudentApproval } from '../middleware/auth.js';

const router = express.Router();

// Get student dashboard
router.get('/dashboard', authenticateToken, authorizeRole('student'), verifyStudentApproval, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    const activeOffers = await Offer.find({ isActive: true }).limit(5);
    const savedOffers = await Offer.find({ savedBy: req.user.id }).limit(5);

    res.json({
      student,
      activeOffers,
      savedOffers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard', error: error.message });
  }
});

// Get student's discounts
router.get('/discounts', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const offers = await Offer.find({ isActive: true })
      .skip(skip)
      .limit(limit)
      .populate('vendor', 'name businessName businessCategory');

    const total = await Offer.countDocuments({ isActive: true });

    res.json({
      offers,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch discounts', error: error.message });
  }
});

// Get active coupons (only approved ones for students)
router.get('/coupons', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const coupons = await Coupon.find({ 
      isActive: true,
      approvalStatus: 'approved'  // Only show approved coupons to students
    })
      .skip(skip)
      .limit(limit)
      .populate('vendor', 'name businessName');

    const total = await Coupon.countDocuments({ 
      isActive: true,
      approvalStatus: 'approved'
    });

    res.json({
      success: true,
      coupons,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch coupons', 
      error: error.message 
    });
  }
});

// Search offers
router.get('/search', authenticateToken, authorizeRole('student'), verifyStudentApproval, async (req, res) => {
  try {
    const { query, category } = req.query;
    let filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    const offers = await Offer.find(filter).populate('vendor', 'name businessName');
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to search offers', error: error.message });
  }
});

// Redeem offer
router.post('/offers/redeem', authenticateToken, authorizeRole('student'), verifyStudentApproval, async (req, res) => {
  try {
    const { offerId, redemptionType } = req.body;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (!offer.isActive) {
      return res.status(400).json({ message: 'This offer is not available' });
    }

    const alreadyRedeemed = offer.redemptions.some(
      r => r.student.toString() === req.user.id
    );
    if (alreadyRedeemed) {
      return res.status(400).json({ message: 'You have already redeemed this offer' });
    }

    const redemptionCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    offer.redemptions.push({
      student: req.user.id,
      redeemedAt: new Date(),
      redemptionCode,
      isOnline: redemptionType === 'online',
    });
    offer.currentRedemptions += 1;

    await offer.save();

    res.json({
      message: 'Offer redeemed successfully',
      redemptionCode,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to redeem offer', error: error.message });
  }
});

// Save offer
router.post('/offers/save', authenticateToken, authorizeRole('student'), verifyStudentApproval, async (req, res) => {
  try {
    const { offerId } = req.body;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (!offer.savedBy.includes(req.user.id)) {
      offer.savedBy.push(req.user.id);
      await offer.save();
    }

    res.json({ message: 'Offer saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save offer', error: error.message });
  }
});

// Unsave offer
router.post('/offers/unsave', authenticateToken, authorizeRole('student'), verifyStudentApproval, async (req, res) => {
  try {
    const { offerId } = req.body;

    const offer = await Offer.findByIdAndUpdate(
      offerId,
      { $pull: { savedBy: req.user.id } },
      { new: true }
    );

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.json({ message: 'Offer unsaved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unsave offer', error: error.message });
  }
});

// Get saved offers
router.get('/offers/saved', authenticateToken, authorizeRole('student'), verifyStudentApproval, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const offers = await Offer.find({ savedBy: req.user.id })
      .skip(skip)
      .limit(limit)
      .populate('vendor', 'name businessName');

    const total = await Offer.countDocuments({ savedBy: req.user.id });

    res.json({
      offers,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch saved offers', error: error.message });
  }
});

// Get verification status
router.get('/verification-status', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    res.json({
      isVerified: student.isVerified,
      verificationStatus: student.verificationStatus,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch verification status', error: error.message });
  }
});

export default router;
