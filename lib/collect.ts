import { db } from "./db";
import { fetchOG } from "./og";
import type { Source } from "./generated/prisma/enums";

export type CollectResult =
  | { status: "created"; id: string }
  | { status: "duplicate"; id: string };

/**
 * URL 정규화: trim + 끝 슬래시 제거.
 * (host의 대소문자 표준화는 일단 미구현 — 1인 사용엔 충분)
 */
function normalizeUrl(input: string): string {
  return input.trim().replace(/\/$/, "");
}

/**
 * 공통 수집 함수 — 웹·텔레그램 두 채널이 공유한다.
 * 1) URL 정규화 + 중복 체크
 * 2) OG 추출 (5초 타임아웃)
 * 3) Reference INSERT (status=UNREAD, aiSummary는 null)
 *
 * 실제 분류 작업은 호출 측에서 `after()`로 비동기 등록 (Step 9).
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

  return { status: "created", id: ref.id };
}
