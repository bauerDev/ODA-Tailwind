import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import {
  ensureCollectionsTables,
  listCollectionsByUserId,
  createCollection,
} from "../../../lib/db/collections";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await ensureCollectionsTables();
  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

  if (req.method === "GET") {
    if (!userId) {
      return res.status(401).json({ error: "You must be signed in to view collections" });
    }
    try {
      const collections = await listCollectionsByUserId(userId);
      return res.status(200).json(collections);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch collections" });
    }
  }

  if (req.method === "POST") {
    if (!userId) {
      return res.status(401).json({ error: "You must be signed in to create a collection" });
    }
    const { name, description, visibility } = req.body || {};
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Collection name is required" });
    }
    try {
      const collection = await createCollection({
        user_id: userId,
        name: name.trim(),
        description: description?.trim() || null,
        visibility: visibility === "publica" ? "publica" : "privada",
      });
      return res.status(201).json(collection);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to create collection" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed" });
}
