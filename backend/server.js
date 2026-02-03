import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: `${__dirname}/.env` });

// Import routes
import authRoutes from './routes/auth.js';
import loginRoutes from './routes/login.js';
import offersRoutes from './routes/offers.js';
import couponsRoutes from './routes/coupons.js';
import studentRoutes from './routes/student.js';
import adminRoutes from './routes/admin.js';
import vendorRoutes from './routes/vendor.js';
import verificationRoutes from './routes/verification.js';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
});

// Track active admin connections and rooms
const adminConnections = new Map();
const vendorConnections = new Map();

io.on('connection', (socket) => {
  console.log('📡 New socket connection:', socket.id);

  // ========== ADMIN CONNECTIONS ==========
  socket.on('admin:join', (adminId) => {
    socket.join(`admin:${adminId}`);
    socket.join('admins');
    adminConnections.set(socket.id, adminId);
    console.log(`✅ Admin ${adminId} joined real-time updates`);
    socket.emit('connection:status', { connected: true, message: 'Connected to real-time updates', userType: 'admin' });
    // Notify other admins
    socket.broadcast.to('admins').emit('admin:joined', { adminId, timestamp: new Date() });
  });

  // Broadcast student list updates to all admins
  socket.on('admin:request-students', async (adminId) => {
    try {
      const { default: Student } = await import('./models/Student.js');
      const students = await Student.find().select('-password').lean();
      io.to('admins').emit('students:updated', { students, timestamp: new Date() });
      console.log('📤 Broadcasting student update to all admins');
    } catch (error) {
      console.error('Error fetching students for broadcast:', error);
      socket.emit('error:broadcast', { message: 'Failed to fetch students' });
    }
  });



  // Request offers update
  socket.on('admin:request-offers', async (adminId) => {
    try {
      const { default: Offer } = await import('./models/Offer.js');
      const offers = await Offer.find().lean();
      io.to('admins').emit('offers:updated', { offers, timestamp: new Date() });
      console.log('📤 Broadcasting offers update to all admins');
    } catch (error) {
      console.error('Error fetching offers for broadcast:', error);
      socket.emit('error:broadcast', { message: 'Failed to fetch offers' });
    }
  });

  // ========== VENDOR CONNECTIONS ==========
  socket.on('vendor:join', (vendorId) => {
    socket.join(`vendor:${vendorId}`);
    socket.join('vendors');
    vendorConnections.set(socket.id, vendorId);
    console.log(`✅ Vendor ${vendorId} joined real-time updates`);
    socket.emit('connection:status', { connected: true, message: 'Connected to real-time updates', userType: 'vendor' });
    socket.broadcast.to('vendors').emit('vendor:joined', { vendorId, timestamp: new Date() });
  });

  // Vendor requesting their own offers
  socket.on('vendor:request-offers', async (vendorId) => {
    try {
      const { default: Offer } = await import('./models/Offer.js');
      const offers = await Offer.find({ vendorId }).lean();
      socket.emit('vendor:offers', { offers, timestamp: new Date() });
      console.log(`📤 Sending vendor ${vendorId} their offers`);
    } catch (error) {
      console.error('Error fetching vendor offers:', error);
      socket.emit('error:broadcast', { message: 'Failed to fetch offers' });
    }
  });

  // ========== VENDOR PRODUCTS ==========
  socket.on('vendor:request-products', async (vendorId) => {
    try {
      const { default: Offer } = await import('./models/Offer.js');
      const products = await Offer.find({ vendorId }).lean();
      socket.emit('vendor:products:loaded', { products, timestamp: new Date() });
      console.log(`📤 Sending vendor ${vendorId} their products`);
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      socket.emit('error:broadcast', { message: 'Failed to fetch products' });
    }
  });

  // ========== VENDOR ORDERS ==========
  socket.on('vendor:request-orders', async (vendorId) => {
    try {
      const { default: Offer } = await import('./models/Offer.js');
      // Get all offers from this vendor
      const offers = await Offer.find({ vendorId }).lean();
      const offerId = offers.map(o => o._id);
      
      // In a real app, you'd have an Order model
      // For now, we're tracking through offers
      const orders = offers.map(offer => ({
        offerId: offer._id,
        title: offer.title,
        redemptions: offer.currentRedemptions || 0,
        maxRedemptions: offer.maxRedemptions || 0,
        createdAt: offer.createdAt,
        status: offer.isActive ? 'active' : 'inactive'
      }));
      
      socket.emit('vendor:orders:loaded', { orders, timestamp: new Date() });
      console.log(`📤 Sending vendor ${vendorId} their orders`);
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
      socket.emit('error:broadcast', { message: 'Failed to fetch orders' });
    }
  });

  // ========== VENDOR ANALYTICS ==========
  socket.on('vendor:request-analytics', async (vendorId) => {
    try {
      const { default: Offer } = await import('./models/Offer.js');
      const offers = await Offer.find({ vendorId }).lean();
      
      const totalOffers = offers.length;
      const activeOffers = offers.filter(o => o.isActive).length;
      const totalRedemptions = offers.reduce((sum, o) => sum + (o.currentRedemptions || 0), 0);
      const totalDiscount = offers.reduce((sum, o) => sum + (o.discountValue || 0) * (o.currentRedemptions || 0), 0);
      
      const analytics = {
        totalOffers,
        activeOffers,
        totalRedemptions,
        totalDiscount,
        averageDiscount: totalOffers > 0 ? totalDiscount / totalRedemptions : 0,
        offers: offers.map(o => ({
          _id: o._id,
          title: o.title,
          redemptions: o.currentRedemptions || 0,
          discount: o.discountValue || 0,
          isActive: o.isActive
        }))
      };
      
      socket.emit('vendor:analytics:loaded', { analytics, timestamp: new Date() });
      console.log(`📤 Sending vendor ${vendorId} their analytics`);
    } catch (error) {
      console.error('Error fetching vendor analytics:', error);
      socket.emit('error:broadcast', { message: 'Failed to fetch analytics' });
    }
  });

  // ========== VENDOR DISCOUNTS/OFFERS ==========
  socket.on('vendor:request-discounts', async (vendorId) => {
    try {
      const { default: Offer } = await import('./models/Offer.js');
      const discounts = await Offer.find({ vendorId }).lean();
      socket.emit('vendor:discounts:loaded', { discounts, timestamp: new Date() });
      console.log(`📤 Sending vendor ${vendorId} their discounts`);
    } catch (error) {
      console.error('Error fetching vendor discounts:', error);
      socket.emit('error:broadcast', { message: 'Failed to fetch discounts' });
    }
  });

  // ========== VENDOR NOTIFICATIONS ==========
  socket.on('vendor:request-notifications', async (vendorId) => {
    try {
      // Broadcast vendor-specific notifications
      socket.emit('vendor:notifications:loaded', { 
        notifications: [
          { id: 1, type: 'offer', message: 'Your offer was approved', timestamp: new Date(), read: false },
          { id: 2, type: 'order', message: 'New offer redemption', timestamp: new Date(), read: false }
        ], 
        timestamp: new Date() 
      });
      console.log(`📤 Sending vendor ${vendorId} their notifications`);
    } catch (error) {
      console.error('Error fetching vendor notifications:', error);
      socket.emit('error:broadcast', { message: 'Failed to fetch notifications' });
    }
  });

  // ========== VENDOR VERIFICATIONS ==========
  socket.on('vendor:request-verifications', async (vendorId) => {
    try {
      const { default: VerificationDocument } = await import('./models/VerificationDocument.js');
      const { default: Student } = await import('./models/Student.js');
      
      // Get pending verification documents
      const verificationDocuments = await VerificationDocument.find({ status: 'pending' })
        .populate({
          path: 'user',
          select: 'name email university verificationStatus',
          model: 'Student',
          match: { verificationStatus: 'pending' }
        })
        .lean();

      const verifications = verificationDocuments
        .filter(doc => doc.user) // Only include docs where user is still pending
        .map(doc => ({
          id: doc._id,
          studentName: doc.user?.name || 'Unknown',
          email: doc.user?.email || 'N/A',
          university: doc.user?.university || 'Not specified',
          documentType: doc.documentType,
          submittedAt: new Date(doc.createdAt).toLocaleString(),
          status: 'pending',
          documentUrl: doc.fileUrl,
          fileName: doc.fileName
        }))
        .slice(0, 5); // Limit to 5 for overview

      socket.emit('vendor:verifications:loaded', { verifications, timestamp: new Date() });
      console.log(`📤 Sending vendor ${vendorId} pending verifications`);
    } catch (error) {
      console.error('Error fetching vendor verifications:', error);
      socket.emit('error:broadcast', { message: 'Failed to fetch verifications' });
    }
  });

  // ========== BROADCAST EVENTS ==========
  // When admin approves a vendor offer, broadcast to that vendor
  socket.on('vendor:broadcast:offer-approved', (data) => {
    const { vendorId, offerId, offerTitle } = data;
    io.to(`vendor:${vendorId}`).emit('vendor:notification:offer-approved', {
      offerId,
      offerTitle,
      message: `Your offer "${offerTitle}" has been approved`,
      timestamp: new Date()
    });
    console.log(`📢 Notifying vendor ${vendorId} about approved offer`);
  });

  socket.on('vendor:broadcast:offer-rejected', (data) => {
    const { vendorId, offerId, offerTitle, reason } = data;
    io.to(`vendor:${vendorId}`).emit('vendor:notification:offer-rejected', {
      offerId,
      offerTitle,
      reason,
      message: `Your offer "${offerTitle}" has been rejected`,
      timestamp: new Date()
    });
    console.log(`📢 Notifying vendor ${vendorId} about rejected offer`);
  });

  socket.on('vendor:broadcast:new-redemption', (data) => {
    const { vendorId, offerId, offerTitle, studentName } = data;
    io.to(`vendor:${vendorId}`).emit('vendor:notification:new-redemption', {
      offerId,
      offerTitle,
      studentName,
      message: `${studentName} redeemed your offer: ${offerTitle}`,
      timestamp: new Date()
    });
    console.log(`📢 Notifying vendor ${vendorId} about new redemption`);
  });

  socket.on('vendor:broadcast:product-updated', (data) => {
    const { vendorId, productName, action } = data;
    io.to(`vendor:${vendorId}`).emit('vendor:notification:product-updated', {
      productName,
      action,
      message: `Product "${productName}" was ${action}`,
      timestamp: new Date()
    });
    console.log(`📢 Notifying vendor ${vendorId} about product update`);
  });

  // Request active connections stats
  socket.on('admin:request-stats', () => {
    const stats = {
      activeAdmins: adminConnections.size,
      activeVendors: vendorConnections ? vendorConnections.size : 0,
      timestamp: new Date(),
    };
    socket.emit('active:connections', stats);
  });

  // Health check ping
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date() });
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    const adminId = adminConnections.get(socket.id);
    const vendorId = vendorConnections.get(socket.id);
    
    if (adminId) {
      adminConnections.delete(socket.id);
      console.log(`❌ Admin ${adminId} disconnected`);
      io.to('admins').emit('admin:disconnected', { adminId, timestamp: new Date() });
    }
    
    if (vendorId) {
      vendorConnections.delete(socket.id);
      console.log(`❌ Vendor ${vendorId} disconnected`);
      io.to('vendors').emit('vendor:disconnected', { vendorId, timestamp: new Date() });
    }
  });

  // Error handling
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });
});

// Export io for use in routes
export { io };

// Database connection
let dbConnected = false;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-discount-platform';
    console.log(`📡 Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    dbConnected = true;
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
};

connectDB();

// Periodic connection check
setInterval(() => {
  io.emit('server:ping', { timestamp: new Date() });
}, 10000);

// Note: Server will start even if database is not connected
// This allows the health check and other routes to function
if (!dbConnected) {
  console.warn('\n⚠️  Starting server without database connection.');
  console.warn('Database requests will fail. Please ensure MongoDB is running.');
}

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: dbConnected ? 'ok' : 'error', 
    message: dbConnected ? 'Server is running and connected to database' : 'Server running but database disconnected',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/student/dashboard', studentRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin/dashboard', adminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/verification', verificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server running on ws://localhost:${PORT}`);
});
