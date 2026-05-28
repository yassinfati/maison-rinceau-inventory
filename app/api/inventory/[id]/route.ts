import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const {
    name, name_fr, category, era,
    quantity, qty_available, status,
    origin, value, description, notes,
  } = body;

  const [row] = await sql`
    UPDATE inventory SET
      name = ${name},
      name_fr = ${name_fr ?? null},
      category = ${category},
      era = ${era ?? null},
      quantity = ${quantity ?? 0},
      qty_available = ${qty_available ?? 0},
      status = ${status ?? "available"},
      origin = ${origin ?? null},
      value = ${value ?? null},
      description = ${description ?? null},
      notes = ${notes ?? null}
    WHERE id = ${id}
    RETURNING *
  `;
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM inventory WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
