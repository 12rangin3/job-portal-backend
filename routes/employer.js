// backend/routes/employer.js
import express from 'express';
import Job from '../models/Job.js';
import { authenticateToken, isEmployer } from '../middleware/auth.js';

const router = express.Router();

// Get my posted jobs
router.get('/jobs', authenticateToken, isEmployer, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get applicants for a specific job
router.get('/jobs/:id/applicants', authenticateToken, isEmployer, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('applicants.userId', 'name email phone');
    
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // Check if employer owns this job
    if (job.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(job.applicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get new applications (notifications)
router.get('/notifications', authenticateToken, isEmployer, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.userId })
      .populate('applicants.userId', 'name email phone');
    
    const newApplications = [];
    
    jobs.forEach(job => {
      job.applicants.forEach(applicant => {
        if (applicant.isNew) {
          newApplications.push({
            id: `${job._id}-${applicant.userId?._id}`,
            jobId: job._id,
            jobTitle: job.title,
            applicant: applicant.userId,
            appliedAt: applicant.appliedAt,
            status: applicant.status
          });
        }
      });
    });
    
    res.json(newApplications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark application as viewed
router.put('/applications/:jobId/:applicantId/viewed', authenticateToken, isEmployer, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    if (job.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const applicant = job.applicants.find(
      app => app.userId.toString() === req.params.applicantId
    );
    
    if (applicant) {
      applicant.isNew = false;
      await job.save();
      res.json({ message: 'Application marked as viewed' });
    } else {
      res.status(404).json({ message: 'Applicant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update application status
router.put('/applications/:jobId/:applicantId', authenticateToken, isEmployer, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const job = await Job.findById(req.params.jobId);
    
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // Check if employer owns this job
    if (job.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const applicant = job.applicants.find(
      app => app.userId.toString() === req.params.applicantId
    );
    
    if (applicant) {
      applicant.status = status;
      if (notes) applicant.employerNotes = notes;
      await job.save();
      res.json({ message: 'Application status updated' });
    } else {
      res.status(404).json({ message: 'Applicant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get employer dashboard stats
router.get('/stats', authenticateToken, isEmployer, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.userId });
    
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === 'approved').length;
    const pendingApproval = jobs.filter(j => j.status === 'pending').length;
    const totalApplicants = jobs.reduce((sum, j) => sum + j.applicants.length, 0);
    
    res.json({
      totalJobs,
      activeJobs,
      pendingApproval,
      totalApplicants
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
