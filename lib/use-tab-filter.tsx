"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  SECTION_GROUP,
  type TopTab,
  type SubTab,
  type SectionId,
} from "./tab-filter-shared";

export type { TopTab, SubTab, SectionId };
export { parseTop, parseSub } from "./tab-filter-shared";

type TabFilterValue = {
  top: TopTab;
  sub: SubTab | null;
  setTop: (next: TopTab) => void;
  setSub: (next: SubTab | null) => void;
  isVisible: (section: SectionId) => boolean;
};

const TabFilterContext = createContext<TabFilterValue | null>(null);

/**
 * 탭 필터 컨텍스트.
 * 클라이언트 상태로 탭/하위 탭을 관리하고, URL은 window.history.replaceState로
 * 코스메틱하게만 업데이트한다 → 탭 클릭 시 서버 컴포넌트가 다시 fetch하지 않음.
 *
 * 초기 상태는 SSR이 URL 파라미터를 읽어 prop으로 주입.
 */
export function TabFilterProvider({
  initialTop = "all",
  initialSub = null,
  children,
}: {
  initialTop?: TopTab;
  initialSub?: SubTab | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [top, setTopState] = useState<TopTab>(initialTop);
  const [sub, setSubState] = useState<SubTab | null>(initialSub);

  const writeUrl = useCallback(
    (nextTop: TopTab, nextSub: SubTab | null) => {
      if (typeof window === "undefined") return;
      const sp = new URLSearchParams();
      if (nextTop !== "all") sp.set("tab", nextTop);
      if (nextSub) sp.set("sub", nextSub);
      const qs = sp.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      window.history.replaceState(null, "", url);
    },
    [pathname]
  );

  const setTop = useCallback(
    (next: TopTab) => {
      setTopState(next);
      setSubState(null);
      writeUrl(next, null);
    },
    [writeUrl]
  );

  const setSub = useCallback(
    (next: SubTab | null) => {
      setSubState(next);
      writeUrl(top, next);
    },
    [writeUrl, top]
  );

  const isVisible = useCallback(
    (section: SectionId): boolean => {
      if (top === "all") return true;
      const group = SECTION_GROUP[section];
      if (group.top !== top) return false;
      if (!sub) return true;
      return group.sub === sub;
    },
    [top, sub]
  );

  const value = useMemo<TabFilterValue>(
    () => ({ top, sub, setTop, setSub, isVisible }),
    [top, sub, setTop, setSub, isVisible]
  );

  return <TabFilterContext.Provider value={value}>{children}</TabFilterContext.Provider>;
}

export function useTabFilter(): TabFilterValue {
  const ctx = useContext(TabFilterContext);
  if (!ctx) {
    throw new Error("useTabFilter must be used inside <TabFilterProvider>");
  }
  return ctx;
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
