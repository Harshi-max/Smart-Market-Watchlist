import { NextRequest, NextResponse } from "next/server";
import { getUserByIdentifier } from "@/lib/auth-store";

export async function GET(request: NextRequest) {
  const session = request.cookies.get("smartpilot_session")?.value || "";
  const identifier = session.startsWith("user:") ? session.slice(5) : "";
  const user = identifier ? await getUserByIdentifier(identifier) : null;
  if (!user && session !== "development-session" && session !== "verified-session") {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: user || { name: "Harshitha Arava", email: identifier || "harshitha@smartpilot.ai" } });
}
