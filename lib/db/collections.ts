import { pool } from "./db";

/** Ensure user_collections and collection_artworks tables exist */
export async function ensureCollectionsTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_collections (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      visibility VARCHAR(50) DEFAULT 'privada',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS collection_artworks (
      collection_id INTEGER NOT NULL REFERENCES user_collections(id) ON DELETE CASCADE,
      artwork_id INTEGER NOT NULL,
      PRIMARY KEY (collection_id, artwork_id)
    )
  `);
}

export interface UserCollectionRow {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  visibility: string;
  created_at: Date;
}

export async function listCollectionsByUserId(userId: number): Promise<UserCollectionRow[]> {
  const result = await pool.query(
    "SELECT * FROM user_collections WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return result.rows;
}

export async function createCollection(params: {
  user_id: number;
  name: string;
  description?: string | null;
  visibility?: string;
}): Promise<UserCollectionRow> {
  const result = await pool.query(
    `INSERT INTO user_collections (user_id, name, description, visibility)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      params.user_id,
      params.name,
      params.description ?? null,
      params.visibility ?? "privada",
    ]
  );
  return result.rows[0];
}

export async function getCollectionById(collectionId: number): Promise<UserCollectionRow | null> {
  const result = await pool.query("SELECT * FROM user_collections WHERE id = $1", [collectionId]);
  return result.rows[0] ?? null;
}

export async function addArtworkToCollection(
  collectionId: number,
  artworkId: number,
  userId: number
): Promise<boolean> {
  const col = await getCollectionById(collectionId);
  if (!col || col.user_id !== userId) return false;
  await pool.query(
    `INSERT INTO collection_artworks (collection_id, artwork_id) VALUES ($1, $2)
     ON CONFLICT (collection_id, artwork_id) DO NOTHING`,
    [collectionId, artworkId]
  );
  return true;
}

/** Remove artwork from a collection (user must own the collection) */
export async function removeArtworkFromCollection(
  collectionId: number,
  artworkId: number,
  userId: number
): Promise<boolean> {
  const col = await getCollectionById(collectionId);
  if (!col || col.user_id !== userId) return false;
  await pool.query(
    "DELETE FROM collection_artworks WHERE collection_id = $1 AND artwork_id = $2",
    [collectionId, artworkId]
  );
  return true;
}

/** Get user's collections that contain this artwork (for pills on artwork page) */
export async function getCollectionsContainingArtwork(
  artworkId: number,
  userId: number
): Promise<{ id: number; name: string }[]> {
  const result = await pool.query(
    `SELECT uc.id, uc.name FROM user_collections uc
     INNER JOIN collection_artworks ca ON ca.collection_id = uc.id AND ca.artwork_id = $1
     WHERE uc.user_id = $2
     ORDER BY uc.name`,
    [artworkId, userId]
  );
  return result.rows;
}

export async function getCollectionArtworkIds(collectionId: number): Promise<number[]> {
  const result = await pool.query(
    "SELECT artwork_id FROM collection_artworks WHERE collection_id = $1",
    [collectionId]
  );
  return result.rows.map((r) => r.artwork_id);
}

/** Get collection with full artwork rows (for detail page) */
export async function getCollectionWithArtworks(collectionId: number, userId: number) {
  const col = await getCollectionById(collectionId);
  if (!col || col.user_id !== userId) return null;
  const result = await pool.query(
    `SELECT a.* FROM artworks a
     INNER JOIN collection_artworks ca ON ca.artwork_id = a.id
     WHERE ca.collection_id = $1
     ORDER BY ca.collection_id`,
    [collectionId]
  );
  return { collection: col, artworks: result.rows };
}

/** Admin: list all collections with user_id */
export async function listAllCollections(): Promise<(UserCollectionRow & { user_email?: string })[]> {
  const result = await pool.query(`
    SELECT uc.*, u.email AS user_email
    FROM user_collections uc
    LEFT JOIN users u ON u.id = uc.user_id
    ORDER BY uc.created_at DESC
  `);
  return result.rows;
}
