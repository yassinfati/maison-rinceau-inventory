import { NextRequest, NextResponse } from "next/server";
import { sql, initDb } from "@/lib/db";

export async function GET() {
  await initDb();
  const rows = await sql`SELECT * FROM damage_reports ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  await initDb();
  const body = await req.json();
  const { id, item_id, report_date, severity, repair_cost, description, notes, status } = body;

  const [row] = await sql`
    INSERT INTO damage_reports (id, item_id, report_date, severity, repair_cost, description, notes, status)
    VALUES (${id}, ${item_id ?? null}, ${report_date ?? null},
            ${severity ?? "minor"}, ${repair_cost ?? 0},
            ${description ?? null}, ${notes ?? null}, ${status ?? "pending"})
    RETURNING *
  `;
  return NextResponse.json(row, { status: 201 });
}
