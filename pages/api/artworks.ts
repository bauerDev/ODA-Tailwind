import { NextApiRequest, NextApiResponse } from "next";
import { pool } from '../../lib/db/db'; // tu conexión

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await pool.query("SELECT * FROM artworks ORDER BY id");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch artworks" });
  }
}
