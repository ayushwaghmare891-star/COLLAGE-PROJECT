import Notification from '../models/Notification.js';
import { validationResult } from 'express-validator';

/**
 * Create a new notification
 * POST /api/notifications
 */
export const createNotification = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, message, type, studentId, adminId, vendorId, isGlobal, relatedOfferId, relatedCouponId, metadata } = req.body;

    // Create new notification
    const notification = new Notification({
      title,
      message,
      type: type || 'general',
      studentId: studentId || null,
      adminId: adminId || null,
      vendorId: vendorId || null,
      isGlobal: isGlobal || false,
      relatedOfferId: relatedOfferId || null,
      relatedCouponId: relatedCouponId || null,
      metadata: metadata || {},
      createdBy: req.userId, // Assuming authenticated user ID
      createdByModel: req.userRole || 'Admin', // Role from auth middleware
    });

    const savedNotification = await notification.save();

    // Emit notification via Socket.IO if available
    if (req.io) {
      const targetRoom = studentId
        ? `student:${studentId}`
        : vendorId
          ? `vendor:${vendorId}`
          : adminId
            ? `admin:${adminId}`
            : 'all-students';

      req.io.to(targetRoom).emit('newNotification', {
        id: savedNotification._id,
        title: savedNotification.title,
        message: savedNotification.message,
        type: savedNotification.type,
        createdAt: savedNotification.createdAt,
        isRead: false,
      });

      console.log(`📬 Notification sent to room: ${targetRoom}`);
    }

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification: savedNotification,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message,
    });
  }
};

/**
 * Get all notifications for logged-in user
 * GET /api/notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const userId = req.userId;

    // Fetch notifications
    const notifications = await Notification.find({
      $or: [
        { studentId: userId },
        { adminId: userId },
        { vendorId: userId },
        { userId: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('relatedOfferId', 'name description discount')
      .populate('relatedCouponId', 'code discount minPurchase')
      .populate('createdBy', 'name email');

    // Count total notifications
    const total = await Notification.countDocuments({
      $or: [
        { studentId: userId },
        { adminId: userId },
        { vendorId: userId },
        { userId: userId },
      ],
    });

    // Count unread notifications
    const unreadCount = await Notification.countDocuments({
      $or: [
        { studentId: userId },
        { adminId: userId },
        { vendorId: userId },
        { userId: userId },
      ],
      isRead: false,
    });

    res.status(200).json({
      success: true,
      notifications,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message,
    });
  }
};

/**
 * Get unread count for user
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;

    const unreadCount = await Notification.countDocuments({
      $or: [
        { studentId: userId },
        { adminId: userId },
        { vendorId: userId },
        { userId: userId },
      ],
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message,
    });
  }
};

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Find notification and verify ownership
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // Verify user owns this notification
    const isOwner =
      notification.studentId?.toString() === userId ||
      notification.adminId?.toString() === userId ||
      notification.vendorId?.toString() === userId ||
      notification.userId?.toString() === userId;

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notification',
      });
    }

    // Mark as read
    await notification.markAsRead();

    // Emit update via Socket.IO
    if (req.io) {
      req.io.to(`student:${userId}`).emit('notificationRead', {
        notificationId: id,
        isRead: true,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message,
    });
  }
};

/**
 * Mark all notifications as read
 * PUT /api/notifications/mark-all-read
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await Notification.updateMany(
      {
        $or: [
          { studentId: userId },
          { adminId: userId },
          { vendorId: userId },
          { userId: userId },
        ],
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    // Emit update via Socket.IO
    if (req.io) {
      req.io.to(`student:${userId}`).emit('allNotificationsRead', {
        userId,
      });
    }

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message,
    });
  }
};

/**
 * Delete a notification
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Find and verify ownership
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    const isOwner =
      notification.studentId?.toString() === userId ||
      notification.adminId?.toString() === userId ||
      notification.vendorId?.toString() === userId ||
      notification.userId?.toString() === userId;

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification',
      });
    }

    await Notification.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message,
    });
  }
};

/**
 * Get notification by ID
 * GET /api/notifications/:id
 */
export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const notification = await Notification.findById(id)
      .populate('relatedOfferId', 'name description discount')
      .populate('relatedCouponId', 'code discount')
      .populate('createdBy', 'name email');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // Verify ownership
    const isOwner =
      notification.studentId?.toString() === userId ||
      notification.adminId?.toString() === userId ||
      notification.vendorId?.toString() === userId ||
      notification.userId?.toString() === userId;

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this notification',
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification',
      error: error.message,
    });
  }
};
