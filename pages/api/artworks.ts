/**
 * API /api/artworks
 * GET: Devuelve todas las obras ordenadas por id.
 * POST: Crea una nueva obra en la base de datos.
 */
import { NextApiRequest, NextApiResponse } from "next";
import { pool } from "../../lib/db/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: listar todas las obras
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

  // POST: insertar nueva obra
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
      // RETURNING * devuelve la obra creada con su id asignado
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create artwork" });
    }
    return;
  }

  // Método no permitido
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: `Method ${req.method} not allowed` });
}
