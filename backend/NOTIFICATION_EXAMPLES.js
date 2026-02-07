/**
 * Real-Time Notification Feature - Backend Usage Examples
 * This file demonstrates how to use the notification system across the application
 */

import Notification from '../models/Notification.js';

/**
 * EXAMPLE 1: Create a notification when a new offer is added
 * File: routes/offers.js or controllers/offerController.js
 */
export const createOfferWithNotification = async (req, res, io) => {
  try {
    // Create offer
    const offerData = req.body;
    // ... offer creation logic ...

    // Create notification for all students
    const notification = new Notification({
      title: `New Offer: ${offerData.title}`,
      message: `${offerData.vendorName} is offering ${offerData.discount}% off on ${offerData.category}`,
      type: 'offer',
      isGlobal: true, // Send to all students
      relatedOfferId: offer._id,
      createdBy: req.userId,
      createdByModel: 'Vendor',
      metadata: {
        icon: 'offer',
        action_url: `/offers/${offer._id}`,
        tags: [offerData.category, 'discount'],
      },
    });

    const savedNotification = await notification.save();

    // Emit via Socket.IO to all connected students
    if (io) {
      io.to('all-students').emit('newNotification', {
        id: savedNotification._id,
        title: savedNotification.title,
        message: savedNotification.message,
        type: savedNotification.type,
        createdAt: savedNotification.createdAt,
        isRead: false,
      });
    }

    res.status(201).json({
      success: true,
      notification: savedNotification,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * EXAMPLE 2: Create notification for specific student (approval notification)
 * File: controllers/adminController.js
 */
export const approveStudentWithNotification = async (req, res, io) => {
  try {
    const { studentId } = req.params;

    // Update student status
    // ... student update logic ...

    // Create approval notification
    const notification = new Notification({
      title: 'Account Approved! 🎉',
      message: 'Your student account has been verified and approved. Welcome to Student Deals!',
      type: 'announcement',
      studentId, // Send to specific student
      createdBy: req.userId,
      createdByModel: 'Admin',
      metadata: {
        icon: 'check',
        action_url: '/dashboard',
      },
    });

    const savedNotification = await notification.save();

    // Emit to specific student
    if (io) {
      io.to(`student:${studentId}`).emit('newNotification', {
        id: savedNotification._id,
        title: savedNotification.title,
        message: savedNotification.message,
        type: savedNotification.type,
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * EXAMPLE 3: Admin broadcast notification to all vendors
 * File: controllers/adminController.js
 */
export const broadcastToVendors = async (req, res, io) => {
  try {
    const { title, message, type } = req.body;

    // Create notifications for all vendors
    const vendorIds = []; // Get all vendor IDs from database
    const notifications = await Notification.insertMany(
      vendorIds.map((vendorId) => ({
        title,
        message,
        type: type || 'announcement',
        vendorId,
        createdBy: req.userId,
        createdByModel: 'Admin',
      }))
    );

    // Broadcast to all vendors
    if (io) {
      io.to('vendor-notifications').emit('newNotification', {
        title,
        message,
        type,
        createdAt: new Date(),
        isRead: false,
      });
    }

    res.status(201).json({ success: true, count: notifications.length });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * EXAMPLE 4: Create event notification (for events like flash sales)
 * File: controllers/eventController.js
 */
export const createEventNotification = async (req, res, io) => {
  try {
    const { eventName, startTime, endTime, targetCategories } = req.body;

    const notification = new Notification({
      title: `⚡ Flash Sale: ${eventName}`,
      message: `Amazing deals available from ${new Date(startTime).toLocaleTimeString()} to ${new Date(endTime).toLocaleTimeString()}`,
      type: 'event',
      isGlobal: true,
      createdBy: req.userId,
      createdByModel: 'Admin',
      metadata: {
        icon: 'flash',
        action_url: '/events',
        tags: targetCategories,
      },
      // Auto-expire after event ends
      expiresAt: new Date(endTime),
    });

    const savedNotification = await notification.save();

    // Emit to all students
    if (io) {
      io.to('all-students').emit('newNotification', {
        id: savedNotification._id,
        title: savedNotification.title,
        message: savedNotification.message,
        type: 'event',
      });
    }

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * EXAMPLE 5: Create notification for coupon application
 * File: controllers/couponController.js
 */
export const applyCouponWithNotification = async (req, res, io) => {
  try {
    const { studentId, couponCode } = req.body;

    // Apply coupon logic...
    const discount = 50; // Example
    const savingsAmount = 500; // Example

    const notification = new Notification({
      title: 'Coupon Applied Successfully! 💰',
      message: `You saved ₹${savingsAmount} with coupon code: ${couponCode}`,
      type: 'offer',
      studentId,
      relatedCouponId: couponId,
      createdBy: req.userId,
      createdByModel: 'Admin',
      metadata: {
        icon: 'coupon',
        savings: savingsAmount,
      },
    });

    const savedNotification = await notification.save();

    // Emit to student
    if (io) {
      io.to(`student:${studentId}`).emit('newNotification', {
        id: savedNotification._id,
        title: savedNotification.title,
        message: savedNotification.message,
        type: 'offer',
      });
    }

    res.status(200).json({ success: true, discount });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * HELPER FUNCTION: Send notification to user
 * Can be reused across controllers
 */
export const sendNotification = async (
  io,
  {
    title,
    message,
    type = 'general',
    userId,
    studentId,
    vendorId,
    adminId,
    isGlobal = false,
    relatedOfferId = null,
    relatedCouponId = null,
    createdBy,
    createdByModel = 'Admin',
    metadata = {},
  }
) => {
  try {
    const notification = new Notification({
      title,
      message,
      type,
      userId,
      studentId,
      vendorId,
      adminId,
      isGlobal,
      relatedOfferId,
      relatedCouponId,
      createdBy,
      createdByModel,
      metadata,
    });

    const savedNotification = await notification.save();

    // Determine target room
    let targetRoom = 'all-students';
    if (studentId) targetRoom = `student:${studentId}`;
    else if (vendorId) targetRoom = `vendor-notifications:${vendorId}`;
    else if (adminId) targetRoom = `admin-notifications:${adminId}`;

    // Emit notification
    if (io) {
      io.to(targetRoom).emit('newNotification', {
        id: savedNotification._id,
        title,
        message,
        type,
        createdAt: savedNotification.createdAt,
        isRead: false,
      });
    }

    return savedNotification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * EXAMPLE 6: Query notifications with filters
 */
export const getNotificationsForUser = async (userId, filters = {}) => {
  try {
    const query = {
      $or: [
        { studentId: userId },
        { userId: userId },
      ],
    };

    // Add type filter if provided
    if (filters.type) {
      query.type = filters.type;
    }

    // Add read status filter
    if (filters.isRead !== undefined) {
      query.isRead = filters.isRead;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 20)
      .skip(filters.skip || 0);

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * EXAMPLE 7: Delete old notifications (scheduled task)
 * This can be run as a cron job
 */
export const cleanupOldNotifications = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
    });

    console.log(`Deleted ${result.deletedCount} old notifications`);
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
  }
};
