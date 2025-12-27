import express from 'express';
import { studentRegister, studentLogin, studentLogout } from '../controllers/studentAuthController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', studentRegister);
router.post('/login', studentLogin);
router.post('/logout', authMiddleware, studentLogout);

export default router;
