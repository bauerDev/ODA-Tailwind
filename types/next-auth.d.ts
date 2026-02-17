import "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    isAdmin?: boolean;
    role?: string;
  }

  interface Session {
    user: {
      id?: string;
      isAdmin?: boolean;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isAdmin?: boolean;
    role?: string;
  }
}
