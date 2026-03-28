import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export class Database {
  async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      const duration = Date.now() - start;
      console.error('Query error', { text, duration, error });
      throw error;
    }
  }

  async getClient() {
    return pool.connect();
  }

  async close() {
    await pool.end();
  }
}

export default Database;
