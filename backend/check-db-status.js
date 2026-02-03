#!/usr/bin/env node
/**
 * Database Status Check Script
 * Shows current state of Student and Admin collections
 */

import mongoose from 'mongoose';
import Student from './models/Student.js';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-discount-platform';

async function main() {
  try {
    console.log('\n📡 Connecting to MongoDB...');
    console.log(`   URI: ${MONGODB_URI}\n`);
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ Connected to MongoDB\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('                    DATABASE STATUS');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Count collections
    const studentCount = await Student.countDocuments();
    const adminCount = await Admin.countDocuments();
    
    console.log(`📊 Collection Counts:`);
    console.log(`   Students:  ${studentCount}`);
    console.log(`   Admins:    ${adminCount}`);
    console.log();
    
    // Show recent students
    if (studentCount > 0) {
      console.log('📋 Recent Students:');
      const students = await Student.find({}).sort({ createdAt: -1 }).limit(5);
      students.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.name} (${s.email})`);
        console.log(`      - ID: ${s._id}`);
        console.log(`      - Status: ${s.approvalStatus} / ${s.verificationStatus}`);
        console.log(`      - Created: ${s.createdAt}`);
      });
    } else {
      console.log('⚠️  No students found');
    }
    
    console.log();
    
    // Show admins
    if (adminCount > 0) {
      console.log('📋 Admins:');
      const admins = await Admin.find({});
      admins.forEach((a, i) => {
        console.log(`   ${i + 1}. ${a.name} (${a.email})`);
        console.log(`      - Active: ${a.isActive}`);
      });
    } else {
      console.log('⚠️  No admins found');
    }
    
    console.log('\n═══════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n⚠️  Troubleshooting:');
    console.log('   1. Ensure MongoDB is running');
    console.log('   2. Check MONGODB_URI in .env');
    console.log('   3. Verify network connectivity');
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB\n');
    }
  }
}

main();
