// src/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from './shared/schema'
import dotenv from 'dotenv';
dotenv.config();
import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  });

// import { Pool } from 'pg';
// Load DATABASE_URL from the .env file
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in the environment.");
}

// Create a PostgreSQL connection using postgres-js
const sql = postgres(connectionString);

// Create Drizzle instance
export const db = drizzle(sql, {schema});
