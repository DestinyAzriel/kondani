// PostgreSQL connection pool (Neon / Supabase compatible)
import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pg

if (!process.env.DATABASE_URL) {
  console.warn('[db] DATABASE_URL is not set — set it in .env before running.')
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon/Supabase require SSL. Allow self-signed in managed environments.
  ssl: process.env.DATABASE_URL?.includes('localhost')
    ? false
    : { rejectUnauthorized: false }
})

// Small helper so routes can do `const rows = await query(sql, params)`
export async function query(text, params) {
  const res = await pool.query(text, params)
  return res.rows
}

export async function queryOne(text, params) {
  const rows = await query(text, params)
  return rows[0] || null
}
