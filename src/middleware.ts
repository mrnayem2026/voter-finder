import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Protect all dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const url = new URL("/auth/v2/login", request.url);
      return NextResponse.redirect(url);
    }
  }

  // Redirect from auth to dashboard if already logged in
  if (pathname.startsWith("/auth")) {
    if (token) {
      const url = new URL("/dashboard/default", request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
