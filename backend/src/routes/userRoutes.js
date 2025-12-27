import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getUserProfile, updateUserProfile, deleteAccount, getAllUsers } from '../controllers/userController.js';

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.delete('/account', authMiddleware, deleteAccount);
router.get('/all', getAllUsers);

export default router;
