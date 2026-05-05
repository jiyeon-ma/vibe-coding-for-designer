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

  const target = await db.category.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { label, order } = (body as { label?: unknown; order?: unknown }) ?? {};
  const data: { label?: string; order?: number } = {};

  if (typeof label === "string" && label.trim()) {
    data.label = label.trim().slice(0, 40);
  }
  if (typeof order === "number" && Number.isFinite(order)) {
    data.order = Math.trunc(order);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const updated = await db.category.update({ where: { id }, data });
  return NextResponse.json({ category: updated });
}

/**
 * 사용자 카테고리만 삭제 가능. 그 카테고리의 카드는 unclassified로 옮긴다.
 * 트랜잭션으로 처리해 사라지는 카드가 없게 한다.
 */
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const target = await db.category.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (target.isSystem) {
    return NextResponse.json({ error: "System category cannot be deleted" }, { status: 400 });
  }

  const unclassified = await db.category.findUnique({ where: { slug: "unclassified" } });
  if (!unclassified) {
    return NextResponse.json({ error: "Unclassified category missing" }, { status: 500 });
  }

  await db.$transaction([
    db.reference.updateMany({
      where: { categoryId: id },
      data: { categoryId: unclassified.id },
    }),
    db.category.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
