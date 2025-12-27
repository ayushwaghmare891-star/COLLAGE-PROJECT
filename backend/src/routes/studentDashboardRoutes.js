import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getStudentDashboard,
  getStudentDiscounts,
  getOffersByCategory,
  redeemOffer,
  saveOffer,
  getSavedOffers,
  getVerificationStatus,
  searchOffers
} from '../controllers/studentDashboardController.js';

const router = express.Router();

// All routes require authentication and student role
router.use(authMiddleware);

// Dashboard routes
router.get('/dashboard', getStudentDashboard);
router.get('/discounts', getStudentDiscounts);
router.get('/verification-status', getVerificationStatus);

// Offer routes
router.get('/offers/category/:category', getOffersByCategory);
router.get('/offers/search', searchOffers);
router.post('/offers/redeem', redeemOffer);
router.post('/offers/save', saveOffer);
router.get('/offers/saved', getSavedOffers);

export default router;
