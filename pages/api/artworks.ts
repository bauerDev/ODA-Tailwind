/**
 * API /api/artworks
 * GET: Returns all artworks in the catalog ordered by id (public access).
 * POST: Creates a new artwork in the artworks table (used from admin panel).
 */
import { NextApiRequest, NextApiResponse } from "next";
import { pool } from "../../lib/db/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: list all artworks (gallery, filters, etc.)
  if (req.method === "GET") {
    try {
      const result = await pool.query("SELECT * FROM artworks ORDER BY id");
      res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch artworks" });
    }
    return;
  }

  // POST: insert new artwork; title, author and image are required
  if (req.method === "POST") {
    const { title, author, year, movement, technique, dimensions, ubication, location, image, description } = req.body || {};
    const loc = ubication ?? location ?? "";
    if (!title || !author || !image) {
      return res.status(400).json({ error: "title, author e image son obligatorios" });
    }
    try {
      const result = await pool.query(
        `INSERT INTO artworks (title, author, year, movement, technique, dimensions, ubication, image, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          title,
          author || "",
          year || "",
          movement || "",
          technique || "",
          dimensions || "",
          loc,
          image,
          description || "",
        ]
      );
      // RETURNING * devuelve la fila insertada con el id generado
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create artwork" });
    }
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: `Method ${req.method} not allowed` });
}
