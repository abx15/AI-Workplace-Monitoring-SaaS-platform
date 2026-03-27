import mongoose from 'mongoose';
import dns from 'dns';

// Fix for querySrv ECONNREFUSED on certain networks (e.g. Jio/Airtel in India)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Global is used here to maintain a cached connection across hot reloads in development
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000,
      family: 4,
    }).then(async (mongoose) => {
      console.log('✅ Next.js MongoDB Connected');
      
      // Test connection with ping
      await mongoose.connection.db.admin().ping();
      console.log('✅ Next.js MongoDB Ping Successful');
      
      return mongoose;
    }).catch(async (error) => {
      if (error.message.includes('querySrv') || error.message.includes('ENOTFOUND')) {
        console.error('❌ Next.js MongoDB SRV resolution failed. Attempting fallback connection...');
        
        // Fallback to non-SRV connection
        const fallbackUri = MONGODB_URI.replace('mongodb+srv://', 'mongodb://');
        return mongoose.connect(fallbackUri, {
          bufferCommands: false,
          serverSelectionTimeoutMS: 30000,
          family: 4,
        }).then(async (mongoose) => {
          console.log('✅ Next.js MongoDB Connected via fallback (non-SRV)');
          
          // Test fallback connection
          await mongoose.connection.db.admin().ping();
          console.log('✅ Next.js MongoDB Fallback Ping Successful');
          
          return mongoose;
        });
      } else {
        console.error('❌ Next.js MongoDB connection failed:', error.message);
        throw error;
      }
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
