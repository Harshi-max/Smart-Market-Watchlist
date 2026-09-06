import { NextRequest, NextResponse } from "next/server";
import { upsertGoogleUser, setSession } from "@/lib/auth-store";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorParam)}`, request.url));
  }

  const savedState = request.cookies.get("google_oauth_state")?.value;
  if (!state || !savedState || state !== savedState) {
    return NextResponse.redirect(new URL("/login?error=invalid_csrf_state", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const rawCallback = process.env.GOOGLE_CALLBACK_URL;
  const callbackUrl = rawCallback || `${url.origin}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?error=google_credentials_missing", request.url));
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text().catch(() => "");
      console.error("Google token exchange error:", errBody);
      return NextResponse.redirect(new URL("/login?error=oauth_token_exchange_failed", request.url));
    }

    const tokens = (await tokenRes.json()) as { access_token: string; id_token?: string };

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      return NextResponse.redirect(new URL("/login?error=user_info_fetch_failed", request.url));
    }

    const profile = (await userInfoRes.json()) as {
      sub: string;
      name: string;
      email: string;
      picture?: string;
    };

    if (!profile.email) {
      return NextResponse.redirect(new URL("/login?error=email_not_provided", request.url));
    }

    const user = await upsertGoogleUser({
      sub: profile.sub,
      email: profile.email,
      name: profile.name || profile.email.split("@")[0],
      image: profile.picture,
    });

    const destination = new URL("/dashboard?auth=success", request.url);
    if (user.name) destination.searchParams.set("name", user.name);

    const response = NextResponse.redirect(destination);
    response.cookies.delete("google_oauth_state");
    setSession(response, user.email);

    return response;
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(new URL("/login?error=oauth_network_error", request.url));
  }
}