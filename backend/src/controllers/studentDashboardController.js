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

    let activeOffers = [];
    let totalSavings = 0;
    let recentDiscountsCount = 0;

    // Only show offers if student is verified
    if (student.approvalStatus === 'approved') {
      const now = new Date();
      activeOffers = await Offer.find({
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

      totalSavings = recentDiscounts.reduce((sum, d) => sum + (d.savingsAmount || 0), 0);
      recentDiscountsCount = recentDiscounts.length;
    }

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
        approvalStatus: student.approvalStatus,
        isEmailVerified: student.isEmailVerified,
        status: student.status
      },
      statistics: {
        totalActiveDealsBrowsed: activeOffers.length,
        totalSavingsLastMonth: totalSavings,
        recentDiscountsCount: recentDiscountsCount,
        verificationStatus: student.approvalStatus,
        canAccessOffers: student.approvalStatus === 'approved'
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
    const studentId = req.user?.id;
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    // Check if student is verified
    const student = await Student.findById(studentId)
      .select('approvalStatus documentVerified');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.approvalStatus !== 'approved') {
      return res.status(403).json({ 
        message: 'You must be verified to access offers',
        verificationStatus: student.approvalStatus,
        documentVerified: student.documentVerified
      });
    }

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

    // Check if student is verified
    const student = await Student.findById(studentId)
      .select('approvalStatus documentVerified');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.approvalStatus !== 'approved') {
      return res.status(403).json({ 
        message: 'You must be verified to redeem offers',
        verificationStatus: student.approvalStatus,
        documentVerified: student.documentVerified
      });
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



// Get student verification status
export const getVerificationStatus = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await Student.findById(studentId)
      .select('approvalStatus documentVerified isEmailVerified studentIdDocument studentIdFileName studentIdUploadedAt college enrollmentYear rejectionReason')
      .lean();

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      message: 'Verification status fetched successfully',
      approvalStatus: student.approvalStatus,
      documentVerified: student.documentVerified,
      isEmailVerified: student.isEmailVerified,
      studentIdUploaded: !!student.studentIdDocument,
      studentIdFileName: student.studentIdFileName,
      studentIdUploadedAt: student.studentIdUploadedAt,
      college: student.college,
      enrollmentYear: student.enrollmentYear,
      rejectionReason: student.rejectionReason || '',
      canAccessOffers: student.approvalStatus === 'approved'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching verification status', error: error.message });
  }
};

// Search offers
export const searchOffers = async (req, res) => {
  try {
    const studentId = req.user?.id;
    const { query, category, sortBy = '-createdAt' } = req.query;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    // Check if student is verified
    const student = await Student.findById(studentId)
      .select('approvalStatus documentVerified');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.approvalStatus !== 'approved') {
      return res.status(403).json({ 
        message: 'You must be verified to access offers',
        verificationStatus: student.approvalStatus,
        documentVerified: student.documentVerified
      });
    }

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

// Save offer to student's saved list
export const saveOffer = async (req, res) => {
  try {
    const studentId = req.user?.id;
    const { offerId } = req.body;

    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized: Student not authenticated' });
    }

    if (!offerId) {
      return res.status(400).json({ message: 'Missing offerId' });
    }

    // Check if offer exists
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if already saved
    const alreadySaved = student.savedOffers.some(
      (saved) => saved.offerId && saved.offerId.toString() === offerId
    );

    if (alreadySaved) {
      return res.status(400).json({ message: 'This offer is already saved' });
    }

    // Add to saved offers
    student.savedOffers.push({
      offerId: offer._id,
      savedAt: new Date(),
    });

    await student.save();

    res.json({
      message: 'Offer saved successfully',
      savedOffer: {
        offerId: offer._id,
        title: offer.title,
        savedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error saving offer:', error);
    res.status(500).json({ message: 'Failed to save offer', error: error.message });
  }
};

// Unsave offer from student's saved list
export const unsaveOffer = async (req, res) => {
  try {
    const studentId = req.user?.id;
    const { offerId } = req.body;

    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized: Student not authenticated' });
    }

    if (!offerId) {
      return res.status(400).json({ message: 'Missing offerId' });
    }

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Remove from saved offers
    student.savedOffers = student.savedOffers.filter(
      (saved) => saved.offerId && saved.offerId.toString() !== offerId
    );

    await student.save();

    res.json({
      message: 'Offer removed from saved',
      offerId,
    });
  } catch (error) {
    console.error('Error removing saved offer:', error);
    res.status(500).json({ message: 'Failed to remove saved offer', error: error.message });
  }
};

// Get student's saved offers
export const getSavedOffers = async (req, res) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized: Student not authenticated' });
    }

    const student = await Student.findById(studentId).populate({
      path: 'savedOffers.offerId',
      select: 'title description offerType offerValue category productName code image usageLimit usedCount startDate endDate',
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      message: 'Saved offers fetched successfully',
      savedOffers: student.savedOffers || [],
    });
  } catch (error) {
    console.error('Error fetching saved offers:', error);
    res.status(500).json({ message: 'Failed to fetch saved offers', error: error.message });
  }
};
