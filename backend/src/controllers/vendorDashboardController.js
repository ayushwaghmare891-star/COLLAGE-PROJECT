import { Vendor } from '../models/Vendor.js';
import { Offer } from '../models/Offer.js';
import { Discount } from '../models/Discount.js';
import { Coupon } from '../models/Coupon.js';
import { Student } from '../models/Student.js';

// Get vendor dashboard data
export const getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const vendor = await Vendor.findById(vendorId)
      .select('-password')
      .lean();

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Get vendor's offers
    const offers = await Offer.find({ vendor: vendorId }).lean();

    // Get active offers
    const now = new Date();
    const activeOffers = await Offer.find({
      vendor: vendorId,
      startDate: { $lte: now },
      endDate: { $gte: now },
      status: 'active'
    }).lean();

    // Get total engagement
    const totalEngagement = await Discount.countDocuments({
      offer: { $in: offers.map(o => o._id) }
    });

    // Get redemptions this month
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthlyRedemptions = await Discount.countDocuments({
      offer: { $in: offers.map(o => o._id) },
      appliedDate: { $gte: monthStart }
    });

    // Calculate total reach
    const totalReach = offers.reduce((sum, offer) => sum + (offer.usageLimit || 1000), 0);

    res.json({
      message: 'Vendor dashboard data fetched successfully',
      vendor: {
        id: vendor._id,
        businessName: vendor.businessName,
        ownerFirstName: vendor.ownerFirstName,
        ownerLastName: vendor.ownerLastName,
        email: vendor.email,
        businessLogo: vendor.businessLogo,
        businessDescription: vendor.businessDescription,
        status: vendor.status,
        isEmailVerified: vendor.isEmailVerified
      },
      statistics: {
        totalOffers: offers.length,
        activeOffers: activeOffers.length,
        totalEngagement,
        monthlyRedemptions,
        totalReach,
        conversionRate: totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(2) + '%' : '0%'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor dashboard', error: error.message });
  }
};

// Create a new offer
export const createOffer = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const {
      title,
      description,
      offerType,
      offerValue,
      category,
      productName,
      minPurchaseAmount,
      maxDiscount,
      code,
      usageLimit,
      startDate,
      endDate,
      targetAudience,
      image
    } = req.body;

    // Validate required fields
    if (!title || !offerType || offerValue === undefined || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Validate offer type
    const validOfferTypes = ['percentage', 'fixed', 'bogo', 'bundle', 'seasonal'];
    if (!validOfferTypes.includes(offerType)) {
      return res.status(400).json({ message: 'Invalid offer type' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    const offer = new Offer({
      vendor: vendorId,
      title,
      description,
      offerType,
      offerValue,
      category,
      productName,
      minPurchaseAmount: minPurchaseAmount || 0,
      maxDiscount: maxDiscount || null,
      code: code || null,
      usageLimit: usageLimit || null,
      startDate: start,
      endDate: end,
      targetAudience: targetAudience || 'all',
      image: image || null,
      status: 'active'
    });

    await offer.save();

    res.status(201).json({
      message: 'Offer created successfully',
      offer: {
        id: offer._id,
        title: offer.title,
        status: offer.status,
        startDate: offer.startDate,
        endDate: offer.endDate
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating offer', error: error.message });
  }
};

// Get vendor's offers
export const getVendorOffers = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { page = 1, limit = 10, status = 'all' } = req.query;

    const skip = (page - 1) * limit;

    let filter = { vendor: vendorId };
    if (status !== 'all') {
      filter.status = status;
    }

    const offers = await Offer.find(filter)
      .select('title description offerType offerValue category status usedCount usageLimit startDate endDate')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Offer.countDocuments(filter);

    res.json({
      message: 'Vendor offers fetched successfully',
      offers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching offers', error: error.message });
  }
};

// Update an offer
export const updateOffer = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { offerId } = req.params;
    const updateData = req.body;

    // Verify ownership
    const offer = await Offer.findOne({ _id: offerId, vendor: vendorId });
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found or unauthorized' });
    }

    // Validate dates if provided
    if (updateData.startDate && updateData.endDate) {
      const start = new Date(updateData.startDate);
      const end = new Date(updateData.endDate);
      if (start >= end) {
        return res.status(400).json({ message: 'Start date must be before end date' });
      }
    }

    const updatedOffer = await Offer.findByIdAndUpdate(
      offerId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Offer updated successfully',
      offer: updatedOffer
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating offer', error: error.message });
  }
};

// Delete an offer
export const deleteOffer = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { offerId } = req.params;

    const offer = await Offer.findOneAndDelete({
      _id: offerId,
      vendor: vendorId
    });

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found or unauthorized' });
    }

    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting offer', error: error.message });
  }
};

// Get offer analytics
export const getOfferAnalytics = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { offerId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify ownership
    const offer = await Offer.findOne({ _id: offerId, vendor: vendorId });
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found or unauthorized' });
    }

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.appliedDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const redemptions = await Discount.find({
      offer: offerId,
      ...dateFilter
    }).lean();

    const byRedemptionType = {
      online: redemptions.filter(r => r.redemptionType === 'online').length,
      inStore: redemptions.filter(r => r.redemptionType === 'in-store').length
    };

    const totalRevenueSavings = redemptions.reduce((sum, r) => sum + (r.savingsAmount || 0), 0);

    res.json({
      message: 'Offer analytics fetched successfully',
      analytics: {
        totalRedemptions: redemptions.length,
        byRedemptionType,
        totalRevenueSavings,
        usageRate: offer.usageLimit ? ((offer.usedCount / offer.usageLimit) * 100).toFixed(2) + '%' : 'Unlimited',
        usedCount: offer.usedCount,
        usageLimit: offer.usageLimit,
        averageSavingsPerRedemption: redemptions.length > 0 ? (totalRevenueSavings / redemptions.length).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

// Get vendor analytics (all offers)
export const getVendorAnalytics = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { startDate, endDate } = req.query;

    // Get all vendor offers
    const offers = await Offer.find({ vendor: vendorId }).lean();

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.appliedDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get all discounts for vendor's offers
    const discounts = await Discount.find({
      offer: { $in: offers.map(o => o._id) },
      ...dateFilter
    }).lean();

    const totalRevenueSavings = discounts.reduce((sum, d) => sum + (d.savingsAmount || 0), 0);
    const totalRedemptions = discounts.length;

    // Group by offer
    const offerStats = {};
    offers.forEach(offer => {
      const offerDiscounts = discounts.filter(d => d.offer.toString() === offer._id.toString());
      offerStats[offer.title] = {
        totalRedemptions: offerDiscounts.length,
        totalSavings: offerDiscounts.reduce((sum, d) => sum + (d.savingsAmount || 0), 0)
      };
    });

    res.json({
      message: 'Vendor analytics fetched successfully',
      analytics: {
        totalOffers: offers.length,
        totalRedemptions,
        totalRevenueSavings,
        averageRedemptionsPerOffer: offers.length > 0 ? (totalRedemptions / offers.length).toFixed(2) : 0,
        offerStats
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor analytics', error: error.message });
  }
};

// Get vendor profile
export const getVendorProfile = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const vendor = await Vendor.findById(vendorId)
      .select('-password')
      .lean();

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({
      message: 'Vendor profile fetched successfully',
      vendor
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor profile', error: error.message });
  }
};

// Update vendor profile
export const updateVendorProfile = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const updateData = req.body;

    // Prevent updating sensitive fields
    delete updateData.email;
    delete updateData.password;
    delete updateData.status;

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Vendor profile updated successfully',
      vendor
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating vendor profile', error: error.message });
  }
};

// Get coupon analytics for vendor dashboard
export const getCouponAnalytics = async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Get all vendor coupons
    const coupons = await Coupon.find({ vendorId }).lean();

    // Calculate total redemptions
    const totalCouponRedemptions = coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0);
    
    // Calculate unique students
    const allStudentIds = new Set();
    coupons.forEach(coupon => {
      coupon.usedBy.forEach(usage => {
        allStudentIds.add(usage.studentId.toString());
      });
    });
    const uniqueStudents = allStudentIds.size;

    // Get total coupons and active coupons
    const now = new Date();
    const activeCoupons = coupons.filter(coupon => 
      coupon.isActive && coupon.expirationDate > now
    ).length;

    // Calculate average redemptions per coupon
    const avgRedemptionsPerCoupon = coupons.length > 0 
      ? (totalCouponRedemptions / coupons.length).toFixed(2)
      : 0;

    // Get most redeemed coupon
    let mostRedeemedCoupon = null;
    if (coupons.length > 0) {
      mostRedeemedCoupon = coupons.reduce((max, coupon) => 
        coupon.usedCount > (max?.usedCount || 0) ? coupon : max
      );
    }

    res.json({
      message: 'Coupon analytics fetched successfully',
      statistics: {
        totalCoupons: coupons.length,
        activeCoupons,
        expiredCoupons: coupons.length - activeCoupons,
        totalCouponRedemptions,
        uniqueStudentsRedeemed: uniqueStudents,
        averageRedemptionsPerCoupon: parseFloat(avgRedemptionsPerCoupon),
        mostRedeemedCoupon: mostRedeemedCoupon ? {
          code: mostRedeemedCoupon.code,
          redemptions: mostRedeemedCoupon.usedCount,
          discount: mostRedeemedCoupon.discountType === 'percentage' 
            ? mostRedeemedCoupon.discountPercentage + '%'
            : '$' + mostRedeemedCoupon.discountValue
        } : null
      },
      coupons: coupons.map(coupon => ({
        id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountType === 'percentage' 
          ? coupon.discountPercentage + '%'
          : '$' + coupon.discountValue,
        redemptions: coupon.usedCount,
        usageLimit: coupon.usageLimit,
        percentageUsed: coupon.usageLimit 
          ? ((coupon.usedCount / coupon.usageLimit) * 100).toFixed(2) + '%'
          : 'Unlimited',
        expirationDate: coupon.expirationDate,
        isActive: coupon.isActive,
        createdAt: coupon.createdAt
      }))
    });
  } catch (error) {
    console.error('Error getting coupon analytics:', error);
    res.status(500).json({ 
      message: 'Error fetching coupon analytics', 
      error: error.message 
    });
  }
};
