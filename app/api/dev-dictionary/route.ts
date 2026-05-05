import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const items = await db.devDictionary.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { keyword, description, example } = (body as {
    keyword?: unknown;
    description?: unknown;
    example?: unknown;
  }) ?? {};

  if (typeof keyword !== "string" || !keyword.trim()) {
    return NextResponse.json({ error: "keyword is required" }, { status: 400 });
  }
  if (typeof description !== "string" || !description.trim()) {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }

  const item = await db.devDictionary.create({
    data: {
      keyword: keyword.trim(),
      description: description.trim(),
      example: typeof example === "string" && example.trim() ? example.trim() : null,
    },
  });

  return NextResponse.json({ id: item.id, item }, { status: 201 });
}
