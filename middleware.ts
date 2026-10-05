import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public access to login page and static assets
  if (
    pathname === "/gov/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Protect /gov routes
  if (pathname.startsWith("/gov")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // In production, require valid token
    // If no token, allow for demo mode if NEXTAUTH_SECRET not set, or redirect to /gov/login
    if (!token && process.env.NODE_ENV === "production") {
      const loginUrl = new URL("/gov/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/gov/:path*"],
};
