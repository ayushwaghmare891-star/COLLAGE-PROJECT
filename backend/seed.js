import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import Admin from './models/Admin.js';
import Offer from './models/Offer.js';
import { hashPassword } from './utils/helpers.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-discount-platform';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out to keep data)
    // await User.deleteMany({});
    // await Offer.deleteMany({});

    // Create test users
    const studentPassword = await hashPassword('Test@1234');
    const studentPassword = await hashPassword('Test@1234');
    const adminPassword = await hashPassword('Ayush@143');

    const student = await Student.create({
      name: 'Test Student',
      email: 'student@example.com',
      password: studentPassword,
      role: 'student',
      isVerified: true,
      verificationStatus: 'verified',
      universityName: 'Test University',
      graduationYear: 2025,
    });
    console.log('✅ Created student account:', student.email);

    const admin = await Admin.create({
      name: 'Admin User',
      email: 'ayushwaghmare415@gmail.com',
      password: adminPassword,
      role: 'admin',
    });
    console.log('✅ Created admin account:', admin.email);

    // Note: Offers require a vendor, but vendor has been removed
    // Create sample offers removed - vendor functionality has been removed
    console.log('✅ Skipped sample offers creation - vendor functionality removed');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Student: student@example.com / Test@1234');
    console.log('   Admin: ayushwaghmare415@gmail.com / Ayush@143');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
