import { NextResponse } from "next/server";
import { createUser, setSession, verifyUser } from "@/lib/auth-store";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const action = body?.action === "signup" ? "signup" : "signin";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!emailPattern.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (!password) return NextResponse.json({ error: "Password cannot be empty." }, { status: 400 });

  if (action === "signup") {
    if (!name) return NextResponse.json({ error: "Enter your name." }, { status: 400 });
    if (!(await createUser(email, name, password))) return NextResponse.json({ error: "An account with this email already exists. Sign in instead." }, { status: 409 });
  } else if (!await verifyUser(email, password)) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  const response = NextResponse.json({ authenticated: true });
  setSession(response, email);
  return response;
}