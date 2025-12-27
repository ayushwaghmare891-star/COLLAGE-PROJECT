import { Student } from '../models/Student.js';
import { Offer } from '../models/Offer.js';
import { Discount } from '../models/Discount.js';

// Get student dashboard data
export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const student = await Student.findById(studentId)
      .select('-password')
      .lean();

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get active offers for student
    const now = new Date();
    const activeOffers = await Offer.find({
      vendor: { $ne: null },
      startDate: { $lte: now },
      endDate: { $gte: now },
      status: 'active'
    })
      .select('title description offerType offerValue category productName minPurchaseAmount code image usageLimit usedCount')
      .lean()
      .limit(10);

    // Get total savings estimate
    const recentDiscounts = await Discount.find({
      student: studentId,
      appliedDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    }).lean();

    const totalSavings = recentDiscounts.reduce((sum, d) => sum + (d.savingsAmount || 0), 0);

    res.json({
      message: 'Student dashboard data fetched successfully',
      student: {
        id: student._id,
        username: student.username,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        profileImage: student.profileImage,
        college: student.college,
        verificationStatus: student.verificationStatus,
        isEmailVerified: student.isEmailVerified,
        status: student.status
      },
      statistics: {
        totalActiveDealsBrowsed: activeOffers.length,
        totalSavingsLastMonth: totalSavings,
        recentDiscountsCount: recentDiscounts.length,
        verificationStatus: student.verificationStatus
      },
      activeOffers: activeOffers.map(offer => ({
        id: offer._id,
        title: offer.title,
        description: offer.description,
        offerType: offer.offerType,
        offerValue: offer.offerValue,
        category: offer.category,
        productName: offer.productName,
        minPurchaseAmount: offer.minPurchaseAmount,
        code: offer.code,
        image: offer.image,
        usageLimit: offer.usageLimit,
        usedCount: offer.usedCount,
        availableUses: offer.usageLimit ? offer.usageLimit - offer.usedCount : 'Unlimited'
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};

// Get student's active discounts
export const getStudentDiscounts = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const discounts = await Discount.find({ student: studentId })
      .populate('offer', 'title code offerValue category')
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Discount.countDocuments({ student: studentId });

    res.json({
      message: 'Student discounts fetched successfully',
      discounts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching discounts', error: error.message });
  }
};

// Get available offers by category
export const getOffersByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const now = new Date();
    const offers = await Offer.find({
      category: { $regex: category, $options: 'i' },
      startDate: { $lte: now },
      endDate: { $gte: now },
      status: 'active'
    })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Offer.countDocuments({
      category: { $regex: category, $options: 'i' },
      startDate: { $lte: now },
      endDate: { $gte: now },
      status: 'active'
    });

    res.json({
      message: 'Offers fetched successfully',
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

// Apply/redeem an offer
export const redeemOffer = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { offerId, redemptionType } = req.body; // online or in-store

    if (!offerId) {
      return res.status(400).json({ message: 'Offer ID is required' });
    }

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Check if usage limit is reached
    if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
      return res.status(400).json({ message: 'Offer usage limit reached' });
    }

    // Check validity
    const now = new Date();
    if (offer.startDate > now || offer.endDate < now) {
      return res.status(400).json({ message: 'Offer is not valid at this time' });
    }

    // Check if student has already redeemed this offer
    const existingDiscount = await Discount.findOne({
      student: studentId,
      offer: offerId
    });

    if (existingDiscount && existingDiscount.status === 'redeemed') {
      return res.status(400).json({ message: 'You have already redeemed this offer' });
    }

    // Create or update discount record
    const discountData = {
      student: studentId,
      offer: offerId,
      redemptionType: redemptionType || 'online',
      status: 'redeemed',
      appliedDate: new Date(),
      savingsAmount: offer.offerValue
    };

    const discount = await Discount.findByIdAndUpdate(
      existingDiscount?._id,
      discountData,
      { upsert: true, new: true }
    );

    // Increment offer usage count
    await Offer.findByIdAndUpdate(
      offerId,
      { $inc: { usedCount: 1 } }
    );

    res.json({
      message: 'Offer redeemed successfully',
      discount: {
        id: discount._id,
        code: offer.code,
        savingsAmount: offer.offerValue,
        redemptionType,
        appliedDate: discount.appliedDate
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error redeeming offer', error: error.message });
  }
};

// Save/bookmark an offer
export const saveOffer = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { offerId } = req.body;

    if (!offerId) {
      return res.status(400).json({ message: 'Offer ID is required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if already saved
    if (student.savedOffers?.includes(offerId)) {
      return res.status(400).json({ message: 'Offer is already saved' });
    }

    student.savedOffers = student.savedOffers || [];
    student.savedOffers.push(offerId);
    await student.save();

    res.json({ message: 'Offer saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving offer', error: error.message });
  }
};

// Get saved offers
export const getSavedOffers = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const student = await Student.findById(studentId)
      .populate({
        path: 'savedOffers',
        select: 'title description offerType offerValue category productName image code',
        skip,
        limit: parseInt(limit)
      })
      .lean();

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const total = student.savedOffers?.length || 0;

    res.json({
      message: 'Saved offers fetched successfully',
      offers: student.savedOffers || [],
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching saved offers', error: error.message });
  }
};

// Get student verification status
export const getVerificationStatus = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await Student.findById(studentId)
      .select('verificationStatus isEmailVerified studentIdDocument college enrollmentYear')
      .lean();

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      message: 'Verification status fetched successfully',
      verificationStatus: student.verificationStatus,
      isEmailVerified: student.isEmailVerified,
      studentIdUploaded: !!student.studentIdDocument,
      college: student.college,
      enrollmentYear: student.enrollmentYear
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching verification status', error: error.message });
  }
};

// Search offers
export const searchOffers = async (req, res) => {
  try {
    const { query, category, sortBy = '-createdAt' } = req.query;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    let searchFilter = {
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    };

    if (query) {
      searchFilter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ];
    }

    if (category) {
      searchFilter.category = { $regex: category, $options: 'i' };
    }

    const offers = await Offer.find(searchFilter)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Offer.countDocuments(searchFilter);

    res.json({
      message: 'Offers searched successfully',
      offers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error searching offers', error: error.message });
  }
};
