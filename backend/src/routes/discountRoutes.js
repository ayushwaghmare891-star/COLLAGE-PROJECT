import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createDiscount,
  getDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
  verifyDiscount,
} from '../controllers/discountController.js';

const router = express.Router();

router.post('/', authMiddleware, createDiscount);
router.get('/', getDiscounts);
router.get('/:id', getDiscountById);
router.put('/:id', authMiddleware, updateDiscount);
router.delete('/:id', authMiddleware, deleteDiscount);
router.post('/verify', verifyDiscount);

export default router;
