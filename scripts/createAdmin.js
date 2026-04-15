// backend/scripts/createAdmin.js
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');
    
    const adminExists = await User.findOne({ email: 'admin@jobportal.com' });
    
    if (!adminExists) {
      const admin = new User({
        name: 'Admin User',
        email: 'admin@jobportal.com',
        phone: '9999999999',
        password: 'admin123',
        role: 'admin'
      });
      
      await admin.save();
      console.log('✅ Admin user created successfully!');
      console.log('Email: admin@jobportal.com');
      console.log('Password: admin123');
    } else {
      console.log('⚠️ Admin user already exists');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

createAdmin();