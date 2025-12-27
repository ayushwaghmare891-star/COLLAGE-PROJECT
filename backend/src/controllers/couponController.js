import mongoose from 'mongoose';
import { Coupon } from '../models/Coupon.js';
import { Student } from '../models/Student.js';

// Get all coupons for a vendor
export const getVendorCoupons = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId) {
      return res.status(401).json({ message: 'Unauthorized: Vendor not authenticated' });
    }

    const coupons = await Coupon.find({ vendorId })
      .sort({ createdAt: -1 });

    res.json({
      message: 'Vendor coupons retrieved successfully',
      coupons,
    });
  } catch (error) {
    console.error('Error getting vendor coupons:', error);
    res.status(500).json({ message: 'Failed to retrieve coupons', error: error.message });
  }
};

// Get coupon by code (public - for validation)
export const getCouponByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const studentId = req.user?.id;

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found or expired' });
    }

    // Check if coupon has expired
    const now = new Date();
    if (coupon.expirationDate < now) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    // Check if usage limit reached
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    // Check if student already used this coupon
    let alreadyUsed = false;
    if (studentId) {
      alreadyUsed = coupon.usedBy.some(
        (usage) => usage.studentId.toString() === studentId
      );
    }

    res.json({
      message: 'Coupon found',
      coupon: {
        id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountPercentage: coupon.discountPercentage,
        discountValue: coupon.discountValue,
        minPurchaseAmount: coupon.minPurchaseAmount,
        maxDiscount: coupon.maxDiscount,
        expirationDate: coupon.expirationDate,
        vendorId: coupon.vendorId,
      },
      alreadyUsed,
    });
  } catch (error) {
    console.error('Error getting coupon by code:', error);
    res.status(500).json({ message: 'Failed to retrieve coupon', error: error.message });
  }
};

// Create coupon
export const createCoupon = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId) {
      return res.status(401).json({ message: 'Unauthorized: Vendor not authenticated' });
    }

    const {
      code,
      discountPercentage,
      discountType,
      discountValue,
      expirationDate,
      minPurchaseAmount,
      maxDiscount,
      usageLimit,
      description,
    } = req.body;

    // Validate required fields
    if (!code || !expirationDate) {
      return res.status(400).json({
        message: 'Please provide code and expirationDate',
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(409).json({ message: 'Coupon code already exists' });
    }

    // Validate discount
    if (discountType === 'percentage' && (!discountPercentage || discountPercentage < 0 || discountPercentage > 100)) {
      return res.status(400).json({ message: 'Discount percentage must be between 0 and 100' });
    }

    // Validate dates
    const expirationDateObj = new Date(expirationDate);
    const now = new Date();
    if (expirationDateObj <= now) {
      return res.status(400).json({ message: 'Expiration date must be in the future' });
    }

    // Create new coupon
    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountPercentage: discountType === 'percentage' ? discountPercentage : 0,
      discountType,
      discountValue: discountType === 'fixed' ? discountValue : 0,
      expirationDate: expirationDateObj,
      minPurchaseAmount,
      maxDiscount,
      usageLimit,
      description,
      vendorId,
      isActive: true,
    });

    await coupon.save();

    res.status(201).json({
      message: 'Coupon created successfully',
      coupon,
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ message: 'Failed to create coupon', error: error.message });
  }
};

// Update coupon
export const updateCoupon = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    const { couponId } = req.params;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Check if vendor owns this coupon
    if (coupon.vendorId.toString() !== vendorId) {
      return res.status(403).json({ message: 'Unauthorized: Cannot update this coupon' });
    }

    const {
      code,
      discountPercentage,
      discountType,
      discountValue,
      expirationDate,
      minPurchaseAmount,
      maxDiscount,
      usageLimit,
      description,
      isActive,
    } = req.body;

    // Check if new code already exists
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        return res.status(409).json({ message: 'Coupon code already exists' });
      }
    }

    // Update fields
    if (code) coupon.code = code.toUpperCase();
    if (discountPercentage !== undefined) coupon.discountPercentage = discountPercentage;
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (expirationDate) coupon.expirationDate = new Date(expirationDate);
    if (minPurchaseAmount !== undefined) coupon.minPurchaseAmount = minPurchaseAmount;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (description) coupon.description = description;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    res.json({
      message: 'Coupon updated successfully',
      coupon,
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ message: 'Failed to update coupon', error: error.message });
  }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    const { couponId } = req.params;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Check if vendor owns this coupon
    if (coupon.vendorId.toString() !== vendorId) {
      return res.status(403).json({ message: 'Unauthorized: Cannot delete this coupon' });
    }

    await Coupon.findByIdAndDelete(couponId);

    res.json({
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ message: 'Failed to delete coupon', error: error.message });
  }
};

// Redeem coupon
export const redeemCoupon = async (req, res) => {
  try {
    const studentId = req.user?.id;
    const { code, purchaseAmount } = req.body;

    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized: Student not authenticated' });
    }

    if (!code || purchaseAmount === undefined) {
      return res.status(400).json({ message: 'Missing code or purchaseAmount' });
    }

    // Find coupon
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({ message: 'Coupon is no longer active' });
    }

    // Check if coupon has expired
    const now = new Date();
    if (coupon.expirationDate < now) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    // Check if usage limit reached
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    // Check minimum purchase amount
    if (purchaseAmount < coupon.minPurchaseAmount) {
      return res.status(400).json({
        message: `Minimum purchase amount required: $${coupon.minPurchaseAmount}`,
      });
    }

    // Check if student already used this coupon
    const alreadyUsed = coupon.usedBy.some(
      (usage) => usage.studentId.toString() === studentId
    );

    if (alreadyUsed) {
      return res.status(400).json({
        message: 'You have already used this coupon',
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (purchaseAmount * coupon.discountPercentage) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
    }

    // Add student to usedBy
    coupon.usedBy.push({
      studentId,
      usedAt: now,
    });

    coupon.usedCount = (coupon.usedCount || 0) + 1;
    await coupon.save();

    res.json({
      success: true,
      message: 'Coupon redeemed successfully',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount,
        finalAmount: purchaseAmount - discountAmount,
      },
    });
  } catch (error) {
    console.error('Error redeeming coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to redeem coupon',
      error: error.message,
    });
  }
};

// Get coupon statistics
export const getCouponStats = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId) {
      return res.status(401).json({ message: 'Unauthorized: Vendor not authenticated' });
    }

    const stats = await Coupon.aggregate([
      { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
      {
        $group: {
          _id: null,
          totalCoupons: { $sum: 1 },
          activeCoupons: { $sum: { $cond: ['$isActive', 1, 0] } },
          totalRedeemed: { $sum: '$usedCount' },
        },
      },
    ]);

    res.json({
      message: 'Coupon statistics retrieved successfully',
      stats: stats[0] || {
        totalCoupons: 0,
        activeCoupons: 0,
        totalRedeemed: 0,
      },
    });
  } catch (error) {
    console.error('Error getting coupon stats:', error);
    res.status(500).json({ message: 'Failed to retrieve statistics', error: error.message });
  }
};
