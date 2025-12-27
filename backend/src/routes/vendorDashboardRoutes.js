import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getVendorDashboard,
  createOffer,
  getVendorOffers,
  updateOffer,
  deleteOffer,
  getOfferAnalytics,
  getVendorAnalytics,
  getVendorProfile,
  updateVendorProfile
} from '../controllers/vendorDashboardController.js';

const router = express.Router();

// All routes require authentication and vendor role
router.use(authenticate);

// Dashboard routes
router.get('/dashboard', getVendorDashboard);
router.get('/analytics', getVendorAnalytics);
router.get('/profile', getVendorProfile);
router.put('/profile', updateVendorProfile);

// Offer routes
router.post('/offers', createOffer);
router.get('/offers', getVendorOffers);
router.put('/offers/:offerId', updateOffer);
router.delete('/offers/:offerId', deleteOffer);
router.get('/offers/:offerId/analytics', getOfferAnalytics);

export default router;
