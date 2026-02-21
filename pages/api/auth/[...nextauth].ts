/**
 * Ruta catch-all de NextAuth: /api/auth/* (signin, signout, session, providers, etc.).
 * Delegates all configuration (Credentials, Google, JWT, callbacks) to authOptions in lib/auth.
 */
import NextAuth from "next-auth";
import { authOptions } from "../../../lib/auth";

export default NextAuth(authOptions);
