import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// GLOBAL DNS FIX - Apply Google DNS servers
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

const connectWithRetry = async (uri: string, maxRetries = 3): Promise<void> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔗 MongoDB connection attempt ${attempt}/${maxRetries}...`);
      
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 30000,
        family: 4,
        maxPoolSize: 10,
        retryWrites: true,
        w: 'majority'
      });
      
      // Test connection with ping
      await mongoose.connection.db.admin().ping();
      console.log('✅ MongoDB Connected');
      return;
      
    } catch (error: any) {
      console.error(`❌ MongoDB connection attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        // Try fallback to non-SRV if SRV failed
        if (error.message.includes('querySrv') || error.message.includes('ENOTFOUND')) {
          console.log('🔄 SRV resolution failed, attempting non-SRV fallback...');
          const fallbackUri = uri.replace('mongodb+srv://', 'mongodb://');
          
          try {
            await mongoose.connect(fallbackUri, {
              serverSelectionTimeoutMS: 30000,
              family: 4,
              maxPoolSize: 10,
              retryWrites: true,
              w: 'majority'
            });
            
            await mongoose.connection.db.admin().ping();
            console.log('✅ MongoDB Connected via fallback (non-SRV)');
            return;
          } catch (fallbackError: any) {
            console.error('❌ MongoDB fallback also failed:', fallbackError.message);
          }
        }
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
};

export const connectMongo = async (): Promise<void> => {
  try {
    if (process.env.MOCK_MONGO === 'true') {
      console.log('⚠️ MongoDB is in MOCK mode. AI logging will be disabled.');
      return;
    }

    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    await connectWithRetry(MONGODB_URI);
    
  } catch (err: any) {
    console.error('❌ MongoDB connection failed permanently:', err.message);
    console.error('Tip: Ensure your IP is whitelisted in MongoDB Atlas and Port 27017 is open.');
    throw err; // Re-throw to handle in startup
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

export default connectMongo;
