import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { exchangeGoogleCode } from "@/lib/integrations/google-auth";

const STATE_COOKIE = "google_oauth_state";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "staff") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/staff/settings?google=error", request.url));
  }

  try {
    const { tokens, profile } = await exchangeGoogleCode(code);
    if (!tokens.access_token || !profile.id) throw new Error("Google did not return the expected token/profile data.");

    await prisma.account.upsert({
      where: { provider_providerAccountId: { provider: "google", providerAccountId: profile.id } },
      create: {
        userId: session.user.id,
        type: "oauth",
        provider: "google",
        providerAccountId: profile.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : undefined,
        token_type: tokens.token_type,
        scope: tokens.scope,
      },
      update: {
        userId: session.user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? undefined,
        expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : undefined,
        token_type: tokens.token_type,
        scope: tokens.scope,
      },
    });

    return NextResponse.redirect(new URL("/staff/settings?google=connected", request.url));
  } catch (err) {
    console.error("[google/callback]", err);
    return NextResponse.redirect(new URL("/staff/settings?google=error", request.url));
  }
}
