import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const showAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-discount-platform';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Fetch all admins
    const admins = await Admin.find();

    if (admins.length === 0) {
      console.log('❌ No admin users found in the database');
      await mongoose.connection.close();
      return;
    }

    console.log(`📊 ====== ADMIN USERS (${admins.length}) ======\n`);
    
    admins.forEach((admin, index) => {
      console.log(`Admin #${index + 1}`);
      console.log(`─────────────────────────────`);
      console.log(`📧 Email: ${admin.email}`);
      console.log(`👤 Name: ${admin.name}`);
      console.log(`⚙️  Role: ${admin.role}`);
      console.log(`🔒 Verified: ${admin.isVerified || false}`);
      console.log(`✓ Active: ${admin.isActive !== false}`);
      console.log(`⏰ Created: ${admin.createdAt}`);
      console.log(`📝 Updated: ${admin.updatedAt}`);
      console.log();
    });

    console.log(`=====================================\n`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

showAdmin();
