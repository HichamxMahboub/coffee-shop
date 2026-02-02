import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Connexion PostgreSQL centralisée
const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text, params) {
  // Wrapper simple pour uniformiser l'accès DB
  const result = await pool.query(text, params);
  return result;
}
