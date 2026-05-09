import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_code", request.url)
    );
  }

  try {
    // Call your existing API to handle the OAuth code exchange
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${apiUrl}/api/v1/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.log(err)
      throw new Error(err);
    }

    const data = await response.json();

    // Set access token in secure httpOnly cookie
    const redirectResponse = NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
    redirectResponse.cookies.set("access_token", data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    // Set refresh token from backend response cookies
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      redirectResponse.headers.append("set-cookie", setCookieHeader);
    }

    return redirectResponse;
  } catch (error: unknown) {
    console.error("Google OAuth callback error:", {...error as object});
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent("Authentication failed")}`,
        request.url
      )
    );
  }
}
