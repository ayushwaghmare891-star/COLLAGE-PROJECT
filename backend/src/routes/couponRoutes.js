import express from 'express';
import {
  getVendorCoupons,
  getCouponByCode,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  redeemCoupon,
  getCouponStats,
  getActiveCoupons,
  getCouponRedemptions,
  getAllCouponRedemptions,
} from '../controllers/couponController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Vendor routes (require authentication)
router.post('/create', authMiddleware, createCoupon);
router.get('/my-coupons', authMiddleware, getVendorCoupons);
router.put('/update/:couponId', authMiddleware, updateCoupon);
router.delete('/:couponId', authMiddleware, deleteCoupon);
router.get('/stats', authMiddleware, getCouponStats);
router.get('/redemptions/all', authMiddleware, getAllCouponRedemptions);
router.get('/redemptions/:couponId', authMiddleware, getCouponRedemptions);

// Student routes (require authentication)
router.post('/redeem', authMiddleware, redeemCoupon);
router.get('/active', authMiddleware, getActiveCoupons);

// Public routes
router.get('/code/:code', getCouponByCode);

export default router;
