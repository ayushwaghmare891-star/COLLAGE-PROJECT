import { User } from '../models/User.js';
import { Offer } from '../models/Offer.js';
import { Student } from '../models/Student.js';
import { Vendor } from '../models/Vendor.js';
import { Discount } from '../models/Discount.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ message: 'Users fetched successfully', users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User fetched successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    // Validate role
    const validRoles = ['user', 'student', 'vendor', 'admin'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Allowed roles: user, student, vendor, admin' 
      });
    }

    // Prevent changing admin role (only ADMIN_EMAIL can be admin)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ayushwaghmare777@gmail.com';
    if (role === 'admin') {
      const user = await User.findById(req.params.id);
      if (user.email !== ADMIN_EMAIL) {
        return res.status(403).json({ 
          message: `Only ${ADMIN_EMAIL} can have admin role` 
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'User role updated successfully', 
      user,
      previousRole: user.role,
      newRole: role
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');

    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-password').lean();
    res.json({ 
      message: 'Students fetched successfully', 
      students 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

export const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().select('-password').lean();
    res.json({ 
      message: 'Vendors fetched successfully', 
      vendors 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendors', error: error.message });
  }
};

export const getActiveUsers = async (req, res) => {
  try {
    // Get counts of online students and vendors from their respective collections
    const totalStudents = await Student.countDocuments({ approvalStatus: 'approved' });
    const onlineStudents = await Student.countDocuments({ approvalStatus: 'approved', isOnline: true });
    
    const totalVendors = await Vendor.countDocuments({ approvalStatus: 'approved' });
    const onlineVendors = await Vendor.countDocuments({ approvalStatus: 'approved', isOnline: true });
    
    const totalUsers = totalStudents + totalVendors;
    const onlineUsers = onlineStudents + onlineVendors;

    res.json({
      message: 'Active users fetched successfully',
      stats: {
        totalUsers,
        onlineUsers,
        offlineUsers: totalUsers - onlineUsers,
        students: {
          total: totalStudents,
          online: onlineStudents,
          offline: totalStudents - onlineStudents,
        },
        vendors: {
          total: totalVendors,
          online: onlineVendors,
          offline: totalVendors - onlineVendors,
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active users', error: error.message });
  }
};

export const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate('vendorId', 'businessName email vendorId')
      .sort({ createdAt: -1 });
    
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
    
    res.json({
      message: 'Offers fetched successfully',
      offers: offersWithRedemptions,
      count: offersWithRedemptions.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching offers', error: error.message });
  }
};

export const getOffersStats = async (req, res) => {
  try {
    const activeOffers = await Offer.countDocuments({ isActive: true });
    const inactiveOffers = await Offer.countDocuments({ isActive: false });
    const totalOffers = await Offer.countDocuments({});

    res.json({
      message: 'Offers stats fetched successfully',
      activeOffers,
      inactiveOffers,
      totalOffers,
      changePercentage: totalOffers > 0 ? `+${Math.round((activeOffers / totalOffers) * 100)}%` : '0%'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching offers stats', error: error.message });
  }
};

export const toggleOfferStatus = async (req, res) => {
  try {
    const { offerId } = req.params;
    
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    offer.isActive = !offer.isActive;
    await offer.save();

    res.json({
      message: `Offer ${offer.isActive ? 'activated' : 'deactivated'} successfully`,
      offer
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating offer status', error: error.message });
  }
};

export const deleteOfferByAdmin = async (req, res) => {
  try {
    const { offerId } = req.params;
    
    const offer = await Offer.findByIdAndDelete(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.json({
      message: 'Offer deleted successfully',
      offer
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting offer', error: error.message });
  }
};

export const approveOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { status, rejectionReason } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ message: 'Admin ID is required' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    offer.approvalStatus = status;
    offer.approvedBy = adminId;
    offer.approvedAt = new Date();
    
    if (status === 'rejected') {
      offer.rejectionReason = rejectionReason || 'Rejected by admin';
    }

    await offer.save();

    res.json({
      message: `Offer ${status} successfully`,
      offer
    });
  } catch (error) {
    res.status(500).json({ message: 'Error approving offer', error: error.message });
  }
};

export const getPendingOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ approvalStatus: 'pending' })
      .populate('vendorId', 'businessName businessLogo email')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Pending offers retrieved successfully',
      offers,
      total: offers.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending offers', error: error.message });
  }
};
