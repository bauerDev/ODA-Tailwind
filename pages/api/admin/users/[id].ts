/**
 * API DELETE /api/admin/users/[id]
 * Elimina un usuario de la base de datos. Primero borra sus colecciones (user_collections)
 * y por cascada las entradas en collection_artworks; luego borra el usuario.
 * Solo accesible por admin. Usado desde el botón "Delete" en /admin/manage-users.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { deleteUserById } from "../../../../lib/db/users";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }
  const userId = parseInt(id, 10);
  if (Number.isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.isAdmin) {
    return res.status(403).json({ error: "Admin only" });
  }

  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const deleted = await deleteUserById(userId);
    if (!deleted) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete user" });
  }
}
