import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getStudents,
  getVendors,
  getActiveUsers,
  getAllOffers,
  getOffersStats,
  toggleOfferStatus,
  deleteOfferByAdmin,
} from '../controllers/adminController.js';
import { getPendingVerifications } from '../controllers/adminDashboardController.js';

const router = express.Router();

router.get('/users', authMiddleware, getAllUsers);
router.get('/users/:id', authMiddleware, getUserById);
router.put('/users/:id/role', authMiddleware, updateUserRole);
router.put('/users/:id/status', authMiddleware, updateUserStatus);
router.delete('/users/:id', authMiddleware, deleteUser);

router.get('/students', authMiddleware, getStudents);
router.get('/vendors', authMiddleware, getVendors);
router.get('/active-users', authMiddleware, getActiveUsers);
router.get('/pending-verifications', authMiddleware, getPendingVerifications);
router.get('/offers', authMiddleware, getAllOffers);
router.get('/offers-stats', authMiddleware, getOffersStats);
router.patch('/offers/:offerId/toggle', authMiddleware, toggleOfferStatus);
router.delete('/offers/:offerId', authMiddleware, deleteOfferByAdmin);

export default router;
