import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

export const pool = new Pool({
  connectionString: config.databaseUrl,
});

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows;
}

export async function initDb() {
  console.log('[DB] Initializing database schema...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await pool.query(schemaSql);
    console.log('[DB] Schema migrations applied successfully.');
  } else {
    console.warn('[DB] schema.sql not found at', schemaPath);
  }
}
