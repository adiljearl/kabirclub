// src/db.ts
import { drizzle } from "drizzle-orm/node-postgres"; // ✅ NOTE: switched from postgres-js
// import { Pool } from "pg";
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './shared/schema';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD, // ✅ Add password if not already included
  port: Number(process.env.DB_PORT),
});

export const db = drizzle(pool, { schema }); // ✅ Drizzle uses pg Pool here
export { pool }; // Reuse in raw queries
