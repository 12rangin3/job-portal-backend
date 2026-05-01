// backend/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['jobseeker', 'employer', 'admin'],
    default: 'jobseeker'
  },
  // Job Seeker profile fields
  bio: { type: String, maxlength: 500 },
  skills: [{ type: String }],
  experience: [{
    title: String,
    company: String,
    duration: String,
    description: String
  }],
  education: [{
    degree: String,
    institution: String,
    year: String,
    grade: String
  }],
  resume: { type: String }, // file path or URL
  portfolio: { type: String }, // portfolio website URL
  linkedin: { type: String },
  github: { type: String },
  // Employer-specific fields
  companyName: { type: String },
  companyWebsite: { type: String },
  companyDescription: { type: String },
  createdAt: {
    type: Date,
    default: Date.now
  },
  appliedJobs: [{
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    appliedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'reviewed', 'accepted', 'rejected'], default: 'pending' }
  }],
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);