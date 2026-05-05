import { after } from "next/server";
import { db } from "./db";
import { fetchOG } from "./og";
import { classify } from "./ai/classify";
import type { Source } from "./generated/prisma/enums";

export type CollectResult =
  | { status: "created"; id: string }
  | { status: "duplicate"; id: string };

function normalizeUrl(input: string): string {
  return input.trim().replace(/\/$/, "");
}

/**
 * 공통 수집 함수 — 웹·텔레그램 두 채널이 공유한다.
 *
 * 흐름:
 * 1) URL 정규화 + 중복 체크 (unique 위반 방지)
 * 2) OG 추출 (5초 타임아웃)
 * 3) Reference INSERT (status=UNREAD, aiSummary는 null)
 * 4) after()로 Gemini 분류를 백그라운드에 등록 → 응답 즉시 반환
 *
 * after() 콜백은 응답 송신 직후 실행되며, 실패 시 자동 재시도하지 않는다
 * (plan.md §Gemini 한도 효율화 규칙 #3).
 */
export async function collectUrl(rawUrl: string, source: Source): Promise<CollectResult> {
  const url = normalizeUrl(rawUrl);

  const existing = await db.reference.findUnique({ where: { url } });
  if (existing) return { status: "duplicate", id: existing.id };

  const og = await fetchOG(url);
  const ref = await db.reference.create({
    data: {
      url,
      title: og.title,
      ogImage: og.ogImage,
      ogDescription: og.ogDescription,
      source,
      status: "UNREAD",
    },
  });

  // 응답 후 백그라운드로 AI 분류 실행
  after(async () => {
    try {
      const result = await classify({
        url: ref.url,
        title: ref.title,
        ogDescription: ref.ogDescription,
      });

      await db.reference.update({
        where: { id: ref.id },
        data: {
          aiSummary: result.summary,
          aiCategory: result.category,
          aiConfidence: result.confidence,
          rawAiResponse: { ...result, model: "gemini-2.5-flash" },
          tags: {
            create: result.tags.map((name) => ({
              tag: {
                connectOrCreate: { where: { name }, create: { name } },
              },
            })),
          },
        },
      });
    } catch (e) {
      // 자동 재시도 절대 금지 — 사용자가 카드 메뉴에서 수동 트리거
      console.error("[classify] failed for", ref.url, e);
    }
  });

  return { status: "created", id: ref.id };
}
