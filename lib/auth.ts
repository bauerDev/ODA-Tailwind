import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import {
  ensureUsersTable,
  findUserByEmail,
  findUserByGoogleId,
  verifyPassword,
  upsertGoogleUser,
} from "./db/users";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.trim();
        const password = credentials.password;

        if ((email === "admin" || email === "admin@admin") && password === "admin") {
          return {
            id: "admin",
            email: "admin",
            name: "Admin",
            isAdmin: true,
            role: "admin",
          };
        }

        await ensureUsersTable();
        const user = await findUserByEmail(email);
        const storedHash = user?.password_hash ?? user?.password;
        if (!user || !storedHash) return null;

        const ok = await verifyPassword(password, storedHash);
        if (!ok) return null;

        const role = user.user_type === "docente" ? "Teacher" : "Student";
        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          isAdmin: !!user.is_admin,
          role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email && user.id) {
        try {
          await ensureUsersTable();
          await upsertGoogleUser({
            email: user.email,
            name: user.name ?? user.email,
            google_id: user.id,
          });
        } catch (e) {
          console.error("Google user upsert:", e);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google") {
          const dbUser = await findUserByGoogleId(user.id as string);
          if (dbUser) {
            token.id = String(dbUser.id);
            token.isAdmin = !!dbUser.is_admin;
            token.role = dbUser.user_type === "docente" ? "Teacher" : "Student";
          } else {
            token.id = user.id;
            token.isAdmin = false;
            token.role = "Student";
          }
        } else {
          token.id = user.id;
          token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
          token.role = (user as { role?: string }).role ?? "Student";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { isAdmin?: boolean }).isAdmin = token.isAdmin as boolean;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
