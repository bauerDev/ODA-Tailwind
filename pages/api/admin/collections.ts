/**
 * API GET /api/admin/collections
 * Lists all collections from all users (with user_id and user_email).
 * Solo accesible por admin. Usado en /admin/manage-collections para la tabla y el enlace "View user".
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { ensureCollectionsTables, listAllCollections } from "../../../lib/db/collections";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.isAdmin) {
    return res.status(403).json({ error: "Admin only" });
  }
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    await ensureCollectionsTables();
    const collections = await listAllCollections();
    return res.status(200).json(collections);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch collections" });
  }
}
