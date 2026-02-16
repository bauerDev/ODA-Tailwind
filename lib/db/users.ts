import { pool } from "./db";
import bcrypt from "bcryptjs";

export const SALT_ROUNDS = 10;

/** Ensure users table exists and has all required columns */
export async function ensureUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255),
      password_hash VARCHAR(255),
      user_type VARCHAR(50) DEFAULT 'alumno',
      institution VARCHAR(255),
      google_id VARCHAR(255),
      is_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // Add missing columns if the table was created with an older schema
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'alumno'`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS institution VARCHAR(255)`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255)`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
}

export interface UserRow {
  id: number;
  email: string;
  name: string | null;
  password_hash?: string | null;
  password?: string | null; // some schemas use "password" for the hash
  user_type: string;
  institution: string | null;
  google_id: string | null;
  is_admin: boolean;
  created_at: Date;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const result = await pool.query(
    "SELECT * FROM users WHERE LOWER(email) = LOWER($1)",
    [email]
  );
  return result.rows[0] ?? null;
}

export async function findUserByGoogleId(googleId: string): Promise<UserRow | null> {
  const result = await pool.query("SELECT * FROM users WHERE google_id = $1", [googleId]);
  return result.rows[0] ?? null;
}

export async function createUser(params: {
  email: string;
  name: string;
  password: string;
  user_type: string;
  institution?: string;
}): Promise<UserRow> {
  const hash = await bcrypt.hash(params.password, SALT_ROUNDS);
  const result = await pool.query(
    `INSERT INTO users (email, name, password, password_hash, user_type, institution)
     VALUES ($1, $2, $3, $3, $4, $5)
     RETURNING *`,
    [
      params.email,
      params.name,
      hash,
      params.user_type || "alumno",
      params.institution || null,
    ]
  );
  return result.rows[0];
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function upsertGoogleUser(params: {
  email: string;
  name: string;
  google_id: string;
}): Promise<UserRow> {
  const existing = await findUserByGoogleId(params.google_id);
  if (existing) return existing;

  const byEmail = await findUserByEmail(params.email);
  if (byEmail) {
    await pool.query("UPDATE users SET google_id = $1, name = COALESCE(name, $2) WHERE id = $3", [
      params.google_id,
      params.name,
      byEmail.id,
    ]);
    const updated = await pool.query("SELECT * FROM users WHERE id = $1", [byEmail.id]);
    return updated.rows[0];
  }

  const result = await pool.query(
    `INSERT INTO users (email, name, google_id, user_type)
     VALUES ($1, $2, $3, 'alumno')
     RETURNING *`,
    [params.email, params.name, params.google_id]
  );
  return result.rows[0];
}
