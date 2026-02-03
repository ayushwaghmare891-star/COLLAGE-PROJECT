import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';

dotenv.config();

const getSignupStats = async () => {
  try {
    console.log('\n📊 DATABASE SIGNUP STATISTICS\n');
    console.log('MongoDB URI:', process.env.MONGODB_URI?.substring(0, 50) + '...');
    
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB\n');
    
    // Count total students
    const totalStudents = await Student.countDocuments();
    console.log('📈 Total students in database:', totalStudents);
    
    if (totalStudents > 0) {
      // Get recent students
      console.log('\n📋 Recent students (last 5):');
      const recentStudents = await Student.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('email name role createdAt');
      
      recentStudents.forEach((student: any, index: number) => {
        console.log(`  ${index + 1}. ${student.email} (${student.name}) - Created: ${new Date(student.createdAt).toLocaleString()}`);
      });
    } else {
      console.log('⚠️  No students found in database yet');
    }
    
    console.log('\n✅ Check complete\n');
    
    await mongoose.connection.close();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
};

getSignupStats();
