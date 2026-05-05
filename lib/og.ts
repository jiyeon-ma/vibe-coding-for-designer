import ogs from "open-graph-scraper";

export type OGResult = {
  title: string | null;
  ogImage: string | null;
  ogDescription: string | null;
};

/**
 * 페이지의 OG 메타를 추출한다.
 * 5초 타임아웃 (Vercel Hobby 함수 10초 한도 보호용).
 * 실패 시 null 객체 반환 — 호출 측이 그대로 DB에 저장 가능.
 */
export async function fetchOG(url: string): Promise<OGResult> {
  try {
    const { result } = await ogs({
      url,
      timeout: 5000,
      fetchOptions: {
        headers: {
          // 일부 사이트(예: Twitter/X)가 봇 UA를 차단하므로 일반 브라우저로 위장
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        },
      },
    });

    return {
      title: result.ogTitle ?? result.twitterTitle ?? null,
      ogImage: result.ogImage?.[0]?.url ?? result.twitterImage?.[0]?.url ?? null,
      ogDescription: (
        result.ogDescription ??
        result.twitterDescription ??
        ""
      ).slice(0, 200),
    };
  } catch {
    return { title: null, ogImage: null, ogDescription: null };
  }
}
