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
    }).populate('vendorId', 'approvalStatus status');

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found or expired' });
    }

    // Check if vendor is approved and active
    if (!coupon.vendorId || coupon.vendorId.approvalStatus !== 'approved' || coupon.vendorId.status !== 'active') {
      return res.status(404).json({ message: 'Coupon from vendor is not available' });
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

// Get all active coupons for students
export const getActiveCoupons = async (req, res) => {
  try {
    const studentId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const now = new Date();

    // Get all active coupons from APPROVED vendors only
    const coupons = await Coupon.find({
      isActive: true,
      expirationDate: { $gte: now },
    })
      .populate({
        path: 'vendorId',
        select: 'name description approvalStatus status',
        match: {
          approvalStatus: 'approved',
          status: 'active'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Filter out coupons from vendors that don't meet the criteria
    const filteredCoupons = coupons.filter(coupon => coupon.vendorId !== null);

    const total = await Coupon.countDocuments({
      isActive: true,
      expirationDate: { $gte: now },
    });

    // Check if student has already used each coupon
    const couponsWithUsageStatus = filteredCoupons.map((coupon) => {
      const alreadyUsed = studentId
        ? coupon.usedBy.some(
            (usage) => usage.studentId.toString() === studentId
          )
        : false;

      return {
        id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountPercentage: coupon.discountPercentage,
        discountValue: coupon.discountValue,
        minPurchaseAmount: coupon.minPurchaseAmount,
        maxDiscount: coupon.maxDiscount,
        expirationDate: coupon.expirationDate,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
        vendorId: coupon.vendorId._id,
        vendor: {
          id: coupon.vendorId._id,
          name: coupon.vendorId.name,
          description: coupon.vendorId.description,
        },
        alreadyUsed,
        availableUses: coupon.usageLimit
          ? coupon.usageLimit - coupon.usedCount
          : 'Unlimited',
      };
    });

    res.json({
      message: 'Active coupons retrieved successfully',
      coupons: couponsWithUsageStatus,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error getting active coupons:', error);
    res
      .status(500)
      .json({ message: 'Failed to retrieve coupons', error: error.message });
  }
};

// Get coupon redemptions for a specific coupon (vendor view)
export const getCouponRedemptions = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    const { couponId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!vendorId) {
      return res.status(401).json({ message: 'Unauthorized: Vendor not authenticated' });
    }

    if (!couponId) {
      return res.status(400).json({ message: 'Coupon ID is required' });
    }

    // Get coupon and verify it belongs to vendor
    const coupon = await Coupon.findOne({
      _id: couponId,
      vendorId: vendorId
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found or unauthorized' });
    }

    // Get paginated redemptions with student details
    const skip = (page - 1) * limit;
    const totalRedemptions = coupon.usedBy.length;

    const paginatedRedemptions = coupon.usedBy.slice(skip, skip + parseInt(limit));

    // Populate student information for redemptions
    const redemptionsWithStudents = await Promise.all(
      paginatedRedemptions.map(async (usage) => {
        const student = await Student.findById(usage.studentId).select(
          'firstName lastName email college enrollmentYear'
        ).lean();

        return {
          redemptionId: usage.studentId,
          student: {
            id: student?._id,
            firstName: student?.firstName || 'N/A',
            lastName: student?.lastName || 'N/A',
            email: student?.email || 'N/A',
            college: student?.college || 'N/A',
            enrollmentYear: student?.enrollmentYear || 'N/A'
          },
          redeemedAt: usage.usedAt,
          redeemedDate: new Date(usage.usedAt).toLocaleDateString(),
          redeemedTime: new Date(usage.usedAt).toLocaleTimeString()
        };
      })
    );

    res.json({
      message: 'Coupon redemptions fetched successfully',
      coupon: {
        id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountPercentage: coupon.discountPercentage,
        discountValue: coupon.discountValue,
        usageLimit: coupon.usageLimit,
        expirationDate: coupon.expirationDate,
        isActive: coupon.isActive
      },
      statistics: {
        totalRedemptions: totalRedemptions,
        percentageUsed: coupon.usageLimit 
          ? ((totalRedemptions / coupon.usageLimit) * 100).toFixed(2) + '%'
          : 'Unlimited',
        remainingUses: coupon.usageLimit
          ? coupon.usageLimit - totalRedemptions
          : 'Unlimited'
      },
      redemptions: redemptionsWithStudents,
      pagination: {
        total: totalRedemptions,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalRedemptions / limit)
      }
    });
  } catch (error) {
    console.error('Error getting coupon redemptions:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve coupon redemptions', 
      error: error.message 
    });
  }
};

// Get all coupon redemptions summary for vendor
export const getAllCouponRedemptions = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    const { sortBy = '-createdAt', page = 1, limit = 10 } = req.query;

    if (!vendorId) {
      return res.status(401).json({ message: 'Unauthorized: Vendor not authenticated' });
    }

    const skip = (page - 1) * limit;

    // Get all vendor's coupons with redemption data
    const coupons = await Coupon.find({ vendorId })
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Coupon.countDocuments({ vendorId });

    const couponsWithRedemptionSummary = coupons.map(coupon => ({
      id: coupon._id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountType === 'percentage' 
        ? coupon.discountPercentage + '%'
        : '$' + coupon.discountValue,
      expirationDate: coupon.expirationDate,
      isActive: coupon.isActive,
      usageLimit: coupon.usageLimit,
      totalRedemptions: coupon.usedCount,
      uniqueStudents: coupon.usedBy.length,
      percentageUsed: coupon.usageLimit 
        ? ((coupon.usedCount / coupon.usageLimit) * 100).toFixed(2) + '%'
        : 'Unlimited',
      remainingUses: coupon.usageLimit
        ? coupon.usageLimit - coupon.usedCount
        : 'Unlimited',
      lastRedeemedAt: coupon.usedBy.length > 0 
        ? coupon.usedBy[coupon.usedBy.length - 1].usedAt
        : null,
      createdAt: coupon.createdAt
    }));

    res.json({
      message: 'All coupon redemptions summary retrieved successfully',
      coupons: couponsWithRedemptionSummary,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting all coupon redemptions:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve coupon redemptions summary', 
      error: error.message 
    });
  }
};
