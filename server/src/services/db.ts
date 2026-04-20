import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Mock DB implementation for MVP if DATABASE_URL is missing
const mockDb: Record<string, any> = {};

export const query = async (text: string, params?: any[]) => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not found, using memory storage (volatile)');
    return { rows: [] };
  }
  return pool.query(text, params);
};

export const saveFormation = async (id: string, state: string, data: any) => {
  if (!process.env.DATABASE_URL) {
    mockDb[id] = { id, state, data };
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS llc_formations (
      id VARCHAR(255) PRIMARY KEY,
      state VARCHAR(50),
      formData TEXT,
      status VARCHAR(50),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const text = 'INSERT INTO llc_formations(id, state, formData, status, createdAt) VALUES($1, $2, $3, $4, NOW()) ON CONFLICT (id) DO UPDATE SET formData = $3';
  const values = [id, state, JSON.stringify(data), 'draft'];
  await pool.query(text, values);
};

export const getFormation = async (id: string) => {
  if (!process.env.DATABASE_URL) {
    return mockDb[id];
  }
  const res = await pool.query('SELECT * FROM llc_formations WHERE id = $1', [id]);
  return res.rows[0];
};
