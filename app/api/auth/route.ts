import { NextRequest, NextResponse } from "next/server";

async function makeToken(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(process.env.SESSION_SECRET!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", keyMaterial, encoder.encode(password));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (password !== process.env.ACCESS_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await makeToken(password);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
