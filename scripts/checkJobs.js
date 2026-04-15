import mongoose from 'mongoose';
import Job from '../models/Job.js';
import dotenv from 'dotenv';

dotenv.config();

const checkJobs = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const jobs = await Job.find().select('title status company').sort({ createdAt: -1 });
  
  console.log('\n📋 Current Jobs in Database:\n');
  jobs.forEach((job, index) => {
    const icon = job.status === 'approved' ? '✅' : job.status === 'pending' ? '⏳' : '❌';
    console.log(`${index + 1}. ${icon} ${job.title}`);
    console.log(`   Status: ${job.status.toUpperCase()}`);
    console.log(`   Company: ${job.company}\n`);
  });
  
  const approved = jobs.filter(j => j.status === 'approved').length;
  const pending = jobs.filter(j => j.status === 'pending').length;
  
  console.log(`\n📊 Summary:`);
  console.log(`   Approved: ${approved} (visible to job seekers)`);
  console.log(`   Pending: ${pending} (waiting for admin approval)`);
  console.log(`   Total: ${jobs.length}\n`);
  
  process.exit(0);
};

checkJobs();
