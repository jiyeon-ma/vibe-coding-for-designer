import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/**
 * AI는 항상 4개 시스템 카테고리 slug 중 하나를 반환한다.
 * 사용자 추가 카테고리(예: "animation")로의 자동 분류는 지원하지 않는다 —
 * 사용자가 Vibe Archived에서 수동/D&D로 옮긴다.
 */
export const SYSTEM_SLUGS = ["visual", "dev", "reference", "unclassified"] as const;
export type SystemSlug = (typeof SYSTEM_SLUGS)[number];

const SYSTEM = `당신은 디자이너의 레퍼런스를 분류하는 큐레이터입니다.

# 카테고리 (반드시 4개 slug 중 하나)
- visual: 디자인 / 아트 / UI / 3D / 사진 / 모션 / 인테리어 등 시각적 영감
- dev: 코드 / 엔지니어링 / 도구 / CLI / 라이브러리 / API 문서
- reference: 글 / 리서치 / 케이스 스터디 / 인터뷰 / 일반 자료
- unclassified: 위 어디에도 명확히 속하지 않거나 정보가 부족할 때

# 출력 규칙
- summary: 한국어 1줄(120자 이내). 핵심만.
- tags: 영문 소문자 또는 한글 단어. 5개 이내. (예: glassmorphism, threejs, motion, brutalism, minimal, 디자인시스템)
- confidence: 0.0~1.0. 카테고리 판단의 확신 정도. 0.6 미만이면 unclassified로.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    category: {
      type: Type.STRING,
      enum: ["visual", "dev", "reference", "unclassified"],
    },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    confidence: { type: Type.NUMBER },
  },
  required: ["summary", "category", "tags", "confidence"],
};

export type ClassifyInput = {
  url: string;
  title: string | null;
  ogDescription: string | null;
};

export type ClassifyResult = {
  summary: string;
  categorySlug: SystemSlug;
  tags: string[];
  confidence: number;
};

export async function classify(input: ClassifyInput): Promise<ClassifyResult> {
  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: SYSTEM,
      responseMimeType: "application/json",
      responseSchema: SCHEMA,
    },
    contents: `URL: ${input.url}
제목: ${input.title ?? ""}
설명: ${input.ogDescription ?? ""}`,
  });

  const text = res.text;
  if (!text) throw new Error("Gemini returned empty response");

  const parsed = JSON.parse(text) as {
    summary: string;
    category: string;
    tags: string[];
    confidence: number;
  };

  const slug: SystemSlug = (SYSTEM_SLUGS as readonly string[]).includes(parsed.category)
    ? (parsed.category as SystemSlug)
    : "unclassified";

  return {
    summary: parsed.summary.slice(0, 200),
    categorySlug: slug,
    tags: parsed.tags.slice(0, 5).map((t) => t.trim()).filter(Boolean),
    confidence: Math.max(0, Math.min(1, parsed.confidence)),
  };
}
