import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectNeon } from './config/neon.config';
import { connectMongo } from './config/mongo.config';
import { initSocket } from './socket/socket.handler';

// Routes
import authRoutes from './routes/auth.routes';
import cameraRoutes from './routes/camera.routes';
import operatorRoutes from './routes/operator.routes';
import employeeRoutes from './routes/employee.routes';
import alertRoutes from './routes/alert.routes';
import subscriptionRoutes from './routes/subscription.routes';
import analyticsRoutes from './routes/analytics.routes';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.io
initSocket(server);

// Routes Registration
app.use('/api/auth', authRoutes);
app.use('/api/cameras', cameraRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Workplace Monitor Backend is running' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectNeon();
    await connectMongo();

    server.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
