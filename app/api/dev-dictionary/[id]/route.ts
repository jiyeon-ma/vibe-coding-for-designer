import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: { keyword?: string; description?: string; example?: string | null } = {};
  const { keyword, description, example } = (body as {
    keyword?: unknown;
    description?: unknown;
    example?: unknown;
  }) ?? {};

  if (typeof keyword === "string" && keyword.trim()) data.keyword = keyword.trim();
  if (typeof description === "string" && description.trim())
    data.description = description.trim();
  if (typeof example === "string") {
    data.example = example.trim() || null;
  } else if (example === null) {
    data.example = null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const updated = await db.devDictionary.update({ where: { id }, data });
    return NextResponse.json({ id: updated.id });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    await db.devDictionary.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
