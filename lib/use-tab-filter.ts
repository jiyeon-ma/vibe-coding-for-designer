"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type TopTab = "all" | "dictionary" | "reference";
export type SubTab = "visual" | "dev" | "fresh" | "archived";
export type SectionId = "inbox" | "visual" | "dev" | "reference";

const TOP_TABS: ReadonlyArray<TopTab> = ["all", "dictionary", "reference"];
const SUBS_BY_TOP: Record<TopTab, ReadonlyArray<SubTab>> = {
  all: [],
  dictionary: ["visual", "dev"],
  reference: ["fresh", "archived"],
};

/** 섹션 → 어느 그룹/하위에 속하는가 */
const SECTION_GROUP: Record<SectionId, { top: Exclude<TopTab, "all">; sub: SubTab }> = {
  visual: { top: "dictionary", sub: "visual" },
  dev: { top: "dictionary", sub: "dev" },
  inbox: { top: "reference", sub: "fresh" },
  reference: { top: "reference", sub: "archived" },
};

function parseTop(v: string | null): TopTab {
  return v === "dictionary" || v === "reference" ? v : "all";
}

function parseSub(v: string | null, top: TopTab): SubTab | null {
  if (!v) return null;
  const allowed = SUBS_BY_TOP[top];
  return (allowed as readonly string[]).includes(v) ? (v as SubTab) : null;
}

/**
 * 탭 필터 hook
 *
 * URL state: ?tab=all|dictionary|reference[&sub=visual|dev|fresh|archived]
 * - top=all 이면 4개 섹션 모두 노출
 * - top=dictionary 이면 visual + dev (sub 미지정) 또는 sub만
 * - top=reference 이면 inbox + reference (sub 미지정) 또는 sub만
 */
export function useTabFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const top = parseTop(params.get("tab"));
  const sub = parseSub(params.get("sub"), top);

  const setTop = useCallback(
    (next: TopTab) => {
      const sp = new URLSearchParams(params.toString());
      if (next === "all") {
        sp.delete("tab");
        sp.delete("sub");
      } else {
        sp.set("tab", next);
        sp.delete("sub");
      }
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router]
  );

  const setSub = useCallback(
    (next: SubTab | null) => {
      const sp = new URLSearchParams(params.toString());
      if (top === "all") return; // sub는 dictionary/reference 안에서만 의미
      sp.set("tab", top);
      if (next) sp.set("sub", next);
      else sp.delete("sub");
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [params, pathname, router, top]
  );

  const isVisible = useCallback(
    (section: SectionId): boolean => {
      if (top === "all") return true;
      const group = SECTION_GROUP[section];
      if (group.top !== top) return false;
      // sub 미지정이면 그 그룹의 두 섹션 모두 노출
      if (!sub) return true;
      return group.sub === sub;
    },
    [top, sub]
  );

  return useMemo(
    () => ({ top, sub, setTop, setSub, isVisible }),
    [top, sub, setTop, setSub, isVisible]
  );
}

export const TABS_META = {
  TOP: [
    { id: "all" as const, label: "All" },
    { id: "dictionary" as const, label: "Vibe Dictionary" },
    { id: "reference" as const, label: "Vibe Reference" },
  ],
  SUB: {
    dictionary: [
      { id: "visual" as const, label: "Visual" },
      { id: "dev" as const, label: "Dev" },
    ],
    reference: [
      { id: "fresh" as const, label: "New" },
      { id: "archived" as const, label: "Archived" },
    ],
  },
} as const;
