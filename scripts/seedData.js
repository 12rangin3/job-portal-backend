// backend/scripts/seedData.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Job from '../models/Job.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      phone: '1234567890',
      password: 'admin123',
      role: 'admin'
    });

    // Create sample users
    const jobseeker1 = await User.create({
      name: 'John Doe',
      email: 'john@test.com',
      phone: '9876543210',
      password: 'password123',
      role: 'jobseeker'
    });

    const jobseeker2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@test.com',
      phone: '9876543211',
      password: 'password123',
      role: 'jobseeker'
    });

    // Create employer user
    const employer1 = await User.create({
      name: 'Sarah Johnson',
      email: 'employer@test.com',
      phone: '9876543212',
      password: 'password123',
      role: 'employer',
      companyName: 'Tech Solutions Inc',
      companyWebsite: 'https://techsolutions.com'
    });

    console.log('✅ Created users');

    // Create sample jobs
    const jobs = await Job.insertMany([
      {
        title: 'Full Stack Developer',
        company: 'Tech Solutions Inc',
        location: 'New York, NY',
        salary: '$80,000 - $120,000',
        description: 'We are looking for an experienced Full Stack Developer to join our team. You will be responsible for developing and maintaining web applications using modern technologies.',
        requirements: ['3+ years experience with React', 'Node.js proficiency', 'MongoDB experience', 'Git version control'],
        jobType: 'full-time',
        experienceLevel: 'mid',
        category: 'Technology',
        postedBy: employer1._id,
        status: 'approved',
        isActive: true,
        deadline: new Date('2026-06-01')
      },
      {
        title: 'Frontend Developer',
        company: 'Tech Solutions Inc',
        location: 'San Francisco, CA',
        salary: '$70,000 - $100,000',
        description: 'Join our creative team as a Frontend Developer. You will work on creating beautiful and responsive user interfaces for our clients.',
        requirements: ['Strong HTML/CSS/JavaScript skills', 'React or Vue.js experience', 'Responsive design expertise', 'UI/UX understanding'],
        jobType: 'full-time',
        experienceLevel: 'entry',
        category: 'Technology',
        postedBy: employer1._id,
        status: 'approved',
        isActive: true,
        deadline: new Date('2026-05-15')
      },
      {
        title: 'Backend Engineer',
        company: 'Tech Solutions Inc',
        location: 'Remote',
        salary: '$90,000 - $130,000',
        description: 'We need a skilled Backend Engineer to design and implement scalable server-side applications and APIs.',
        requirements: ['5+ years backend development', 'Node.js/Express', 'Database design (SQL/NoSQL)', 'API development'],
        jobType: 'remote',
        experienceLevel: 'senior',
        category: 'Technology',
        postedBy: employer1._id,
        status: 'pending',
        isActive: true,
        deadline: new Date('2026-07-01')
      },
      {
        title: 'UI/UX Designer',
        company: 'Tech Solutions Inc',
        location: 'Los Angeles, CA',
        salary: '$60,000 - $85,000',
        description: 'Looking for a talented UI/UX Designer to create stunning user experiences for web and mobile applications.',
        requirements: ['Portfolio showcasing UI/UX work', 'Figma/Sketch proficiency', 'User research experience', 'Prototyping skills'],
        jobType: 'full-time',
        experienceLevel: 'mid',
        category: 'Design',
        postedBy: employer1._id,
        status: 'approved',
        isActive: true,
        deadline: new Date('2026-05-30')
      },
      {
        title: 'DevOps Engineer',
        company: 'Tech Solutions Inc',
        location: 'Seattle, WA',
        salary: '$95,000 - $140,000',
        description: 'Join our infrastructure team to build and maintain CI/CD pipelines and cloud infrastructure.',
        requirements: ['AWS/Azure experience', 'Docker & Kubernetes', 'CI/CD pipeline management', 'Linux administration'],
        jobType: 'full-time',
        experienceLevel: 'senior',
        category: 'Technology',
        postedBy: employer1._id,
        status: 'approved',
        isActive: true,
        deadline: new Date('2026-06-15')
      },
      {
        title: 'Marketing Intern',
        company: 'Tech Solutions Inc',
        location: 'Austin, TX',
        salary: '$20/hour',
        description: 'Great opportunity for a marketing student to gain hands-on experience in digital marketing and growth strategies.',
        requirements: ['Currently pursuing marketing degree', 'Social media knowledge', 'Content creation skills', 'Analytics understanding'],
        jobType: 'internship',
        experienceLevel: 'entry',
        category: 'Marketing',
        postedBy: employer1._id,
        status: 'pending',
        isActive: true,
        deadline: new Date('2026-04-30')
      }
    ]);

    console.log(`✅ Created ${jobs.length} jobs`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📧 Demo Credentials:');
    console.log('\n👨‍💼 Admin:');
    console.log('   Email: admin@test.com');
    console.log('   Password: admin123');
    console.log('   Access: Full platform control, approve/reject jobs');
    console.log('\n🏢 Employer:');
    console.log('   Email: employer@test.com');
    console.log('   Password: password123');
    console.log('   Company: Tech Solutions Inc');
    console.log('   Access: Post jobs, view applicants, manage listings');
    console.log('\n👨‍💻 Job Seeker:');
    console.log('   Email: john@test.com');
    console.log('   Password: password123');
    console.log('   Access: Browse jobs, apply, track applications\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
