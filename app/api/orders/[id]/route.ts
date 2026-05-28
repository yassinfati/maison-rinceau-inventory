import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { client_id, status, start_date, end_date, total, items, notes } = body;

  const [row] = await sql`
    UPDATE orders SET
      client_id = ${client_id ?? null},
      status = ${status ?? "draft"},
      start_date = ${start_date ?? null},
      end_date = ${end_date ?? null},
      total = ${total ?? 0},
      items = ${JSON.stringify(items ?? [])},
      notes = ${notes ?? null}
    WHERE id = ${id}
    RETURNING *
  `;
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM orders WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
