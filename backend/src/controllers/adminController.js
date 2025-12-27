import { User } from '../models/User.js';

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
    const students = await User.find({ role: 'student' }).select('-password');
    res.json({ 
      message: 'Students fetched successfully', 
      count: students.length,
      students 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

export const getVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).select('-password');
    res.json({ 
      message: 'Vendors fetched successfully', 
      count: vendors.length,
      vendors 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendors', error: error.message });
  }
};

export const getActiveUsers = async (req, res) => {
  try {
    // Get counts of online users by role
    const onlineStudents = await User.countDocuments({ role: 'student', isOnline: true });
    const onlineVendors = await User.countDocuments({ role: 'vendor', isOnline: true });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const totalUsers = await User.countDocuments({});
    const onlineUsers = await User.countDocuments({ isOnline: true });

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
