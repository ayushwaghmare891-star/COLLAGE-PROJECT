import express from 'express';
import {
  getLoginHistory,
  getLoginStats,
  recordLogout,
  getActiveSessions,
} from '../controllers/loginController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's login history
router.get('/history/:userId', authenticateToken, getLoginHistory);

// Get login statistics for a user
router.get('/stats/:userId', authenticateToken, getLoginStats);

// Get active sessions for a user
router.get('/active-sessions/:userId', authenticateToken, getActiveSessions);

// Record logout
router.post('/logout', recordLogout);

export default router;
