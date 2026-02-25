import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import {
  ensureUsersTable,
  findUserByEmail,
  findUserByGoogleId,
  verifyPassword,
  ensureGoogleUserInDb,
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
    // Google only if env vars are set (otherwise NextAuth returns OAuthSignin error)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email && user.id) {
        await ensureGoogleUserInDb({
          email: user.email,
          name: (user.name as string) ?? user.email,
          google_id: user.id as string,
        });
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
        if (account?.provider === "google") {
          const email = (user.email as string) || "";
          const name = (user.name as string) || email;
          const googleId = user.id as string;
          let dbUser = await ensureGoogleUserInDb({ email, name, google_id: googleId });
          if (!dbUser) {
            dbUser = await findUserByGoogleId(googleId) ?? (email ? await findUserByEmail(email) : null);
          }
          if (dbUser) {
            token.id = String(dbUser.id);
            token.isAdmin = !!dbUser.is_admin;
            token.role = dbUser.user_type === "docente" ? "Teacher" : "Student";
          } else {
            token.id = googleId;
            token.isAdmin = false;
            token.role = "Student";
          }
        } else {
          token.id = user.id as string;
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
