/**
 * API /api/artworks/[id]
 * GET: Returns a single artwork by id (detail page /artwork/[id]).
 * PUT/PATCH: Updates the artwork; only fields sent in the body are modified (COALESCE).
 * DELETE: Deletes the artwork from the database (used from manage-artworks).
 */
import { NextApiRequest, NextApiResponse } from "next";
import { pool } from "../../../lib/db/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  // GET: fetch artwork by id (public)
  if (req.method === "GET") {
    try {
      const result = await pool.query("SELECT * FROM artworks WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Artwork not found" });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch artwork" });
    }
    return;
  }

  // PUT/PATCH: update artwork; COALESCE keeps previous value if new one not sent
  if (req.method === "PUT" || req.method === "PATCH") {
    const { title, author, year, movement, technique, dimensions, ubication, location, image, description } = req.body || {};
    const loc = ubication ?? location ?? "";
    try {
      const result = await pool.query(
        `UPDATE artworks SET
          title = COALESCE($2, title),
          author = COALESCE($3, author),
          year = COALESCE($4, year),
          movement = COALESCE($5, movement),
          technique = COALESCE($6, technique),
          dimensions = COALESCE($7, dimensions),
          ubication = COALESCE($8, ubication),
          image = COALESCE($9, image),
          description = COALESCE($10, description)
         WHERE id = $1
         RETURNING *`,
        [id, title, author, year, movement, technique, dimensions, loc, image, description]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Artwork not found" });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update artwork" });
    }
    return;
  }

  // DELETE: delete artwork by id (references in collection_artworks may be orphaned)
  if (req.method === "DELETE") {
    try {
      const result = await pool.query("DELETE FROM artworks WHERE id = $1 RETURNING id", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Artwork not found" });
      }
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete artwork" });
    }
    return;
  }

  res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
  res.status(405).json({ error: `Method ${req.method} not allowed` });
}

