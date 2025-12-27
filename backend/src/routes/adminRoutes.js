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
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/users', authMiddleware, getAllUsers);
router.get('/users/:id', authMiddleware, getUserById);
router.put('/users/:id/role', authMiddleware, updateUserRole);
router.put('/users/:id/status', authMiddleware, updateUserStatus);
router.delete('/users/:id', authMiddleware, deleteUser);

router.get('/students', authMiddleware, getStudents);
router.get('/vendors', authMiddleware, getVendors);
router.get('/active-users', authMiddleware, getActiveUsers);

export default router;
