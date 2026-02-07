import mongoose from 'mongoose';

// Notification Schema
const notificationSchema = new mongoose.Schema(
  {
    // Title of the notification
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Detailed message/description
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Type of notification (event or offer)
    type: {
      type: String,
      enum: ['event', 'offer', 'announcement', 'general'],
      default: 'general',
      required: true,
    },

    // Which user/student receives this notification
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // For student notifications
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
    },

    // For admin notifications
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },

    // For vendor notifications
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null,
    },

    // Who created this notification (can be admin, vendor, etc)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'createdByModel',
    },

    // Model reference for createdBy (Admin or Vendor)
    createdByModel: {
      type: String,
      enum: ['Admin', 'Vendor'],
      default: 'Admin',
    },

    // Reference to related offer or event
    relatedOfferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      default: null,
    },

    // Reference to related coupon
    relatedCouponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },

    // Whether the notification has been read
    isRead: {
      type: Boolean,
      default: false,
    },

    // When the notification was read
    readAt: {
      type: Date,
      default: null,
    },

    // Whether notification should be sent to all users or specific user
    isGlobal: {
      type: Boolean,
      default: false,
    },

    // Notification metadata
    metadata: {
      icon: String,
      action_url: String,
      tags: [String],
    },

    // When the notification was created
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Auto-delete notification after 30 days
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ studentId: 1, createdAt: -1 });
notificationSchema.index({ adminId: 1, createdAt: -1 });
notificationSchema.index({ vendorId: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to mark notification as read
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({
    $or: [
      { studentId: userId },
      { userId: userId },
    ],
    isRead: false,
  });
};

// Static method to get notifications for a user
notificationSchema.statics.getNotifications = async function (userId, limit = 20, skip = 0) {
  return this.find({
    $or: [
      { studentId: userId },
      { userId: userId },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('relatedOfferId', 'name description')
    .populate('relatedCouponId', 'code discount')
    .lean();
};

// Static method to create and emit notification
notificationSchema.statics.createAndEmit = async function (notificationData, io) {
  try {
    const notification = new this(notificationData);
    const savedNotification = await notification.save();

    // Emit via Socket.IO if io instance is provided
    if (io) {
      const targetRoom = notificationData.studentId
        ? `student:${notificationData.studentId}`
        : 'all-students';

      io.to(targetRoom).emit('newNotification', {
        id: savedNotification._id,
        title: savedNotification.title,
        message: savedNotification.message,
        type: savedNotification.type,
        createdAt: savedNotification.createdAt,
        isRead: savedNotification.isRead,
      });
    }

    return savedNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
