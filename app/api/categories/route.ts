import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const categories = await db.category.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ categories });
}

/**
 * 사용자가 카테고리를 추가한다. 시스템 카테고리(isSystem=true)는 마이그레이션 시드로
 * 이미 존재하므로 여기서는 새로 만들지 않는다.
 *
 * label만 받고 slug은 자동 생성한다 — 한글·공백·특수문자 → kebab-case.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const label = (body as { label?: unknown })?.label;
  if (typeof label !== "string" || !label.trim()) {
    return NextResponse.json({ error: "label is required" }, { status: 400 });
  }

  const trimmed = label.trim();
  if (trimmed.length > 40) {
    return NextResponse.json({ error: "label is too long (max 40)" }, { status: 400 });
  }

  // slug 생성: 영문/숫자만 남기고 kebab-case. 한글이면 kebab으로 변환 안 되니 random 접미사 추가
  const baseSlug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  const slug = baseSlug || `cat-${Math.random().toString(36).slice(2, 8)}`;

  // 중복 시 숫자 접미사
  let candidate = slug;
  for (let i = 2; i < 100; i++) {
    const dup = await db.category.findUnique({ where: { slug: candidate } });
    if (!dup) break;
    candidate = `${slug}-${i}`;
  }

  // order: 사용자 카테고리는 시스템보다 뒤. unclassified(99)보다 앞에 두기 위해 50~98 범위로
  const last = await db.category.findFirst({
    where: { isSystem: false },
    orderBy: { order: "desc" },
  });
  const nextOrder = last ? Math.min(last.order + 1, 98) : 50;

  const created = await db.category.create({
    data: {
      slug: candidate,
      label: trimmed,
      isSystem: false,
      order: nextOrder,
    },
  });

  return NextResponse.json({ category: created }, { status: 201 });
}
