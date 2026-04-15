// backend/routes/users.js
import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  saveJob,
  getSavedJobs,
  removeSavedJob,
  getAllUsers,
  updateUserRole,
  deleteUser
} from '../controllers/userController.js';

const router = express.Router();

// User routes (authenticated)
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/save-job', authenticateToken, saveJob);
router.get('/saved-jobs', authenticateToken, getSavedJobs);
router.delete('/saved-jobs/:jobId', authenticateToken, removeSavedJob);

// Admin routes
router.get('/all', authenticateToken, isAdmin, getAllUsers);
router.put('/role', authenticateToken, isAdmin, updateUserRole);
router.delete('/:userId', authenticateToken, isAdmin, deleteUser);

export default router;
