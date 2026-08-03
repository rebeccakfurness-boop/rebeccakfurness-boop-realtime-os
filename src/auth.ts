import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Email from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import { authConfig } from "@/auth.config";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      orgId: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

interface AppToken {
  id?: string;
  role?: Role;
  orgId?: string | null;
  [key: string]: unknown;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role, orgId: user.orgId };
      },
    }),
    Email({
      // The built-in Email provider requires a `server` shape even though our custom
      // sendVerificationRequest below never uses it (see src/lib/mailer.ts instead).
      server: { host: "unused", port: 0 },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendMail({
          to: identifier,
          subject: "Your Realtime OS sign-in link",
          text: `Sign in to Realtime OS: ${url}\n\nIf you didn't request this, you can ignore this email.`,
          html: `<p>Sign in to Realtime OS:</p><p><a href="${url}">${url}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
        });
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      const t = token as AppToken;
      if (user) {
        t.id = user.id as string;
        t.role = (user as { role: Role }).role;
        t.orgId = (user as { orgId: string | null }).orgId;
      } else if (t.id && !t.role) {
        // Session refresh / magic-link path: user object isn't passed on every call,
        // so re-hydrate role + org from the database by id.
        const dbUser = await prisma.user.findUnique({ where: { id: t.id } });
        if (dbUser) {
          t.role = dbUser.role;
          t.orgId = dbUser.orgId;
        }
      }
      return t;
    },
  },
});
