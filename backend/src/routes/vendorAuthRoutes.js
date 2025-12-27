import express from 'express';
import { vendorRegister, vendorLogin, vendorLogout } from '../controllers/vendorAuthController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', vendorRegister);
router.post('/login', vendorLogin);
router.post('/logout', authMiddleware, vendorLogout);

export default router;
