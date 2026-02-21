/**
 * API GET /api/collections/[id]
 * Returns a collection and its artworks (only if the logged-in user is the owner).
 * Used on /my-collection/[id] to show the collection and its artwork list.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import {
  getCollectionById,
  getCollectionWithArtworks,
} from "../../../lib/db/collections";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid collection ID" });
  }
  const collectionId = parseInt(id, 10);
  if (Number.isNaN(collectionId)) {
    return res.status(400).json({ error: "Invalid collection ID" });
  }

  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

  if (req.method === "GET") {
    if (!userId) {
      return res.status(401).json({ error: "You must be signed in to view a collection" });
    }
    try {
      const data = await getCollectionWithArtworks(collectionId, userId);
      if (!data) {
        return res.status(404).json({ error: "Collection not found" });
      }
      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch collection" });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).json({ error: "Method not allowed" });
}
