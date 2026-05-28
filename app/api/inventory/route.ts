import { NextRequest, NextResponse } from "next/server";
import { sql, initDb } from "@/lib/db";

export async function GET() {
  await initDb();
  const rows = await sql`SELECT * FROM inventory ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  await initDb();
  const body = await req.json();
  const {
    id, name, name_fr, category, era,
    quantity, qty_available, status,
    origin, value, description, notes,
  } = body;

  const [row] = await sql`
    INSERT INTO inventory (id, name, name_fr, category, era, quantity, qty_available, status, origin, value, description, notes)
    VALUES (${id}, ${name}, ${name_fr ?? null}, ${category}, ${era ?? null},
            ${quantity ?? 0}, ${qty_available ?? 0}, ${status ?? "available"},
            ${origin ?? null}, ${value ?? null}, ${description ?? null}, ${notes ?? null})
    RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}
