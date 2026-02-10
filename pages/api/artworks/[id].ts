import { NextApiRequest, NextApiResponse } from "next";
import pool from "../../../lib/db/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const result = await pool.query("SELECT * FROM artworks WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Artwork not found" });
    }
    res.status(200).json(result.rows[0]); // <-- Muy importante: solo enviamos un objeto
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch artwork" });
  }
}

