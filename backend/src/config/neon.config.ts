import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

export const connectNeon = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to Neon PostgreSQL');
    client.release();
  } catch (err) {
    console.error('❌ Neon PostgreSQL connection error:', err);
    process.exit(1);
  }
};

pool.on('error', (err) => {
  console.error('Unexpected error on idle Neon client', err);
  process.exit(-1);
});

export default pool;
