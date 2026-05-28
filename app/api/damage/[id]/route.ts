import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { item_id, report_date, severity, repair_cost, description, notes, status } = body;

  const [row] = await sql`
    UPDATE damage_reports SET
      item_id = ${item_id ?? null},
      report_date = ${report_date ?? null},
      severity = ${severity ?? "minor"},
      repair_cost = ${repair_cost ?? 0},
      description = ${description ?? null},
      notes = ${notes ?? null},
      status = ${status ?? "pending"}
    WHERE id = ${id}
    RETURNING *
  `;
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM damage_reports WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
