import { NextRequest, NextResponse } from "next/server";
import { sql, initDb } from "@/lib/db";

export async function GET() {
  await initDb();
  const rows = await sql`SELECT * FROM clients ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  await initDb();
  const body = await req.json();
  const { id, name, company, email, phone, city, address, notes } = body;

  const [row] = await sql`
    INSERT INTO clients (id, name, company, email, phone, city, address, notes)
    VALUES (${id}, ${name}, ${company ?? null}, ${email ?? null},
            ${phone ?? null}, ${city ?? null}, ${address ?? null}, ${notes ?? null})
    RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}
