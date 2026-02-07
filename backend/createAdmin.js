import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import { hashPassword } from './utils/helpers.js';

dotenv.config();

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-discount-platform';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const hashedPassword = await hashPassword('Ayush@143');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'dakshkoli17@gmail.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin already exists with this email');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👤 Name: ${existingAdmin.name}`);
      console.log(`⚙️  Role: ${existingAdmin.role}`);
      await mongoose.connection.close();
      return;
    }

    const admin = await Admin.create({
      name: 'Admin User',
      email: 'dakshkoli17@gmail.com',
      password: hashedPassword,
      role: 'admin',
    });

    console.log('\n✅ ADMIN USER CREATED SUCCESSFULLY\n');
    console.log('📊 ====== ADMIN DETAILS ======');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Name: ${admin.name}`);
    console.log(`⚙️  Role: ${admin.role}`);
    console.log(`🔐 Password: Ayush@143 (hashed in database)`);
    console.log(`⏰ Created At: ${admin.createdAt}`);
    console.log(`==============================\n`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
