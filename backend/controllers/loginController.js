import LoginSession from '../models/LoginSession.js';
import User from '../models/User.js';

// Helper function to get device info from User-Agent
const parseUserAgent = (userAgent) => {
  const getBrowser = (ua) => {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const getOS = (ua) => {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
  };

  const getDevice = (ua) => {
    if (ua.includes('Mobile')) return 'Mobile';
    if (ua.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  };

  return {
    browser: getBrowser(userAgent || ''),
    os: getOS(userAgent || ''),
    device: getDevice(userAgent || ''),
  };
};

// @desc    Record successful login session
// @route   Internal use
// @access  Private
export const recordLoginSession = async (
  userId,
  email,
  role,
  token,
  req,
  loginStatus = 'success'
) => {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    const loginSession = new LoginSession({
      user: userId,
      email,
      role,
      token,
      ipAddress,
      userAgent,
      deviceInfo: parseUserAgent(userAgent),
      loginStatus,
      loginAttempt: 1,
    });

    await loginSession.save();
    return loginSession;
  } catch (error) {
    console.error('Error recording login session:', error);
    // Don't throw error, just log it
    return null;
  }
};

// @desc    Record failed login attempt
// @route   Internal use
// @access  Private
export const recordFailedLogin = async (email, role, req, failureReason) => {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    const failedSession = new LoginSession({
      email,
      role,
      token: 'N/A',
      ipAddress,
      userAgent,
      deviceInfo: parseUserAgent(userAgent),
      loginStatus: 'failed',
      failureReason,
      loginAttempt: 1,
    });

    await failedSession.save();
    return failedSession;
  } catch (error) {
    console.error('Error recording failed login:', error);
    return null;
  }
};

// @desc    Get user login history
// @route   GET /api/login/history/:userId
// @access  Private
export const getLoginHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    const sessions = await LoginSession.find({ user: userId })
      .sort({ loginTime: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-token'); // Don't return tokens for security

    const total = await LoginSession.countDocuments({ user: userId });

    res.json({
      success: true,
      data: sessions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching login history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch login history',
      error: error.message,
    });
  }
};

// @desc    Get login statistics
// @route   GET /api/login/stats/:userId
// @access  Private
export const getLoginStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await LoginSession.aggregate([
      {
        $match: {
          user: require('mongoose').Types.ObjectId(userId),
          loginTime: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalLogins: {
            $sum: { $cond: [{ $eq: ['$loginStatus', 'success'] }, 1, 0] },
          },
          failedAttempts: {
            $sum: { $cond: [{ $eq: ['$loginStatus', 'failed'] }, 1, 0] },
          },
          uniqueDevices: { $addToSet: '$deviceInfo.device' },
          uniqueBrowsers: { $addToSet: '$deviceInfo.browser' },
        },
      },
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalLogins: 0,
        failedAttempts: 0,
        uniqueDevices: [],
        uniqueBrowsers: [],
      },
    });
  } catch (error) {
    console.error('Error fetching login stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch login statistics',
      error: error.message,
    });
  }
};

// @desc    Logout and update session
// @route   POST /api/login/logout
// @access  Private
export const recordLogout = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required',
      });
    }

    const session = await LoginSession.findOneAndUpdate(
      { token },
      {
        isActive: false,
        logoutTime: new Date(),
      },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Error recording logout:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message,
    });
  }
};

// @desc    Get all active sessions for a user
// @route   GET /api/login/active-sessions/:userId
// @access  Private
export const getActiveSessions = async (req, res) => {
  try {
    const { userId } = req.params;

    const sessions = await LoginSession.find({
      user: userId,
      isActive: true,
      expiryTime: { $gt: new Date() },
    }).select('-token -user');

    res.json({
      success: true,
      data: sessions,
      total: sessions.length,
    });
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active sessions',
      error: error.message,
    });
  }
};
