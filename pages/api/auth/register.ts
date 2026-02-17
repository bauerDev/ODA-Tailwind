/**
 * API POST /api/auth/register
 * Registro de nuevos usuarios. Crea una cuenta en la tabla users con email, nombre,
 * contraseña hasheada (bcrypt), tipo de usuario (alumno/docente) e institución opcional.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { ensureUsersTable, findUserByEmail, createUser } from "../../../lib/db/users";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo aceptamos POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nombre, email, password, confirm_password, tipo_usuario, institucion } = req.body || {};

  // Validaciones: email, contraseña y nombre obligatorios
  if (!email || !password || !nombre) {
    return res.status(400).json({ error: "Email, password and full name are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  if (password !== confirm_password) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  // Asegurar que la tabla users existe (crea o altera columnas si hace falta)
  try {
    await ensureUsersTable();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Database error" });
  }

  // No permitir duplicados por email
  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: "An account with this email already exists" });
  }

  // Crear usuario: la contraseña se hashea en createUser (bcrypt)
  try {
    await createUser({
      email: email.trim(),
      name: (nombre || "").trim(),
      password,
      user_type: tipo_usuario || "alumno",
      institution: institucion?.trim() || undefined,
    });
    return res.status(201).json({ success: true, message: "Account created" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to create account" });
  }
}
