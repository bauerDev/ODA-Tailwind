import type { NextApiRequest, NextApiResponse } from "next";
import pool from "../../lib/db/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user_id, artwork_id } = req.body;

  if (!user_id || !artwork_id) {
    return res.status(400).json({ error: "Missing data" });
  }

  try {
    await pool.query(
      `
      INSERT INTO collections (user_id, artwork_id)
      VALUES ($1, $2)
      `,
      [user_id, artwork_id]
    );

    res.status(201).json({ message: "Artwork added to collection" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add artwork" });
  }
}
