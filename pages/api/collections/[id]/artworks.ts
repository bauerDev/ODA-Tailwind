/**
 * API /api/collections/[id]/artworks
 * POST: Adds an artwork to the collection (body: { artwork_id }). Only if the collection belongs to the user.
 * DELETE: Removes the artwork from the collection (body: { artwork_id }). Same ownership check.
 * id in URL = collection_id. Requires session.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { addArtworkToCollection, removeArtworkFromCollection } from "../../../../lib/db/collections";

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

  if (!userId) {
    return res.status(401).json({ error: "You must be signed in" });
  }

  const { artwork_id } = req.body || {};
  const artworkId = typeof artwork_id === "number" ? artwork_id : parseInt(String(artwork_id), 10);
  if (Number.isNaN(artworkId)) {
    return res.status(400).json({ error: "Valid artwork_id is required" });
  }

  if (req.method === "POST") {
    try {
      const ok = await addArtworkToCollection(collectionId, artworkId, userId);
      if (!ok) {
        return res.status(404).json({ error: "Collection not found" });
      }
      return res.status(201).json({ message: "Artwork added to collection" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to add artwork" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const ok = await removeArtworkFromCollection(collectionId, artworkId, userId);
      if (!ok) {
        return res.status(404).json({ error: "Collection not found" });
      }
      return res.status(200).json({ message: "Artwork removed from collection" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to remove artwork" });
    }
  }

  res.setHeader("Allow", ["POST", "DELETE"]);
  return res.status(405).json({ error: "Method not allowed" });
}
