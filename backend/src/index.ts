import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import { connectMongo } from './config/mongo.config';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import cameraRoutes from './routes/camera.routes';
import alertRoutes from './routes/alert.routes';
import analyticsRoutes from './routes/analytics.routes';
import aiRoutes from './routes/ai.routes';

// Apply GLOBAL DNS fix first
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cameras', cameraRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    mongodb: 'connected',
    timestamp: new Date().toISOString()
  });
});

// API test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is running!',
    mongodb: 'connected',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Socket.io connection (optional)
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket: any) => {
  console.log('🔌 Client connected to Socket.io');
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected from Socket.io');
  });
});

// Critical startup flow
async function startServer() {
  console.log('🚀 Starting AI Workplace Monitor Backend...\n');
  
  // Step 1: DNS fix
  console.log('✅ DNS servers configured (8.8.8.8, 8.8.4.4)\n');
  
  // Step 2: MongoDB connection (CRITICAL)
  console.log('📍 Step 2: Connecting to MongoDB...');
  try {
    await connectMongo();
    console.log('✅ MongoDB connection established\n');
  } catch (error: any) {
    console.error('❌ MongoDB connection failed permanently:', error.message);
    console.error('🔧 Check your MongoDB Atlas credentials and network connectivity');
    process.exit(1);
  }
  
  // Step 3: Start server
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🎉 Server running in development mode on port ${PORT}`);
    console.log(`🔗 Backend URL: http://localhost:${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
    console.log(`🔗 API Test: http://localhost:${PORT}/api/test`);
    console.log(`\n🔥 All services initialized successfully!`);
    console.log(`\n📊 Service Status:`);
    console.log(`   ✅ MongoDB: Connected`);
    console.log(`   ✅ Express Server: Running`);
    console.log(`   ✅ Socket.io: Running`);
    console.log(`\n🛣️  Available Routes:`);
    console.log(`   📝 Auth: /api/auth/*`);
    console.log(`   👥 Users: /api/users/*`);
    console.log(`   📹 Cameras: /api/cameras/*`);
    console.log(`   🚨 Alerts: /api/alerts/*`);
    console.log(`   📊 Analytics: /api/analytics/*`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Start the server
startServer().catch(console.error);
