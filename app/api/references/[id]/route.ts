import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Status } from "@/lib/generated/prisma/enums";

const validStatus = new Set<Status>(["UNREAD", "ARCHIVED"]);

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

  const data: {
    status?: Status;
    archivedAt?: Date | null;
    categoryId?: string | null;
  } = {};

  const status = (body as { status?: unknown })?.status;
  if (typeof status === "string") {
    if (!validStatus.has(status as Status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = status as Status;
    data.archivedAt = status === "ARCHIVED" ? new Date() : null;
  }

  // 카테고리 변경: id 또는 slug 둘 다 받아 처리
  const categoryId = (body as { categoryId?: unknown })?.categoryId;
  const categorySlug = (body as { categorySlug?: unknown })?.categorySlug;

  if (typeof categoryId === "string") {
    const exists = await db.category.findUnique({ where: { id: categoryId } });
    if (!exists) return NextResponse.json({ error: "Invalid categoryId" }, { status: 400 });
    data.categoryId = categoryId;
  } else if (typeof categorySlug === "string") {
    const cat = await db.category.findUnique({ where: { slug: categorySlug } });
    if (!cat) return NextResponse.json({ error: "Invalid categorySlug" }, { status: 400 });
    data.categoryId = cat.id;
  } else if (categoryId === null) {
    data.categoryId = null;
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
