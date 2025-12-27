import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB } from './config/db.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import studentAuthRoutes from './routes/studentAuthRoutes.js';
import vendorAuthRoutes from './routes/vendorAuthRoutes.js';
import userRoutes from './routes/userRoutes.js';
import discountRoutes from './routes/discountRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import studentDashboardRoutes from './routes/studentDashboardRoutes.js';
import vendorDashboardRoutes from './routes/vendorDashboardRoutes.js';
import adminDashboardRoutes from './routes/adminDashboardRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directories if they don't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
const studentIdsDir = path.join(uploadsDir, 'student-ids');
const documentsDir = path.join(uploadsDir, 'documents');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(studentIdsDir)) {
  fs.mkdirSync(studentIdsDir, { recursive: true });
}
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Connect to Database
connectDB();

// Migration: Fix offers without codes on startup
import { Offer } from './models/Offer.js';
(async () => {
  try {
    const offersWithoutCodes = await Offer.find({ code: { $in: [null, ''] } });
    
    if (offersWithoutCodes.length > 0) {
      console.log(`Found ${offersWithoutCodes.length} offers without codes. Generating codes...`);
      
      for (const offer of offersWithoutCodes) {
        let isUnique = false;
        let attempts = 0;
        let finalCode = '';
        
        while (!isUnique && attempts < 10) {
          const timestamp = Date.now().toString().slice(-6);
          const random = Math.random().toString(36).substring(2, 8).toUpperCase();
          finalCode = `${offer.title.substring(0, 3).toUpperCase()}${timestamp}${random}`;
          
          const existingCode = await Offer.findOne({ code: finalCode });
          if (!existingCode) {
            isUnique = true;
          }
          attempts++;
        }
        
        if (isUnique) {
          offer.code = finalCode;
          await offer.save();
          console.log(`Generated code for offer "${offer.title}": ${finalCode}`);
        }
      }
      
      console.log('Migration complete: All offers now have codes');
    } else {
      console.log('All offers have codes - no migration needed');
    }
  } catch (error) {
    console.error('Error during offer code migration:', error);
  }
})();

// Routes for 3 user types: Admin, Student, Vendor
app.use('/api/auth', authRoutes);                    // Admin auth (register, login, logout)
app.use('/api/auth/student', studentAuthRoutes);    // Student auth (register, login, logout)
app.use('/api/auth/vendor', vendorAuthRoutes);      // Vendor auth (register, login, logout)
app.use('/api/users', userRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/coupons', couponRoutes);

// Dashboard routes for each user type
app.use('/api/student/dashboard', studentDashboardRoutes);
app.use('/api/vendor/dashboard', vendorDashboardRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ message: 'Server is running', status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
