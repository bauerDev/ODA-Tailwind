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

export async function findAllUsers(): Promise<UserRow[]> {
  const result = await pool.query(
    "SELECT id, email, name, user_type, institution, is_admin, created_at FROM users ORDER BY id"
  );
  return result.rows;
}

/** Delete user by id. Removes their collections first (user_collections and collection_artworks). */
export async function deleteUserById(userId: number): Promise<boolean> {
  try {
    await pool.query("DELETE FROM user_collections WHERE user_id = $1", [userId]);
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [userId]);
    return (result.rowCount ?? 0) > 0;
  } catch (e) {
    if (String((e as Error).message).includes('relation "user_collections" does not exist')) {
      const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [userId]);
      return (result.rowCount ?? 0) > 0;
    }
    throw e;
  }
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

/** Get user by numeric id (users.id). Use this to resolve session.user.id to DB user. */
export async function findUserById(id: number): Promise<UserRow | null> {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0] ?? null;
}

/** JWT token shape (id and email from NextAuth). */
export type AuthToken = { id?: string; email?: string | null; name?: string | null };

/**
 * Resolve JWT token to the numeric database user id. Use this in API routes with getToken().
 * Tries by id, then by google_id, then by email, then upsert for Google.
 */
export async function resolveTokenUserId(token: AuthToken | null): Promise<number | null> {
  if (!token || (!token.id && !token.email)) return null;
  const rawId = token.id;
  const email = token.email ?? null;

  const idNum = rawId ? parseInt(rawId, 10) : null;
  if (idNum != null && Number.isSafeInteger(idNum) && idNum > 0) {
    const byId = await findUserById(idNum);
    if (byId) return byId.id;
  }
  if (rawId && typeof rawId === "string") {
    const byGoogle = await findUserByGoogleId(rawId);
    if (byGoogle) return byGoogle.id;
  }
  if (email) {
    const byEmail = await findUserByEmail(email);
    if (byEmail) return byEmail.id;
  }
  if (rawId && email) {
    try {
      await ensureUsersTable();
      const created = await upsertGoogleUser({
        email,
        name: (token.name as string) ?? email,
        google_id: rawId,
      });
      return created.id;
    } catch (e) {
      console.error("resolveTokenUserId upsert:", e);
    }
  }
  return null;
}

/**
 * Resolve session to the numeric database user id. Handles Google users where session.user.id
 * might be the Google id string instead of users.id. Tries by id, then by google_id, then by email.
 */
export async function resolveSessionUserId(session: { user?: { id?: string; email?: string | null; name?: string | null } } | null): Promise<number | null> {
  if (!session?.user) return null;
  const { id: rawId, email } = session.user;
  if (!rawId && !email) return null;

  // 1) Try numeric users.id (Credentials or JWT with db id)
  const idNum = rawId ? parseInt(rawId, 10) : null;
  if (idNum != null && Number.isSafeInteger(idNum) && idNum > 0) {
    const byId = await findUserById(idNum);
    if (byId) return byId.id;
  }

  // 2) Try google_id (session.user.id is often Google's id for OAuth users)
  if (rawId && typeof rawId === "string") {
    const byGoogle = await findUserByGoogleId(rawId);
    if (byGoogle) return byGoogle.id;
  }

  // 3) Try by email (Google and others)
  if (email) {
    const byEmail = await findUserByEmail(email);
    if (byEmail) return byEmail.id;
  }

  // 4) Session has id + email but no DB user yet (e.g. Google first sign-in failed to upsert). Create/link user.
  if (rawId && email) {
    try {
      await ensureUsersTable();
      const created = await upsertGoogleUser({
        email,
        name: (session.user?.name as string) ?? email,
        google_id: rawId,
      });
      return created.id;
    } catch (e) {
      console.error("resolveSessionUserId upsert:", e);
    }
  }

  return null;
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

/**
 * Ensures the users table exists and the Google user is created/updated in the DB.
 * Use this in NextAuth callbacks (signIn, jwt) so the user appears in manage-users.
 * Retries once after 1s on failure (e.g. DB cold start on Render).
 */
export async function ensureGoogleUserInDb(params: {
  email: string;
  name: string;
  google_id: string;
}): Promise<UserRow | null> {
  const tryOnce = async (): Promise<UserRow | null> => {
    try {
      await ensureUsersTable();
      return await upsertGoogleUser(params);
    } catch (e) {
      console.error("ensureGoogleUserInDb:", e);
      return null;
    }
  };
  let row = await tryOnce();
  if (row) return row;
  await new Promise((r) => setTimeout(r, 1000));
  row = await tryOnce().then((r) => r ?? null);
  return row;
}
