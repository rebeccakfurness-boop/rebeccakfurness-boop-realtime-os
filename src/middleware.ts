import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Edge-safe: uses authConfig only (no Prisma/bcrypt/nodemailer), since middleware
// runs on the Edge runtime and only needs to read the already-issued JWT session.
const { auth } = NextAuth(authConfig);

const ROLE_HOME: Record<string, string> = {
  staff: "/staff",
  student: "/student",
  business_customer: "/business",
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/invite") ||
    pathname.startsWith("/book") ||
    pathname.startsWith("/api/auth");

  if (isPublic) {
    return NextResponse.next();
  }

  if (!session?.user) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role;
  const guardedPrefix = (["staff", "student", "business"] as const).find((p) => pathname.startsWith(`/${p}`));

  if (guardedPrefix) {
    const expectedPrefix = ROLE_HOME[role]?.slice(1); // "staff" | "student" | "business"
    if (guardedPrefix !== expectedPrefix) {
      return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/login", req.nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
