"use client";

import { useEffect, useRef, useState } from "react";

const TABS = [
  { id: "inbox", label: "전체" },
  { id: "visual", label: "Visual Dictionary" },
  { id: "dev", label: "Dev Terminal" },
  { id: "reference", label: "Reference Hub" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function TabNav() {
  const [active, setActive] = useState<TabId>("inbox");
  const lockRef = useRef(false); // 클릭 직후 IntersectionObserver 무시

  // 스크롤 시 현재 viewport에 가장 많이 보이는 섹션을 active로
  useEffect(() => {
    const sections = TABS.map(({ id }) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );

    const observer = new IntersectionObserver(
      (entries) => {
        if (lockRef.current) return;
        // 가장 많이 보이는 섹션 선택
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActive(visible[0].target.id as TabId);
        }
      },
      {
        // 상단 고정 영역(=144px) 아래에서만 감지 시작
        rootMargin: "-144px 0px -50% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleClick = (id: TabId) => {
    setActive(id);
    lockRef.current = true;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // 스크롤 끝나기 충분한 시간 후 IntersectionObserver 락 해제
    window.setTimeout(() => {
      lockRef.current = false;
    }, 800);
  };

  return (
    <nav
      aria-label="섹션 네비게이션"
      className="sticky top-0 z-30 -mx-6 md:-mx-10 px-6 md:px-10 py-3 bg-canvas/80 backdrop-blur-md border-b border-hairline"
    >
      <ul className="flex items-center gap-1 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <li key={tab.id} className="shrink-0">
              <button
                type="button"
                onClick={() => handleClick(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-[14px] font-medium tracking-[0] transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-focus/50 ${
                  isActive
                    ? "bg-surface-2 text-ink"
                    : "bg-transparent text-ink-subtle hover:text-ink-muted"
                }`}
              >
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
