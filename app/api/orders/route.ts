import { NextRequest, NextResponse } from "next/server";
import { sql, initDb } from "@/lib/db";

export async function GET() {
  await initDb();
  const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  await initDb();
  const body = await req.json();
  const { id, client_id, status, start_date, end_date, total, items, notes } = body;

  const [row] = await sql`
    INSERT INTO orders (id, client_id, status, start_date, end_date, total, items, notes)
    VALUES (${id}, ${client_id ?? null}, ${status ?? "draft"},
            ${start_date ?? null}, ${end_date ?? null},
            ${total ?? 0}, ${JSON.stringify(items ?? [])}, ${notes ?? null})
    RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}
