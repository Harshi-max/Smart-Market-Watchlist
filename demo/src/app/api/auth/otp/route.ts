import { createHash, createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { findOrCreateOtpUser, setSession } from "@/lib/auth-store";

const otpCookie = "smartpilot_otp";
const otpSecret = () => process.env.OTP_HASH_SECRET || "development-otp-secret-key-smartpilot-328";

function sealOtp(payload: { identifier: string; type: "email" | "phone"; hash: string; expiresAt: number; attempts: number }) {
  const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", otpSecret()).update(value).digest("base64url");
  return `${value}.${signature}`;
}

function openOtp(value: string | undefined) {
  if (!value) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;
  const expected = createHmac("sha256", otpSecret()).update(encoded).digest("base64url");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length || !timingSafeEqual(expectedBuffer, signatureBuffer)) return null;
  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as {
      identifier: string;
      type: "email" | "phone";
      hash: string;
      expiresAt: number;
      attempts: number;
    };
  } catch {
    return null;
  }
}

async function deliverEmail(email: string, code: string) {
  const subject = "Your SmartPilot Watch verification code";
  const text = `Your SmartPilot Watch verification code is: ${code}\n\nThis single-use code expires in 5 minutes. If you did not request this, please ignore this email.\n\nSmartPilot Watch — Don't just watch the market. Know what changed.`;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_PORT === "465",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject,
      text,
    });
    return "smtp";
  }

  if (process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "SmartPilot Watch <onboarding@resend.dev>",
        to: [email],
        subject,
        text,
      }),
    });
    if (!response.ok) throw new Error("Resend rejected the email");
    return "resend";
  }

  return "development";
}

async function deliverSms(phone: string, code: string) {
  // If third-party SMS service credentials exist (e.g. Twilio or Fast2SMS)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: process.env.TWILIO_PHONE_NUMBER,
          To: phone.startsWith("+") ? phone : `+91${phone}`,
          Body: `Your SmartPilot Watch verification code is ${code}. Expires in 5 minutes.`,
        }),
      }
    );
    if (response.ok) return "sms";
  }

  // Otherwise in dev/testing environment:
  console.log(`[SmartPilot OTP] Generated SMS code for ${phone}: ${code}`);
  return "development";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const rawId = typeof body?.identifier === "string" ? body.identifier.trim() : "";
  const requestedType = body?.type === "phone" ? "phone" : "email";

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawId);
  const isPhone = /^\+?[0-9]{10,15}$/.test(rawId.replace(/[\s-]/g, ""));

  if (!isEmail && !isPhone) {
    return NextResponse.json(
      { error: "Please enter a valid email address or 10-digit mobile number." },
      { status: 400 }
    );
  }

  const type: "email" | "phone" = isPhone && requestedType === "phone" ? "phone" : isEmail ? "email" : "phone";
  const identifier = type === "email" ? rawId.toLowerCase() : rawId.replace(/[\s-]/g, "");

  // Generate 6-digit random code (100000 - 999999)
  const code = String(randomInt(100000, 1000000));
  const expiresAt = Date.now() + 5 * 60 * 1000;

  try {
    const delivery = type === "email" ? await deliverEmail(identifier, code) : await deliverSms(identifier, code);

    const response = NextResponse.json({
      sent: true,
      type,
      delivery,
      expiresIn: Math.round((expiresAt - Date.now()) / 1000),
      ...(delivery === "development" ? { developmentCode: code } : {}),
    });

    response.cookies.set(
      otpCookie,
      sealOtp({
        identifier,
        type,
        hash: createHash("sha256").update(code).digest("hex"),
        expiresAt,
        attempts: 0,
      }),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 300,
      }
    );

    return response;
  } catch (error) {
    console.error("OTP delivery error:", error);
    return NextResponse.json(
      { error: "Could not deliver verification code. Please check your credentials or try again later." },
      { status: 503 }
    );
  }
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  const rawId = typeof body?.identifier === "string" ? body.identifier.trim() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)smartpilot_otp=([^;]+)/);
  const entry = openOtp(match?.[1]);

  if (!entry) {
    return NextResponse.json({ error: "Verification session expired. Please request a new code." }, { status: 400 });
  }

  if (Date.now() > entry.expiresAt) {
    return NextResponse.json({ error: "This code has expired. Please request a new code." }, { status: 400 });
  }

  if (entry.attempts >= 5) {
    return NextResponse.json(
      { error: "Maximum attempts reached. For security, please request a new verification code." },
      { status: 429 }
    );
  }

  const cleanInputId = entry.type === "email" ? rawId.toLowerCase() : rawId.replace(/[\s-]/g, "");
  if (entry.identifier !== cleanInputId) {
    return NextResponse.json({ error: "The entered code does not match this account." }, { status: 400 });
  }

  const inputHash = createHash("sha256").update(code).digest("hex");
  if (inputHash !== entry.hash) {
    entry.attempts += 1;
    const response = NextResponse.json(
      { error: `Invalid verification code. ${5 - entry.attempts} attempt(s) remaining.` },
      { status: 400 }
    );
    // Update attempts in cookie
    response.cookies.set(otpCookie, sealOtp(entry), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.max(0, Math.round((entry.expiresAt - Date.now()) / 1000)),
    });
    return response;
  }

  // Verification successful! Create or find user and establish session
  const user = await findOrCreateOtpUser(entry.identifier, entry.type);

  const response = NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });

  response.cookies.delete(otpCookie);
  setSession(response, user.email || user.id || entry.identifier);

  return response;
}
