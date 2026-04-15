import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const testRegistration = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  console.log('\n🧪 Testing Registration for Different Roles:\n');
  
  // Test 1: Job Seeker Registration
  console.log('1️⃣  Creating Job Seeker...');
  const jobseeker = new User({
    name: 'Test Student',
    email: 'student@test.com',
    phone: '1111111111',
    password: 'password123',
    role: 'jobseeker'
  });
  await jobseeker.save();
  console.log('   ✅ Job Seeker created successfully!');
  console.log(`   Email: ${jobseeker.email}`);
  console.log(`   Role: ${jobseeker.role}\n`);
  
  // Test 2: Employer Registration
  console.log('2️⃣  Creating Employer...');
  const employer = new User({
    name: 'Test Company',
    email: 'company@test.com',
    phone: '2222222222',
    password: 'password123',
    role: 'employer',
    companyName: 'Test Company Inc',
    companyWebsite: 'https://testcompany.com'
  });
  await employer.save();
  console.log('   ✅ Employer created successfully!');
  console.log(`   Email: ${employer.email}`);
  console.log(`   Role: ${employer.role}`);
  console.log(`   Company: ${employer.companyName}\n`);
  
  // Show all users
  const users = await User.find().select('name email role companyName').sort({ role: 1 });
  console.log('📋 All Registered Users:\n');
  users.forEach((user, index) => {
    const icon = user.role === 'admin' ? '👨‍💼' : user.role === 'employer' ? '🏢' : '👨‍💻';
    console.log(`${index + 1}. ${icon} ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    if (user.companyName) console.log(`   Company: ${user.companyName}`);
    console.log('');
  });
  
  console.log('✅ Registration test completed successfully!\n');
  
  // Cleanup test users
  await User.deleteMany({ email: { $in: ['student@test.com', 'company@test.com'] } });
  console.log('🧹 Cleaned up test users\n');
  
  process.exit(0);
};

testRegistration();
