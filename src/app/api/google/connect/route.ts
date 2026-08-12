import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { buildGoogleAuthUrl, isGoogleConfigured } from "@/lib/integrations/google-auth";

const STATE_COOKIE = "google_oauth_state";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "staff") {
    return NextResponse.json({ error: "Staff only" }, { status: 403 });
  }
  if (!isGoogleConfigured()) {
    return NextResponse.json({ error: "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set." }, { status: 400 });
  }

  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" });

  return NextResponse.redirect(buildGoogleAuthUrl(state));
}
