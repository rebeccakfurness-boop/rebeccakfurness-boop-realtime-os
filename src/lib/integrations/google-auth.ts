/**
 * Shared Google OAuth boundary for the Calendar and Gmail integrations.
 *
 * This is deliberately separate from the app's own sign-in (Credentials /
 * magic link in src/auth.ts): connecting a Google account here is an
 * additional, staff-only "link my Google account for Calendar/Gmail access"
 * action, not a login method. Tokens are stored in Auth.js's own Account
 * table (provider: "google"), which already has exactly the columns an
 * OAuth token needs (access_token, refresh_token, expires_at, scope) even
 * though nothing in this app used it for that purpose until now.
 *
 * Single-account model: whichever staff member connects their Google account
 * first is the one whose Calendar/Gmail the whole app reads and writes to
 * (matching the actual ask: one person's Google account, not a multi-staff
 * calendar-sync system). Extending to multiple connected accounts later
 * would mean filtering getConnectedGoogleAccount() by a specific staffId.
 */

import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/gmail.readonly",
];

export function isGoogleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/google/callback`,
  );
}

export function buildGoogleAuthUrl(state: string) {
  return createOAuth2Client().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
  });
}

export async function exchangeGoogleCode(code: string) {
  const client = createOAuth2Client();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  const { data: profile } = await google.oauth2({ version: "v2", auth: client }).userinfo.get();
  return { tokens, profile };
}

export async function getConnectedGoogleAccount() {
  return prisma.account.findFirst({
    where: { provider: "google", user: { role: "staff" } },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

/**
 * Returns an authorized googleapis OAuth2 client for the connected staff
 * Google account, refreshing (and persisting) the access token if needed.
 * Returns null if no staff member has connected a Google account yet.
 */
export async function getAuthorizedGoogleClient() {
  const account = await getConnectedGoogleAccount();
  if (!account?.refresh_token) return null;

  const client = createOAuth2Client();
  client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  client.on("tokens", (tokens) => {
    prisma.account
      .update({
        where: { id: account.id },
        data: {
          access_token: tokens.access_token ?? account.access_token,
          expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : account.expires_at,
          refresh_token: tokens.refresh_token ?? account.refresh_token,
        },
      })
      .catch((err) => console.error("[google-auth] failed to persist refreshed token", err));
  });

  return client;
}

export async function disconnectGoogleAccount() {
  const account = await getConnectedGoogleAccount();
  if (account) await prisma.account.delete({ where: { id: account.id } });
}
