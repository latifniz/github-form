import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const isLocalhost = process.env.PG_HOST === 'localhost';
const caPath = path.join(process.cwd(), 'certs/ca.pem');
const ca = fs.readFileSync(caPath).toString();

export const pool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || '5432'),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: isLocalhost
    ? false
    : {
        rejectUnauthorized: false,
        ca: ca,
      },
});

export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    console.log("connected to db");
    return result;
  }catch(err) {
    console.log("error connecting to db ", err);
  } finally {
    client.release();
  }
};

