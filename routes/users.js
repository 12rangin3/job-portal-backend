// backend/routes/users.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  saveJob,
  getSavedJobs,
  removeSavedJob,
  getAllUsers,
  updateUserRole,
  deleteUser,
  uploadResume
} from '../controllers/userController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user.userId + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'));
    }
  }
});

// User routes (authenticated)
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/upload-resume', authenticateToken, upload.single('resume'), uploadResume);
router.post('/save-job', authenticateToken, saveJob);
router.get('/saved-jobs', authenticateToken, getSavedJobs);
router.delete('/saved-jobs/:jobId', authenticateToken, removeSavedJob);

// Admin routes
router.get('/all', authenticateToken, isAdmin, getAllUsers);
router.put('/role', authenticateToken, isAdmin, updateUserRole);
router.delete('/:userId', authenticateToken, isAdmin, deleteUser);

export default router;
