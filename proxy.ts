import { NextRequest, NextResponse } from "next/server";

async function makeToken(password: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", keyMaterial, encoder.encode(password));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function validToken(token: string): Promise<boolean> {
  try {
    const expected = await makeToken(
      process.env.ACCESS_PASSWORD!,
      process.env.SESSION_SECRET!
    );
    return token === expected;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname === "/" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("session")?.value ?? "";
  if (!(await validToken(token))) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
