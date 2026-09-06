import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/watchlist", "/changes", "/market-map", "/smartpilot", "/what-if", "/replay", "/portfolio", "/goals", "/patterns", "/alerts"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected = protectedPaths.some((protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`));
  const hasSession = request.cookies.has("smartpilot_session");
  if (isProtected && !hasSession) return NextResponse.redirect(new URL("/login", request.url));
  if ((path === "/login" || path === "/signup") && hasSession) return NextResponse.redirect(new URL("/dashboard", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] };