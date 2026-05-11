/**
 * Server·client 양쪽에서 안전하게 import 가능한 타입·순수 함수.
 * "use client" 절 없음 → server component에서도 호출 가능.
 */

export type TopTab = "all" | "dictionary" | "reference";
export type SubTab = "visual" | "dev" | "fresh" | "archived";
export type SectionId = "inbox" | "visual" | "dev" | "reference";

const SUBS_BY_TOP: Record<TopTab, ReadonlyArray<SubTab>> = {
  all: [],
  dictionary: ["visual", "dev"],
  reference: ["fresh", "archived"],
};

export function parseTop(v: string | null | undefined): TopTab {
  return v === "dictionary" || v === "reference" ? v : "all";
}

export function parseSub(v: string | null | undefined, top: TopTab): SubTab | null {
  if (!v) return null;
  const allowed = SUBS_BY_TOP[top];
  return (allowed as readonly string[]).includes(v) ? (v as SubTab) : null;
}

/** 섹션 → 어느 그룹/하위에 속하는가 */
export const SECTION_GROUP: Record<SectionId, { top: Exclude<TopTab, "all">; sub: SubTab }> = {
  visual: { top: "dictionary", sub: "visual" },
  dev: { top: "dictionary", sub: "dev" },
  inbox: { top: "reference", sub: "fresh" },
  reference: { top: "reference", sub: "archived" },
};
