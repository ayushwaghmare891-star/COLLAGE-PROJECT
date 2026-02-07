import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationById,
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Middleware to ensure user is authenticated
 * This checks for valid JWT token
 */
router.use(authenticateToken);

/**
 * POST /api/notifications
 * Create a new notification
 * Required: title, message, type
 * Optional: studentId, adminId, vendorId, isGlobal, relatedOfferId, relatedCouponId
 */
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('type').isIn(['event', 'offer', 'announcement', 'general']).withMessage('Invalid notification type'),
  ],
  createNotification
);

/**
 * GET /api/notifications
 * Get all notifications for logged-in user
 * Query params: page (default: 1), limit (default: 20)
 */
router.get('/', getNotifications);

/**
 * GET /api/notifications/unread-count
 * Get unread notification count for logged-in user
 */
router.get('/unread-count', getUnreadCount);

/**
 * PUT /api/notifications/mark-all-read
 * Mark all notifications as read for the user
 */
router.put('/mark-all/read', markAllAsRead);

/**
 * GET /api/notifications/:id
 * Get a specific notification by ID
 */
router.get('/:id', getNotificationById);

/**
 * PUT /api/notifications/:id/read
 * Mark a specific notification as read
 */
router.put('/:id/read', markAsRead);

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification
 */
router.delete('/:id', deleteNotification);

export default router;
