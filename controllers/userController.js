// backend/controllers/userController.js
import User from '../models/User.js';

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('savedJobs')
      .populate({
        path: 'appliedJobs.jobId',
        model: 'Job'
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { 
      name, phone, email, 
      bio, skills, experience, education, portfolio, linkedin, github,
      companyName, companyWebsite, companyDescription 
    } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (email) user.email = email;
    
    // Update job seeker fields if user is a job seeker
    if (user.role === 'jobseeker') {
      if (bio !== undefined) user.bio = bio;
      if (skills !== undefined) user.skills = skills;
      if (experience !== undefined) user.experience = experience;
      if (education !== undefined) user.education = education;
      if (portfolio !== undefined) user.portfolio = portfolio;
      if (linkedin !== undefined) user.linkedin = linkedin;
      if (github !== undefined) user.github = github;
    }
    
    // Update employer fields if user is an employer
    if (user.role === 'employer') {
      if (companyName) user.companyName = companyName;
      if (companyWebsite) user.companyWebsite = companyWebsite;
      if (companyDescription) user.companyDescription = companyDescription;
    }
    
    await user.save();
    
    const userProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    };
    
    // Add job seeker fields if applicable
    if (user.role === 'jobseeker') {
      userProfile.bio = user.bio;
      userProfile.skills = user.skills;
      userProfile.experience = user.experience;
      userProfile.education = user.education;
      userProfile.resume = user.resume;
      userProfile.portfolio = user.portfolio;
      userProfile.linkedin = user.linkedin;
      userProfile.github = user.github;
    }
    
    // Add employer fields if applicable
    if (user.role === 'employer') {
      userProfile.companyName = user.companyName;
      userProfile.companyWebsite = user.companyWebsite;
      userProfile.companyDescription = user.companyDescription;
    }
    
    res.json({
      message: 'Profile updated successfully',
      user: userProfile
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Upload resume
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.resume = req.file.path;
    await user.save();

    res.json({
      message: 'Resume uploaded successfully',
      resumePath: req.file.path
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save/Bookmark a job
export const saveJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if job already saved
    const alreadySaved = user.savedJobs.some(
      id => id.toString() === jobId
    );
    
    if (alreadySaved) {
      return res.status(400).json({ message: 'Job already saved' });
    }
    
    user.savedJobs.push(jobId);
    await user.save();
    
    res.json({ message: 'Job saved successfully', savedJobs: user.savedJobs });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get saved jobs
export const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('savedJobs')
      .select('savedJobs');
    
    res.json(user.savedJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove saved job
export const removeSavedJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const user = await User.findById(req.user.userId);
    
    user.savedJobs = user.savedJobs.filter(
      id => id.toString() !== jobId
    );
    
    await user.save();
    res.json({ message: 'Job removed from saved list' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user role (admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
