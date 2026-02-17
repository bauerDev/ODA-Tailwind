/**
 * Ruta catch-all de NextAuth: /api/auth/* (signin, signout, session, providers, etc.).
 * Delega toda la configuración (Credentials, Google, JWT, callbacks) a authOptions en lib/auth.
 */
import NextAuth from "next-auth";
import { authOptions } from "../../../lib/auth";

export default NextAuth(authOptions);
