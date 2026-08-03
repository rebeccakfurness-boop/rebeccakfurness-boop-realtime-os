import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Edge-safe subset of the Auth.js config: no Prisma client, no bcrypt, no nodemailer.
 * Used directly by middleware (which runs on the Edge runtime and cannot load Node
 * built-ins). The full config in src/auth.ts spreads this and adds the Node-only
 * providers/adapter for use everywhere else (server components, the API route).
 */
interface AppToken {
  id?: string;
  role?: Role;
  orgId?: string | null;
  [key: string]: unknown;
}

export const authConfig = {
  pages: {
    signIn: "/login",
    verifyRequest: "/login/check-email",
  },
  providers: [],
  callbacks: {
    async session({ session, token }) {
      const t = token as AppToken;
      if (t.id) session.user.id = t.id;
      if (t.role) session.user.role = t.role;
      session.user.orgId = t.orgId ?? null;
      return session;
    },
  },
} satisfies NextAuthConfig;
