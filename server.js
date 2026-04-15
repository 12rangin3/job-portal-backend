// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import employerRoutes from './routes/employer.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-vercel-url.vercel.app', 'http://localhost:3000'] 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal')
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employer', employerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const isVercel = process.env.VERCEL === '1';
const PORT = process.env.PORT || 5000;

if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;