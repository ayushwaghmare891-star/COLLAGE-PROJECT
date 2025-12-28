import { Student } from '../models/Student.js';
import { Vendor } from '../models/Vendor.js';
import { Offer } from '../models/Offer.js';
import { Discount } from '../models/Discount.js';
import { VerificationDocument } from '../models/VerificationDocument.js';

// Admin Dashboard
export const getAdminDashboard = async (req, res) => {
  try {
    // Get counts for students
    const totalStudents = await Student.countDocuments();
    const approvedStudents = await Student.countDocuments({ approvalStatus: 'approved' });
    const pendingStudentApprovals = await Student.countDocuments({ approvalStatus: 'pending' });
    const rejectedStudents = await Student.countDocuments({ approvalStatus: 'rejected' });
    const activeStudents = await Student.countDocuments({ status: 'active', approvalStatus: 'approved' });
    const suspendedStudents = await Student.countDocuments({ status: 'suspended' });

    // Get counts for vendors
    const totalVendors = await Vendor.countDocuments();
    const approvedVendors = await Vendor.countDocuments({ approvalStatus: 'approved' });
    const pendingVendorApprovals = await Vendor.countDocuments({ approvalStatus: 'pending' });
    const rejectedVendors = await Vendor.countDocuments({ approvalStatus: 'rejected' });
    const activeVendors = await Vendor.countDocuments({ status: 'active', approvalStatus: 'approved' });
    const suspendedVendors = await Vendor.countDocuments({ status: 'suspended' });

    // Get counts for offers
    const totalOffers = await Offer.countDocuments();
    const approvedOffers = await Offer.countDocuments({ approvalStatus: 'approved' });
    const pendingOfferApprovals = await Offer.countDocuments({ approvalStatus: 'pending' });
    const activeOffers = await Offer.countDocuments({ 
      approvalStatus: 'approved',
      isActive: true,
      endDate: { $gte: new Date() }
    });

    // Get counts for discounts
    const totalDiscounts = await Discount.countDocuments();
    const monthlyDiscounts = await Discount.countDocuments({
      appliedDate: { $gte: new Date(new Date().setDate(1)) }
    });

    res.json({
      message: 'Admin dashboard data fetched successfully',
      dashboard: {
        students: {
          total: totalStudents,
          approved: approvedStudents,
          pending: pendingStudentApprovals,
          rejected: rejectedStudents,
          active: activeStudents,
          suspended: suspendedStudents,
          approvalRate: totalStudents > 0 ? ((approvedStudents / totalStudents) * 100).toFixed(2) + '%' : '0%'
        },
        vendors: {
          total: totalVendors,
          approved: approvedVendors,
          pending: pendingVendorApprovals,
          rejected: rejectedVendors,
          active: activeVendors,
          suspended: suspendedVendors,
          approvalRate: totalVendors > 0 ? ((approvedVendors / totalVendors) * 100).toFixed(2) + '%' : '0%'
        },
        offers: {
          total: totalOffers,
          approved: approvedOffers,
          pending: pendingOfferApprovals,
          active: activeOffers
        },
        engagement: {
          totalDiscounts,
          monthlyDiscounts,
          monthlyGrowth: monthlyDiscounts > 0 ? '+' + monthlyDiscounts : '0'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin dashboard', error: error.message });
  }
};

// Get all students with pagination
export const getStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, verificationStatus = 'all', search = '' } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (verificationStatus !== 'all') {
      filter.verificationStatus = verificationStatus;
    }
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(filter)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Student.countDocuments(filter);

    res.json({
      message: 'Students fetched successfully',
      students,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

// Get all vendors with pagination
export const getVendors = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all', search = '' } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { ownerFirstName: { $regex: search, $options: 'i' } }
      ];
    }

    const vendors = await Vendor.find(filter)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Vendor.countDocuments(filter);

    res.json({
      message: 'Vendors fetched successfully',
      vendors,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendors', error: error.message });
  }
};

// Verify student manually - approve or reject
export const verifyStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { approvalStatus, rejectionReason } = req.body; // 'approved', 'rejected'
    const adminId = req.user?.id;

    if (!['approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({ message: 'Invalid approval status' });
    }

    if (approvalStatus === 'rejected' && !rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const updateData = {
      approvalStatus,
      approvedAt: new Date(),
      approvedBy: adminId,
    };

    if (approvalStatus === 'rejected') {
      updateData.rejectionReason = rejectionReason;
    }

    const student = await Student.findByIdAndUpdate(
      studentId,
      updateData,
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      message: `Student ${approvalStatus} successfully`,
      student
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying student', error: error.message });
  }
};

// Approve/Reject vendor
export const updateVendorStatus = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { approvalStatus, rejectionReason } = req.body; // 'approved', 'rejected'
    const adminId = req.user?.id;

    if (!['approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({ message: 'Invalid approval status' });
    }

    if (approvalStatus === 'rejected' && !rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const updateData = {
      approvalStatus,
      approvedAt: new Date(),
      approvedBy: adminId,
      status: approvalStatus === 'approved' ? 'active' : 'inactive'
    };

    if (approvalStatus === 'rejected') {
      updateData.rejectionReason = rejectionReason;
    }

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      updateData,
      { new: true }
    ).select('-password');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({
      message: `Vendor ${approvalStatus} successfully`,
      vendor
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating vendor status', error: error.message });
  }
};

// Get pending verifications
export const getPendingVerifications = async (req, res) => {
  try {
    const { type = 'all', page = 1, limit = 10 } = req.query; // 'student', 'vendor', or 'all'

    let pendingData = [];
    const skip = (page - 1) * limit;

    if (type === 'student' || type === 'all') {
      // Get students with pending approval and their verification documents
      const pendingStudents = await Student.find({ 
        approvalStatus: 'pending'
      })
        .select('-password')
        .sort({ createdAt: -1 })
        .lean();
      
      for (const student of pendingStudents) {
        // Fetch verification documents for this student
        const verificationDoc = await VerificationDocument.findOne({
          userId: student._id,
          userType: 'student'
        }).lean();

        pendingData.push({
          ...student, 
          type: 'student',
          verificationStatus: 'pending-approval',
          documentUploaded: student.studentIdUploadedAt ? true : false,
          documentVerified: student.documentVerified,
          verificationDocument: verificationDoc || null
        });
      }
    }

    if (type === 'vendor' || type === 'all') {
      // Get vendors with pending approval and their verification documents
      const pendingVendors = await Vendor.find({ 
        approvalStatus: 'pending'
      })
        .select('-password')
        .sort({ createdAt: -1 })
        .lean();
      
      for (const vendor of pendingVendors) {
        // Fetch verification documents for this vendor
        const verificationDoc = await VerificationDocument.findOne({
          userId: vendor._id,
          userType: 'vendor'
        }).lean();

        pendingData.push({
          ...vendor, 
          type: 'vendor',
          verificationStatus: 'pending-approval',
          documentUploaded: vendor.businessDocumentUploadedAt ? true : false,
          documentVerified: vendor.documentVerified,
          verificationDocument: verificationDoc || null
        });
      }
    }

    // Apply pagination for mixed results
    const paginatedData = pendingData.slice(skip, skip + parseInt(limit));
    const total = pendingData.length;

    res.json({
      message: 'Pending verifications fetched successfully',
      count: total,
      pending: paginatedData,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending verifications', error: error.message });
  }
};

// Monitor vendor campaigns
export const getVendorCampaigns = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId)
      .select('businessName email');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const offers = await Offer.find({ vendor: vendorId })
      .select('title description offerType offerValue startDate endDate status usedCount')
      .lean();

    const campaignStats = {};
    let totalRedemptions = 0;

    for (const offer of offers) {
      const redemptions = await Discount.countDocuments({ offer: offer._id });
      campaignStats[offer._id] = {
        ...offer,
        redemptions
      };
      totalRedemptions += redemptions;
    }

    res.json({
      message: 'Vendor campaigns fetched successfully',
      vendor: {
        id: vendor._id,
        businessName: vendor.businessName,
        email: vendor.email
      },
      campaigns: offers,
      stats: {
        totalOffers: offers.length,
        totalRedemptions,
        averageRedemptionsPerOffer: offers.length > 0 ? (totalRedemptions / offers.length).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor campaigns', error: error.message });
  }
};

// Platform analytics
export const getPlatformAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get total users
    const totalStudents = await Student.countDocuments();
    const totalVendors = await Vendor.countDocuments();

    // Get engagement metrics
    let discountFilter = {};
    if (startDate && endDate) {
      discountFilter.appliedDate = dateFilter;
    }

    const totalDiscounts = await Discount.countDocuments(discountFilter);
    const totalSavings = await Discount.aggregate([
      { $match: discountFilter },
      { $group: { _id: null, totalSavings: { $sum: '$savingsAmount' } } }
    ]);

    // Get engagement by offer type
    const engagementByType = await Offer.aggregate([
      { $group: { _id: '$offerType', count: { $sum: 1 } } }
    ]);

    // Get top performers
    const topOffers = await Offer.find()
      .select('title usedCount')
      .sort({ usedCount: -1 })
      .limit(5)
      .lean();

    res.json({
      message: 'Platform analytics fetched successfully',
      analytics: {
        userMetrics: {
          totalStudents,
          totalVendors,
          totalUsers: totalStudents + totalVendors
        },
        engagementMetrics: {
          totalDiscounts,
          totalSavings: totalSavings.length > 0 ? totalSavings[0].totalSavings : 0,
          averageSavingsPerDiscount: totalDiscounts > 0 ? (totalSavings.length > 0 ? (totalSavings[0].totalSavings / totalDiscounts).toFixed(2) : 0) : 0
        },
        engagementByOfferType: engagementByType,
        topPerformingOffers: topOffers
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching platform analytics', error: error.message });
  }
};

// Handle disputes
export const handleDispute = async (req, res) => {
  try {
    const { discountId } = req.params;
    const { resolution, remarks } = req.body; // resolution: 'approved', 'rejected', 'refund'

    const discount = await Discount.findByIdAndUpdate(
      discountId,
      {
        disputeStatus: resolution,
        disputeRemarks: remarks,
        resolvedAt: new Date()
      },
      { new: true }
    );

    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }

    res.json({
      message: 'Dispute resolved successfully',
      discount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error handling dispute', error: error.message });
  }
};

// Suspend student account
export const suspendStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { reason } = req.body;

    const student = await Student.findByIdAndUpdate(
      studentId,
      {
        status: 'suspended',
        suspensionReason: reason,
        suspendedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      message: 'Student account suspended',
      student
    });
  } catch (error) {
    res.status(500).json({ message: 'Error suspending student', error: error.message });
  }
};

// Suspend vendor account
export const suspendVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { reason } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        status: 'suspended',
        suspensionReason: reason,
        suspendedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({
      message: 'Vendor account suspended',
      vendor
    });
  } catch (error) {
    res.status(500).json({ message: 'Error suspending vendor', error: error.message });
  }
};

// Get fraud reports
export const getFraudReports = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reports = await Discount.find({ isFraudulent: true })
      .populate('student', 'username email')
      .populate('offer', 'title')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Discount.countDocuments({ isFraudulent: true });

    res.json({
      message: 'Fraud reports fetched successfully',
      reports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching fraud reports', error: error.message });
  }
};

// Mark discount as fraudulent
export const markFraudulent = async (req, res) => {
  try {
    const { discountId } = req.params;
    const { reason } = req.body;

    const discount = await Discount.findByIdAndUpdate(
      discountId,
      {
        isFraudulent: true,
        fraudReason: reason,
        flaggedAt: new Date()
      },
      { new: true }
    );

    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }

    res.json({
      message: 'Discount marked as fraudulent',
      discount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error marking discount as fraudulent', error: error.message });
  }
};

// Get all pending offers waiting for admin approval
export const getPendingOffers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const offers = await Offer.find({ approvalStatus: 'pending' })
      .populate('vendorId', 'businessName email vendorId')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await Offer.countDocuments({ approvalStatus: 'pending' });

    res.json({
      message: 'Pending offers fetched successfully',
      offers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending offers', error: error.message });
  }
};

// Approve an offer created by vendor
export const approveOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const adminId = req.user?.id;

    const offer = await Offer.findByIdAndUpdate(
      offerId,
      {
        approvalStatus: 'approved',
        approvedBy: adminId,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('vendorId', 'businessName email');

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.json({
      message: 'Offer approved successfully',
      offer
    });
  } catch (error) {
    res.status(500).json({ message: 'Error approving offer', error: error.message });
  }
};

// Reject an offer with reason
export const rejectOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user?.id;

    if (!rejectionReason || rejectionReason.trim() === '') {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const offer = await Offer.findByIdAndUpdate(
      offerId,
      {
        approvalStatus: 'rejected',
        approvedBy: adminId,
        approvedAt: new Date(),
        rejectionReason
      },
      { new: true }
    ).populate('vendorId', 'businessName email');

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.json({
      message: 'Offer rejected successfully',
      offer
    });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting offer', error: error.message });
  }
};

// Get all offers with approval status filter
export const getAllOffers = async (req, res) => {
  try {
    const { page = 1, limit = 10, approvalStatus = 'approved' } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (approvalStatus !== 'all') {
      filter.approvalStatus = approvalStatus;
    }

    const offers = await Offer.find(filter)
      .populate('vendorId', 'businessName email vendorId status')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await Offer.countDocuments(filter);

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
