import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Status, Category } from "@/lib/generated/prisma/enums";

const validStatus = new Set<Status>(["UNREAD", "ARCHIVED"]);
const validCategory = new Set<Category>([
  "VISUAL",
  "DEV",
  "REFERENCE",
  "UNCLASSIFIED",
]);

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

  const data: { status?: Status; aiCategory?: Category; archivedAt?: Date | null } = {};

  const status = (body as { status?: unknown })?.status;
  if (typeof status === "string") {
    if (!validStatus.has(status as Status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = status as Status;
    data.archivedAt = status === "ARCHIVED" ? new Date() : null;
  }

  const aiCategory = (body as { aiCategory?: unknown })?.aiCategory;
  if (typeof aiCategory === "string") {
    if (!validCategory.has(aiCategory as Category)) {
      return NextResponse.json({ error: "Invalid aiCategory" }, { status: 400 });
    }
    data.aiCategory = aiCategory as Category;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const updated = await db.reference.update({ where: { id }, data });
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
    await db.reference.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
