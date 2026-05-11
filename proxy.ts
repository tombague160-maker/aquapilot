import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

const privateRoutePrefixes = [
  "/dashboard",
  "/settings",
  "/aquariums",
  "/species",
  "/notifications",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPrivateRoute = privateRoutePrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isPrivateRoute) {
    return NextResponse.next();
  }

  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);

  if (hasSessionCookie) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/aquariums/:path*",
    "/species/:path*",
    "/notifications/:path*",
  ],
};
