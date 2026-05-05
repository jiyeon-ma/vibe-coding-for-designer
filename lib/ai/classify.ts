import { GoogleGenAI, Type } from "@google/genai";
import type { Category } from "../generated/prisma/enums";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM = `당신은 디자이너의 레퍼런스를 분류하는 큐레이터입니다.

# 카테고리 (반드시 4개 중 하나)
- VISUAL: 디자인 / 아트 / UI / 3D / 사진 / 모션 / 인테리어 등 시각적 영감
- DEV: 코드 / 엔지니어링 / 도구 / CLI / 라이브러리 / API 문서
- REFERENCE: 글 / 리서치 / 케이스 스터디 / 인터뷰 / 일반 자료
- UNCLASSIFIED: 위 어디에도 명확히 속하지 않거나 정보가 부족할 때

# 출력 규칙
- summary: 한국어로 1줄, 120자 이내. 핵심만.
- tags: 영문 소문자 또는 한글 단어. 5개 이내. (예: glassmorphism, threejs, motion, brutalism, minimal, 디자인시스템)
- confidence: 0.0~1.0. 카테고리 판단의 확신 정도. 0.6 미만이면 UNCLASSIFIED로 분류해도 좋다.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    category: {
      type: Type.STRING,
      enum: ["VISUAL", "DEV", "REFERENCE", "UNCLASSIFIED"],
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
  category: Category;
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

  // 안전장치: schema enum이 강제되긴 하지만 한 번 더 검증
  const validCategories: Category[] = ["VISUAL", "DEV", "REFERENCE", "UNCLASSIFIED"];
  const category = validCategories.includes(parsed.category as Category)
    ? (parsed.category as Category)
    : "UNCLASSIFIED";

  return {
    summary: parsed.summary.slice(0, 200),
    category,
    tags: parsed.tags.slice(0, 5).map((t) => t.trim()).filter(Boolean),
    confidence: Math.max(0, Math.min(1, parsed.confidence)),
  };
}
