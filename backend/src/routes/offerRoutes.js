import express from 'express';
import {
  createOffer,
  getVendorOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
  getAllActiveOffers,
  getAllOffers,
  getOfferByCode,
  toggleOfferStatus,
  getOfferStats,
  redeemOffer,
} from '../controllers/offerController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Protected routes (require vendor authentication)
router.post('/create', authMiddleware, createOffer);
router.get('/my-offers', authMiddleware, getVendorOffers);
router.get('/stats', authMiddleware, getOfferStats);
router.get('/detail/:offerId', authMiddleware, getOfferById);
router.put('/update/:offerId', authMiddleware, updateOffer);
router.delete('/delete/:offerId', authMiddleware, deleteOffer);
router.patch('/toggle/:offerId', authMiddleware, toggleOfferStatus);
router.post('/redeem', authMiddleware, redeemOffer);

// Public routes (no authentication required)
router.get('/active', getAllActiveOffers);
router.get('/debug/all', getAllOffers); // Debug endpoint to see all offers
router.get('/code/:code', getOfferByCode);

export default router;
