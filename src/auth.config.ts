import type { NextAuthConfig } from "next-auth";

const ROLE_HOME: Record<string, string> = {
  OWNER: "/owner",
  WAITER: "/waiter",
  CHEF: "/chef",
};

const PROTECTED_PREFIX_ROLE: Record<string, string> = {
  "/owner": "OWNER",
  "/waiter": "WAITER",
  "/chef": "CHEF",
};

/**
 * Edge-safe base config, used directly by middleware. Providers that need
 * Node-only APIs (bcrypt, Prisma) are added on top of this in `auth.ts`,
 * which never runs in the Edge middleware runtime.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const { pathname } = nextUrl;

      if (pathname === "/login") {
        if (isLoggedIn && role) {
          return Response.redirect(new URL(ROLE_HOME[role], nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) return false;

      const matchedPrefix = Object.keys(PROTECTED_PREFIX_ROLE).find((prefix) =>
        pathname.startsWith(prefix)
      );

      if (matchedPrefix && role !== PROTECTED_PREFIX_ROLE[matchedPrefix]) {
        return Response.redirect(new URL(ROLE_HOME[role ?? ""] ?? "/login", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
