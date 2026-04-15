// backend/routes/jobs.js
import express from 'express';
import Job from '../models/Job.js';
import { authenticateToken, isAdmin, isEmployer } from '../middleware/auth.js';

const router = express.Router();

// Get all jobs (public) - only approved jobs
router.get('/', async (req, res) => {
  try {
    const { search, location, jobType, experienceLevel, minSalary, page = 1, limit = 10 } = req.query;
    let query = { 
      isActive: true,
      status: 'approved' // Only show approved jobs
    };

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Location filter
    if (location) query.location = { $regex: location, $options: 'i' };
    
    // Job type filter
    if (jobType) query.jobType = jobType;
    
    // Experience level filter
    if (experienceLevel) query.experienceLevel = experienceLevel;
    
    // Minimum salary filter
    if (minSalary) {
      query.salary = { $regex: minSalary, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('postedBy', 'name email');

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create job (employer or admin)
router.post('/', authenticateToken, isEmployer, async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      postedBy: req.user.userId,
      status: req.user.role === 'admin' ? 'approved' : 'pending' // Auto-approve admin jobs
    });
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update job (employer can update their own, admin can update any)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // Check if user is owner or admin
    if (job.postedBy.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }
    
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updatedJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete job (employer can delete their own, admin can delete any)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // Check if user is owner or admin
    if (job.postedBy.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }
    
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Apply for job
router.post('/:id/apply', authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const alreadyApplied = job.applicants.some(
      app => app.userId.toString() === req.user.userId
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    // Add applicant with notification flag
    job.applicants.push({ 
      userId: req.user.userId,
      appliedAt: new Date(),
      status: 'pending',
      isNew: true // Flag for notification
    });
    await job.save();

    res.json({ 
      message: 'Application submitted successfully',
      application: {
        jobId: job._id,
        jobTitle: job.title,
        company: job.company,
        appliedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;