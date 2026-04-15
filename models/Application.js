// backend/models/Application.js
import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  resume: String,
  coverLetter: String,
  appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Application', applicationSchema);