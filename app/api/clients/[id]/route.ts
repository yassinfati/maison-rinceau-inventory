import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, company, email, phone, city, address, notes } = body;

  const [row] = await sql`
    UPDATE clients SET
      name = ${name},
      company = ${company ?? null},
      email = ${email ?? null},
      phone = ${phone ?? null},
      city = ${city ?? null},
      address = ${address ?? null},
      notes = ${notes ?? null}
    WHERE id = ${id}
    RETURNING *
  `;
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM clients WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
