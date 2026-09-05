import { NextRequest, NextResponse } from "next/server";
import { getUserByIdentifier } from "@/lib/auth-store";

export function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: request.cookies.has("smartpilot_session") });
}

export function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set("smartpilot_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get("smartpilot_session")?.value || "";
  const identifier = session.startsWith("user:") ? session.slice(5) : "";
  const user = identifier ? await getUserByIdentifier(identifier) : null;
  return NextResponse.json({
    authenticated: Boolean(user || session === "development-session" || session === "verified-session"),
    user: user || { name: "Harshitha Arava", email: identifier || "harshitha@smartpilot.ai" },
  });
}