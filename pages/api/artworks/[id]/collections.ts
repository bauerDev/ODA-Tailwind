/**
 * API GET /api/artworks/[id]/collections
 * Returns the logged-in user's collections that contain this artwork (id = artwork id).
 * Used on /artwork/[id] to show "In your collections" pills and the remove button.
 * If there is no session, returns [].
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { getCollectionsContainingArtwork } from "../../../../lib/db/collections";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid artwork ID" });
  }
  const artworkId = parseInt(id, 10);
  if (Number.isNaN(artworkId)) {
    return res.status(400).json({ error: "Invalid artwork ID" });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

  if (!userId) {
    return res.status(200).json([]);
  }

  try {
    const collections = await getCollectionsContainingArtwork(artworkId, userId);
    return res.status(200).json(collections);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch collections" });
  }
}
