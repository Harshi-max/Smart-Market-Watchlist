import { NextResponse } from "next/server";

const supportedLanguages = new Set(["en", "hi", "te", "ta", "kn", "ml", "bn", "mr"]);

export async function GET(request: Request) {
  const language = request.headers.get("cookie")?.match(/smartpilot_language=([^;]+)/)?.[1] || "en";
  return NextResponse.json({ preferredLanguage: supportedLanguages.has(language) ? language : "en" });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const preferredLanguage = typeof body?.preferredLanguage === "string" ? body.preferredLanguage : "";
  if (!supportedLanguages.has(preferredLanguage)) return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
  const response = NextResponse.json({ preferredLanguage, persisted: true, storage: "httpOnly-cookie" });
  response.cookies.set("smartpilot_language", preferredLanguage, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return response;
}
