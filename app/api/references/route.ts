import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { collectUrl } from "@/lib/collect";
import type { Status, Category } from "@/lib/generated/prisma/enums";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const url = (body as { url?: unknown })?.url;
  if (typeof url !== "string" || !url.trim()) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.json({ error: "url must be http(s)" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "url is not a valid URL" }, { status: 400 });
  }

  const result = await collectUrl(url, "MANUAL");

  if (result.status === "duplicate") {
    return NextResponse.json({ id: result.id, duplicate: true }, { status: 409 });
  }
  return NextResponse.json({ id: result.id }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const categoryParam = searchParams.get("category");

  const validStatus = new Set<Status>(["UNREAD", "ARCHIVED"]);
  const validCategory = new Set<Category>([
    "VISUAL",
    "DEV",
    "REFERENCE",
    "UNCLASSIFIED",
  ]);

  const where: { status?: Status; aiCategory?: Category } = {};
  if (statusParam && validStatus.has(statusParam as Status)) {
    where.status = statusParam as Status;
  }
  if (categoryParam && validCategory.has(categoryParam as Category)) {
    where.aiCategory = categoryParam as Category;
  }

  const refs = await db.reference.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json({ references: refs });
}
