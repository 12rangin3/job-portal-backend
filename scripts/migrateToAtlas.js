// backend/scripts/migrateToAtlas.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

dotenv.config();

const LOCAL_URI = 'mongodb://localhost:27017/jobportal';
const ATLAS_URI = process.env.MONGODB_URI; // Should be set to Atlas URI

const migrateData = async () => {
  try {
    console.log('🔄 Starting data migration from local MongoDB to Atlas...');

    // Connect to local database
    const localConnection = await mongoose.createConnection(LOCAL_URI);
    console.log('✅ Connected to local MongoDB');

    // Connect to Atlas
    const atlasConnection = await mongoose.createConnection(ATLAS_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Get models for local DB
    const LocalUser = localConnection.model('User', User.schema);
    const LocalJob = localConnection.model('Job', Job.schema);
    const LocalApplication = localConnection.model('Application', Application.schema);

    // Get models for Atlas
    const AtlasUser = atlasConnection.model('User', User.schema);
    const AtlasJob = atlasConnection.model('Job', Job.schema);
    const AtlasApplication = atlasConnection.model('Application', Application.schema);

    // Clear Atlas collections (optional - remove if you want to keep existing Atlas data)
    await AtlasUser.deleteMany({});
    await AtlasJob.deleteMany({});
    await AtlasApplication.deleteMany({});
    console.log('🗑️ Cleared Atlas collections');

    // Migrate Users
    const users = await LocalUser.find({});
    if (users.length > 0) {
      await AtlasUser.insertMany(users);
      console.log(`✅ Migrated ${users.length} users`);
    }

    // Migrate Jobs
    const jobs = await LocalJob.find({});
    if (jobs.length > 0) {
      await AtlasJob.insertMany(jobs);
      console.log(`✅ Migrated ${jobs.length} jobs`);
    }

    // Migrate Applications
    const applications = await LocalApplication.find({});
    if (applications.length > 0) {
      await AtlasApplication.insertMany(applications);
      console.log(`✅ Migrated ${applications.length} applications`);
    }

    // Close connections
    await localConnection.close();
    await atlasConnection.close();

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateData();</content>
<parameter name="filePath">c:\Users\Swagat Kumar Edla\OneDrive\Desktop\WEB DEVELOPEMENT\Project-2\2.Job-Portal\backend\scripts\migrateToAtlas.js