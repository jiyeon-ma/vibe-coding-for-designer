import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MOCK_VISUAL_DICTIONARY } from "@/lib/mock-visual-dictionary";

export const dynamic = "force-dynamic";

export type SearchResult = {
  source: "reference" | "dev" | "visual";
  id: string;
  title: string;
  snippet: string;
  navHint: {
    top: "all" | "dictionary" | "reference";
    sub: "visual" | "dev" | "fresh" | "archived" | null;
  };
};

const PER_SOURCE_LIMIT = 6;

function clip(text: string, max = 120): string {
  return text.length <= max ? text : text.slice(0, max - 1) + "…";
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ results: [] });

  const needle = q.toLowerCase();

  const [refs, devs] = await Promise.all([
    db.reference.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { aiSummary: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: PER_SOURCE_LIMIT,
      select: {
        id: true,
        title: true,
        url: true,
        aiSummary: true,
        status: true,
      },
    }),
    db.devDictionary.findMany({
      where: {
        OR: [
          { keyword: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { example: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: PER_SOURCE_LIMIT,
    }),
  ]);

  const referenceResults: SearchResult[] = refs.map((r) => ({
    source: "reference",
    id: r.id,
    title: r.title ?? r.url,
    snippet: clip(r.aiSummary ?? r.url),
    navHint: {
      top: "reference",
      sub: r.status === "ARCHIVED" ? "archived" : "fresh",
    },
  }));

  const devResults: SearchResult[] = devs.map((d) => ({
    source: "dev",
    id: d.id,
    title: d.keyword,
    snippet: clip(d.description),
    navHint: { top: "dictionary", sub: "dev" },
  }));

  // Visual Dictionary는 현재 mock — 추후 DB 연동 시 동일 패턴으로 교체
  const visualResults: SearchResult[] = MOCK_VISUAL_DICTIONARY.filter((v) => {
    const haystack = [
      v.keyword,
      v.vibeDescription,
      ...v.prompts.map((p) => `${p.tool} ${p.body}`),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  })
    .slice(0, PER_SOURCE_LIMIT)
    .map((v) => ({
      source: "visual",
      id: v.id,
      title: v.keyword,
      snippet: clip(v.vibeDescription),
      navHint: { top: "dictionary", sub: "visual" },
    }));

  // 출처 분산을 위해 round-robin 인터리빙
  const merged: SearchResult[] = [];
  const buckets = [referenceResults, devResults, visualResults];
  let added = true;
  let i = 0;
  while (added) {
    added = false;
    for (const b of buckets) {
      if (b[i]) {
        merged.push(b[i]);
        added = true;
      }
    }
    i++;
  }

  return NextResponse.json({ results: merged });
}
