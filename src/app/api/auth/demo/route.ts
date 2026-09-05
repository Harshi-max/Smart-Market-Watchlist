import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const identity = typeof body?.email === "string" ? body.email : typeof body?.phone === "string" ? body.phone : "";
  if (!identity.trim()) return NextResponse.json({ error: "Identity is required" }, { status: 400 });
  const response = NextResponse.json({ authenticated: true, mode: "development-session" });
  response.cookies.set("smartpilot_session", "development-session", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return response;
}