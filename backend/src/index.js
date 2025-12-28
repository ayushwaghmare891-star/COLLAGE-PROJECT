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
import { Vendor } from './models/Vendor.js';
(async () => {
  try {
    // Migration: Approve all vendors (for testing)
    try {
      const result = await Vendor.updateMany(
        {},
        { 
          approvalStatus: 'approved',
          status: 'active'
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Auto-approved ${result.modifiedCount} vendors`);
      } else {
        console.log('All vendors are already approved');
      }
    } catch (err) {
      console.error('Error approving vendors:', err.message);
    }

    // Migration: Delete offers without vendorId (orphaned offers)
    try {
      const allOffers = await Offer.find({}).lean();
      
      let fixedCount = 0;
      let deletedCount = 0;
      
      for (const offerData of allOffers) {
        const offer = await Offer.findById(offerData._id);
        
        // Check if vendorId is null, undefined, or empty
        const hasValidVendorId = offer.vendorId && 
                                 String(offer.vendorId).trim() !== '' && 
                                 String(offer.vendorId) !== 'null' &&
                                 String(offer.vendorId) !== 'undefined';
        
        if (!hasValidVendorId) {
          console.log(`⚠️ Found offer "${offer.title}" with invalid vendorId:`, offer.vendorId);
          
          // Try to find vendor by createdBy
          if (offer.createdBy && offer.createdBy.trim() !== '') {
            try {
              const vendor = await Vendor.findById(offer.createdBy);
              if (vendor && vendor._id) {
                offer.vendorId = vendor._id;
                await offer.save();
                console.log(`✅ Fixed offer "${offer.title}" - assigned vendorId: ${vendor._id}`);
                fixedCount++;
                continue;
              }
            } catch (e) {
              console.log(`⚠️ Could not find vendor for createdBy: ${offer.createdBy}`);
            }
          }
          
          // If no vendor found or createdBy invalid, delete the orphaned offer
          await Offer.findByIdAndDelete(offer._id);
          console.log(`🗑️ Deleted orphaned offer "${offer.title}"`);
          deletedCount++;
        }
      }
      
      if (fixedCount > 0 || deletedCount > 0) {
        console.log(`Offer migration complete: Fixed ${fixedCount}, Deleted ${deletedCount}`);
      } else {
        console.log('All offers are valid - no migration needed');
      }
    } catch (err) {
      console.error('Error during offer migration:', err.message);
    }
  } catch (error) {
    console.error('Error during startup migrations:', error);
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
