import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Admin schema
const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, default: 'admin' },
  isActive: { type: Boolean, default: true },
  isSuspended: { type: Boolean, default: false },
  permissions: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Admin = mongoose.model('Admin', adminSchema);

const updateAdminPassword = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-discount-platform';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Email to update
    const email = 'dakshkoli17@gmail.com';
    const newPassword = 'Admin@123'; // Change this to desired password

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update admin password
    const result = await Admin.findOneAndUpdate(
      { email },
      { password: hashedPassword, updatedAt: new Date() },
      { new: true }
    );

    if (!result) {
      console.log('❌ Admin not found');
      process.exit(1);
    }

    console.log('✅ Admin password updated successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 New Password: ${newPassword}`);
    console.log('\n⚠️  Remember to change this password after first login!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin password:', error);
    process.exit(1);
  }
};

updateAdminPassword();
