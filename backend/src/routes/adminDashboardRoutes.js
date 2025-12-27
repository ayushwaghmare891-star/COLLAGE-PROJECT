import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getAdminDashboard,
  getStudents,
  getVendors,
  verifyStudent,
  updateVendorStatus,
  getPendingVerifications,
  getVendorCampaigns,
  getPlatformAnalytics,
  handleDispute,
  suspendStudent,
  suspendVendor,
  getFraudReports,
  markFraudulent
} from '../controllers/adminDashboardController.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authMiddleware);

// Dashboard routes
router.get('/dashboard', getAdminDashboard);
router.get('/analytics', getPlatformAnalytics);

// Student management
router.get('/students', getStudents);
router.post('/students/:studentId/verify', verifyStudent);
router.post('/students/:studentId/suspend', suspendStudent);

// Vendor management
router.get('/vendors', getVendors);
router.post('/vendors/:vendorId/status', updateVendorStatus);
router.post('/vendors/:vendorId/suspend', suspendVendor);
router.get('/vendors/:vendorId/campaigns', getVendorCampaigns);

// Verification & compliance
router.get('/pending-verifications', getPendingVerifications);

// Fraud & disputes
router.get('/fraud-reports', getFraudReports);
router.post('/discounts/:discountId/mark-fraudulent', markFraudulent);
router.post('/discounts/:discountId/handle-dispute', handleDispute);

export default router;
