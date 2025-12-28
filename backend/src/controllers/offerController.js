import { Offer } from '../models/Offer.js';
import { Vendor } from '../models/Vendor.js';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { Discount } from '../models/Discount.js';

// Create a new offer
export const createOffer = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId) {
      return res.status(401).json({ message: 'Unauthorized: Vendor not authenticated' });
    }

    const {
      title,
      description,
      offerType,
      offerValue,
      category,
      productName,
      minPurchaseAmount,
      maxDiscount,
      image,
      code,
      usageLimit,
      startDate,
      endDate,
      terms,
    } = req.body;

    // Validate required fields
    if (!title || !offerType || offerValue === undefined || !category || !startDate || !endDate) {
      return res.status(400).json({
        message: 'Please provide title, offerType, offerValue, category, startDate, and endDate',
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Generate or validate code
    let finalCode = code;
    
    if (!finalCode) {
      // Auto-generate a unique code if not provided
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        finalCode = `${title.substring(0, 3).toUpperCase()}${timestamp}${random}`;
        
        const existingCode = await Offer.findOne({ code: finalCode });
        if (!existingCode) {
          isUnique = true;
        }
        attempts++;
      }
      
      if (!isUnique) {
        return res.status(500).json({ message: 'Failed to generate unique offer code' });
      }
    } else {
      // Validate provided code
      const existingCode = await Offer.findOne({ code: finalCode.toUpperCase() });
      if (existingCode) {
        return res.status(409).json({ message: 'Offer code already exists' });
      }
      finalCode = finalCode.toUpperCase();
    }

    // Get the vendor document to get their ObjectId
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Create new offer
    const offer = new Offer({
      title,
      description,
      offerType,
      offerValue,
      category,
      productName,
      minPurchaseAmount,
      maxDiscount,
      image,
      code: finalCode,
      usageLimit,
      startDate: start,
      endDate: end,
      terms,
      vendorId: vendor._id, // Use the vendor's MongoDB ObjectId
      createdBy: vendorId,
      isActive: true, // Explicitly set to active
      approvalStatus: 'approved', // Auto-approve offers on creation for easier testing
      approvedAt: new Date(),
    });

    await offer.save();

    console.log(`Offer created: ${offer._id} with isActive: ${offer.isActive} and approvalStatus: ${offer.approvalStatus}`);

    res.status(201).json({
      message: 'Offer created successfully and is now visible to students.',
      offer: {
        id: offer._id,
        title: offer.title,
        offerType: offer.offerType,
        offerValue: offer.offerValue,
        category: offer.category,
        code: offer.code,
        isActive: offer.isActive,
        startDate: offer.startDate,
        endDate: offer.endDate,
        approvalStatus: offer.approvalStatus,
      },
      vendor: {
        vendorId: vendor.vendorId,
      },
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ message: 'Failed to create offer', error: error.message });
  }
};

// Get all offers for a vendor
export const getVendorOffers = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId) {
      return res.status(401).json({ message: 'Unauthorized: Vendor not authenticated' });
    }

    const { isActive, category, skip = 0, limit = 10 } = req.query;

    const filter = { vendorId };
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    if (category) {
      filter.category = category;
    }

    const offers = await Offer.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    // Get redemption count for each offer
    const offersWithRedemptions = await Promise.all(
      offers.map(async (offer) => {
        const redemptionCount = await Discount.countDocuments({
          offer: offer._id,
          status: 'redeemed'
        });
        return {
          ...offer.toObject(),
          studentRedemptionCount: redemptionCount || 0
        };
      })
    );

    const total = await Offer.countDocuments(filter);

    res.json({
      message: 'Offers retrieved successfully',
      offers: offersWithRedemptions,
      pagination: {
        total,
        skip: parseInt(skip),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve offers', error: error.message });
  }
};

// Get a single offer by ID
export const getOfferById = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    const { offerId } = req.params;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Check if vendor owns this offer
    if (offer.vendorId.toString() !== vendorId) {
      return res.status(403).json({ message: 'Unauthorized: Cannot access this offer' });
    }

    res.json({
      message: 'Offer retrieved successfully',
      offer,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve offer', error: error.message });
  }
};

// Update offer
export const updateOffer = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    const { offerId } = req.params;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Check if vendor owns this offer
    if (offer.vendorId.toString() !== vendorId) {
      return res.status(403).json({ message: 'Unauthorized: Cannot update this offer' });
    }

    const {
      title,
      description,
      offerType,
      offerValue,
      category,
      productName,
      minPurchaseAmount,
      maxDiscount,
      image,
      code,
      usageLimit,
      startDate,
      endDate,
      isActive,
      terms,
    } = req.body;

    // Validate dates if provided
    if (startDate || endDate) {
      const start = new Date(startDate || offer.startDate);
      const end = new Date(endDate || offer.endDate);
      if (end <= start) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
    }

    // Check if code is being changed and if new code already exists
    if (code && code.toUpperCase() !== offer.code) {
      const existingCode = await Offer.findOne({ code: code.toUpperCase() });
      if (existingCode) {
        return res.status(409).json({ message: 'Offer code already exists' });
      }
    }

    // Update fields
    if (title) offer.title = title;
    if (description) offer.description = description;
    if (offerType) offer.offerType = offerType;
    if (offerValue !== undefined) offer.offerValue = offerValue;
    if (category) offer.category = category;
    if (productName) offer.productName = productName;
    if (minPurchaseAmount !== undefined) offer.minPurchaseAmount = minPurchaseAmount;
    if (maxDiscount !== undefined) offer.maxDiscount = maxDiscount;
    if (image) offer.image = image;
    if (code) offer.code = code.toUpperCase();
    if (usageLimit !== undefined) offer.usageLimit = usageLimit;
    if (startDate) offer.startDate = new Date(startDate);
    if (endDate) offer.endDate = new Date(endDate);
    if (isActive !== undefined) offer.isActive = isActive;
    if (terms) offer.terms = terms;

    await offer.save();

    res.json({
      message: 'Offer updated successfully',
      offer: {
        id: offer._id,
        title: offer.title,
        offerType: offer.offerType,
        offerValue: offer.offerValue,
        category: offer.category,
        code: offer.code,
        isActive: offer.isActive,
        startDate: offer.startDate,
        endDate: offer.endDate,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update offer', error: error.message });
  }
};

// Delete offer
export const deleteOffer = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    const { offerId } = req.params;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Check if vendor owns this offer
    if (offer.vendorId.toString() !== vendorId) {
      return res.status(403).json({ message: 'Unauthorized: Cannot delete this offer' });
    }

    await Offer.findByIdAndDelete(offerId);

    res.json({
      message: 'Offer deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete offer', error: error.message });
  }
};

// Get all active offers (public endpoint - no auth required)
export const getAllActiveOffers = async (req, res) => {
  try {
    const { category, skip = 0, limit = 100, search } = req.query;
    const now = new Date();

    // Build filter for active, non-expired, APPROVED offers
    // Offers should be active, not expired, and approved by admin
    // Also include startDate check to only show offers that have started
    const filter = {
      isActive: true,
      startDate: { $lte: now }, // Offer has started
      endDate: { $gte: now },   // Offer has not expired
      approvalStatus: 'approved' // Only show approved offers to students
    };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
      ];
    }

    console.log('🔍 Fetching active offers with filter:', JSON.stringify(filter, null, 2));
    console.log('⏰ Current server time:', now);

    // Get all offers matching the offer filter
    const offers = await Offer.find(filter)
      .populate({
        path: 'vendorId',
        select: 'businessName businessLogo rating email approvalStatus status'
      })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    console.log(`📋 Found ${offers.length} offers matching offer filter`);

    // Filter out offers from vendors that don't meet the vendor criteria
    const filteredOffers = [];
    
    for (const offer of offers) {
      // Check if vendor exists and meets criteria
      if (!offer.vendorId) {
        console.log(`❌ Offer "${offer.title}" has no vendor (vendorId is null)`);
        continue;
      }
      
      const vendor = offer.vendorId;
      if (vendor.approvalStatus !== 'approved' || vendor.status !== 'active') {
        console.log(`❌ Vendor filtered out for offer "${offer.title}": approvalStatus="${vendor.approvalStatus}", status="${vendor.status}"`);
        continue;
      }
      
      filteredOffers.push(offer);
    }

    const total = filteredOffers.length;

    console.log(`✅ Found ${filteredOffers.length} active offers from approved vendors`);
    if (filteredOffers.length > 0) {
      console.log('📦 Sample offer:', {
        id: filteredOffers[0]._id,
        title: filteredOffers[0].title,
        isActive: filteredOffers[0].isActive,
        startDate: filteredOffers[0].startDate,
        endDate: filteredOffers[0].endDate,
        approvalStatus: filteredOffers[0].approvalStatus,
        vendorId: filteredOffers[0].vendorId?._id || filteredOffers[0].vendorId,
      });
    } else {
      console.warn('⚠️ No offers found! Checking database stats...');
      const totalOffers = await Offer.countDocuments({});
      const approvedOffers = await Offer.countDocuments({ approvalStatus: 'approved' });
      const activeOffers = await Offer.countDocuments({ isActive: true });
      const nonExpiredOffers = await Offer.countDocuments({ endDate: { $gte: now } });
      const startedOffers = await Offer.countDocuments({ startDate: { $lte: now } });
      
      console.log('📊 Database stats:', {
        totalOffers,
        approvedOffers,
        activeOffers,
        nonExpiredOffers,
        startedOffers,
      });
    }

    res.json({
      message: 'Active offers retrieved successfully',
      offers: filteredOffers,
      pagination: {
        total,
        skip: parseInt(skip),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error getting active offers:', error);
    res.status(500).json({ message: 'Failed to retrieve offers', error: error.message });
  }
};

// Get offer by code (public endpoint)
export const getOfferByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const studentId = req.user?.id; // Get student ID from auth middleware

    const offer = await Offer.findOne({ code: code.toUpperCase(), isActive: true })
      .populate('vendorId', 'approvalStatus status');
    
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found or expired' });
    }

    // Check if vendor is approved and active
    if (!offer.vendorId || offer.vendorId.approvalStatus !== 'approved' || offer.vendorId.status !== 'active') {
      return res.status(404).json({ message: 'Offer from vendor is not available' });
    }

    // Check if offer is still valid date-wise
    const now = new Date();
    if (now < offer.startDate || now > offer.endDate) {
      return res.status(400).json({ message: 'Offer has expired or is not yet active' });
    }

    // Check if usage limit reached
    if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
      return res.status(400).json({ message: 'Offer usage limit reached' });
    }

    // Check if student has already redeemed this offer
    let alreadyRedeemed = false;
    if (studentId) {
      const student = await Student.findById(studentId);
      if (student && student.redeemedOffers) {
        alreadyRedeemed = student.redeemedOffers.some(
          (redeemedOffer) => redeemedOffer.offerId.toString() === offer._id.toString()
        );
      }
    }

    res.json({
      message: 'Offer found',
      offer: {
        id: offer._id,
        title: offer.title,
        description: offer.description,
        offerType: offer.offerType,
        offerValue: offer.offerValue,
        minPurchaseAmount: offer.minPurchaseAmount,
        maxDiscount: offer.maxDiscount,
      },
      alreadyRedeemed,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve offer', error: error.message });
  }
};

// Toggle offer active status
export const toggleOfferStatus = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    const { offerId } = req.params;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Check if vendor owns this offer
    if (offer.vendorId.toString() !== vendorId) {
      return res.status(403).json({ message: 'Unauthorized: Cannot update this offer' });
    }

    offer.isActive = !offer.isActive;
    await offer.save();

    res.json({
      message: `Offer ${offer.isActive ? 'activated' : 'deactivated'} successfully`,
      offer: {
        id: offer._id,
        title: offer.title,
        isActive: offer.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle offer status', error: error.message });
  }
};

// Get offer statistics
export const getOfferStats = async (req, res) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId) {
      return res.status(401).json({ message: 'Unauthorized: Vendor not authenticated' });
    }

    const stats = await Offer.aggregate([
      { $match: { vendorId: require('mongoose').Types.ObjectId(vendorId) } },
      {
        $group: {
          _id: null,
          totalOffers: { $sum: 1 },
          activeOffers: { $sum: { $cond: ['$isActive', 1, 0] } },
          totalApplied: { $sum: '$appliedCount' },
          totalUsed: { $sum: '$usedCount' },
        },
      },
    ]);

    res.json({
      message: 'Offer statistics retrieved successfully',
      stats: stats[0] || {
        totalOffers: 0,
        activeOffers: 0,
        totalApplied: 0,
        totalUsed: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve statistics', error: error.message });
  }
};

// Debug endpoint - Get ALL offers (active and inactive) for troubleshooting
export const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate('vendorId', 'businessName email vendorId')
      .sort({ createdAt: -1 });

    const now = new Date();
    const activeOffers = offers.filter(o => o.isActive && o.endDate >= now);

    console.log('Debug Info:');
    console.log(`Total offers in DB: ${offers.length}`);
    console.log(`Active offers (isActive=true AND not expired): ${activeOffers.length}`);
    console.log(`Current time: ${now}`);

    res.json({
      message: 'Debug: All offers',
      summary: {
        totalOffers: offers.length,
        activeNonExpired: activeOffers.length,
        currentTime: now,
      },
      offers: offers.map(o => ({
        id: o._id,
        title: o.title,
        isActive: o.isActive,
        startDate: o.startDate,
        endDate: o.endDate,
        isExpired: o.endDate < now,
        vendorName: o.vendorId?.businessName || 'Unknown',
        vendorEmail: o.vendorId?.email || 'Unknown',
      })),
    });
  } catch (error) {
    console.error('Error in getAllOffers debug endpoint:', error);
    res.status(500).json({ message: 'Failed to retrieve offers', error: error.message });
  }
};

// Redeem offer - Track student redemption and prevent duplicate use
export const redeemOffer = async (req, res) => {
  try {
    const studentId = req.user?.id;
    const { offerId } = req.body;

    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized: Student not authenticated' });
    }

    if (!offerId) {
      return res.status(400).json({ message: 'Missing offerId' });
    }

    // Find the offer
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Check if offer has a code
    if (!offer.code) {
      return res.status(400).json({ message: 'This offer does not have a discount code' });
    }

    // Check if offer is active
    if (!offer.isActive) {
      return res.status(400).json({ message: 'Offer is no longer active' });
    }

    // Check if offer is expired
    const now = new Date();
    if (now < offer.startDate || now > offer.endDate) {
      return res.status(400).json({ message: 'Offer has expired or is not yet active' });
    }

    // Check if usage limit reached
    if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
      return res.status(400).json({ message: 'Offer usage limit reached' });
    }

    // Find student in Student collection
    let student = await Student.findById(studentId);
    
    // If not found in Student collection, try User
    if (!student) {
      const user = await User.findById(studentId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Track redemptions in User model
      if (!user.redeemedOffers) {
        user.redeemedOffers = [];
      }
      
      // Check if already redeemed
      const alreadyRedeemed = user.redeemedOffers.some(
        (redeemedOffer) => redeemedOffer.offerId && redeemedOffer.offerId.toString() === offer._id.toString()
      );

      if (alreadyRedeemed) {
        return res.status(400).json({ 
          success: false,
          message: 'You have already redeemed this offer! Each user can use this offer only once.' 
        });
      }

      user.redeemedOffers.push({
        offerId: offer._id,
        code: offer.code,
        redeemedAt: now,
      });

      await user.save();

      offer.usedCount = (offer.usedCount || 0) + 1;
      await offer.save();

      return res.json({
        success: true,
        message: 'Offer redeemed successfully',
        redeemedOffer: {
          offerId: offer._id,
          title: offer.title,
          code: offer.code,
          redeemedAt: now,
        },
      });
    }

    // Ensure redeemedOffers array exists
    if (!student.redeemedOffers) {
      student.redeemedOffers = [];
    }

    // Check if student has already redeemed this offer
    const alreadyRedeemed = student.redeemedOffers.some(
      (redeemedOffer) => redeemedOffer.offerId && redeemedOffer.offerId.toString() === offer._id.toString()
    );

    if (alreadyRedeemed) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already redeemed this offer! Each student can use this offer only once.' 
      });
    }

    // Add offer to student's redeemed list using the offer's code
    student.redeemedOffers.push({
      offerId: offer._id,
      code: offer.code,
      redeemedAt: now,
    });

    await student.save();

    // Update offer usage count
    offer.usedCount = (offer.usedCount || 0) + 1;
    await offer.save();

    res.json({
      success: true,
      message: 'Offer redeemed successfully',
      redeemedOffer: {
        offerId: offer._id,
        title: offer.title,
        code: offer.code,
        redeemedAt: now,
      },
    });
  } catch (error) {
    console.error('Error redeeming offer:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Failed to redeem offer', 
      error: error.message 
    });
  }
};