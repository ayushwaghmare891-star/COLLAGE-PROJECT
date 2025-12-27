import express from 'express';
import { adminRegister, adminLogin, adminLogout } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.post('/admin/register', adminRegister);
router.post('/admin/login', adminLogin);
router.post('/admin/logout', authMiddleware, adminLogout);

export default router;
