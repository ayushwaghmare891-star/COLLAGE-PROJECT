import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import Admin from './models/Admin.js';

dotenv.config();

const changeRole = async (email, newRole) => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-discount-platform';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const validRoles = ['student', 'admin'];
    if (!validRoles.includes(newRole)) {
      console.error('❌ Invalid role. Must be: student, or admin');
      process.exit(1);
    }

    // Find user in any collection
    let user = null;
    let currentRole = null;
    let collection = null;

    const studentUser = await Student.findOne({ email });
    if (studentUser) {
      user = studentUser;
      currentRole = 'student';
      collection = 'Student';
    }

    const adminUser = await Admin.findOne({ email });
    if (adminUser) {
      user = adminUser;
      currentRole = 'admin';
      collection = 'Admin';
    }

    if (!user) {
      console.error(`❌ User with email "${email}" not found in any collection`);
      process.exit(1);
    }

    console.log(`\n📋 ====== ROLE CHANGE REQUEST ======`);
    console.log(`👤 User Name: ${user.name}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🏢 Current Collection: ${collection}`);
    console.log(`⚙️  Current Role: ${currentRole}`);
    console.log(`➜ New Role: ${newRole}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    console.log(`=====================================\n`);

    // Direct MongoDB Update based on which collection the user was found in
    let updatedUser = null;
    
    if (collection === 'Student') {
      await Student.updateOne(
        { email: email },
        { $set: { role: newRole } },
        { upsert: false }
      );
      updatedUser = await Student.findOne({ email });
    } else if (collection === 'Admin') {
      await Admin.updateOne(
        { email: email },
        { $set: { role: newRole } },
        { upsert: false }
      );
      updatedUser = await Admin.findOne({ email });
    }

    console.log(`✅ ROLE UPDATED SUCCESSFULLY IN MONGODB`);
    console.log(`\n📊 ====== UPDATE CONFIRMATION ======`);
    console.log(`📧 Email: ${updatedUser.email}`);
    console.log(`👤 Name: ${updatedUser.name}`);
    console.log(`✓ Role: ${updatedUser.role}`);
    console.log(`📝 Updated At: ${new Date().toISOString()}`);
    console.log(`=====================================\n`);

    // Log audit trail
    console.log(`🔐 ADMIN AUDIT LOG:`);
    console.log(`   - Direct MongoDB update executed`);
    console.log(`   - Role changed from: ${currentRole} → ${newRole}`);
    console.log(`   - Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/student-discount-platform'}`);
    console.log(`   - Status: ✓ CONFIRMED\n`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Get email and role from command line arguments
const email = process.argv[2];
const newRole = process.argv[3];

if (!email || !newRole) {
  console.log('Usage: node changeRole.js <email> <new-role>');
  console.log('Example: node changeRole.js ayushwaghmare777@gmail.com admin');
  console.log('Roles: student, admin');
  process.exit(1);
}

changeRole(email, newRole);
