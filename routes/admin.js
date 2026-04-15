// backend/routes/admin.js
import express from 'express';
import Job from '../models/Job.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get pending jobs for approval
router.get('/jobs/pending', authenticateToken, isAdmin, async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'pending' })
      .populate('postedBy', 'name email companyName')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve job
router.put('/jobs/:id/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'approved',
        reviewedBy: req.user.userId,
        reviewedAt: new Date()
      },
      { new: true }
    );
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject job
router.put('/jobs/:id/reject', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        reviewedBy: req.user.userId,
        reviewedAt: new Date(),
        rejectionReason: reason
      },
      { new: true }
    );
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all jobs (for admin monitoring)
router.get('/jobs/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('postedBy', 'name email companyName')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard stats
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    
    const totalUsers = await User.countDocuments({ role: 'jobseeker' });
    const totalEmployers = await User.countDocuments({ role: 'employer' });
    const totalJobs = await Job.countDocuments();
    const pendingJobs = await Job.countDocuments({ status: 'pending' });
    const approvedJobs = await Job.countDocuments({ status: 'approved' });
    const totalApplications = await Job.aggregate([
      { $unwind: '$applicants' },
      { $count: 'total' }
    ]);

    res.json({
      totalUsers,
      totalEmployers,
      totalJobs,
      pendingJobs,
      approvedJobs,
      totalApplications: totalApplications[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role
router.put('/users/:id/role', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const User = (await import('../models/User.js')).default;
    
    if (!['jobseeker', 'employer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.params.id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Prevent deleting yourself
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
