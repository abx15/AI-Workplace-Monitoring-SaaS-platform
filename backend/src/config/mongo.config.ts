import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Fix for querySrv ECONNREFUSED on certain networks (e.g. Jio/Airtel in India)
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

export const connectMongo = async () => {
  try {
    if (process.env.MOCK_MONGO === 'true') {
      console.log('⚠️ MongoDB is in MOCK mode. AI logging will be disabled.');
      return;
    }

    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      family: 4, 
    });
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err: any) {
    if (err.message.includes('querySrv')) {
      console.error('❌ MongoDB SRV resolution failed. Bypassing with standard URI...');
    } else {
      console.error('❌ MongoDB connection failed:', err.message);
    }
    console.error('Tip: Ensure your IP is whitelisted in MongoDB Atlas and Port 27017 is open.');
    process.exit(1); 
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

export default connectMongo;
