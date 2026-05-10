"use client";

import { motion } from "framer-motion";
import { useTabFilter, type SubTab } from "@/lib/use-tab-filter";
import { duration, ease } from "@/lib/motion";

type Stat = {
  count: number;
  label: string;
  hint: string;
  top: "dictionary" | "reference";
  sub: SubTab;
};

export function CategoryOverview({
  visualCount,
  devCount,
  freshCount,
  archivedCount,
}: {
  visualCount: number;
  devCount: number;
  freshCount: number;
  archivedCount: number;
}) {
  const { top, setTop, setSub } = useTabFilter();

  /* All 탭에서만 노출 */
  if (top !== "all") return null;

  const stats: Stat[] = [
    {
      count: visualCount,
      label: "Visual Dictionary",
      hint: "감성 키워드 ↔ AI 프롬프트",
      top: "dictionary",
      sub: "visual",
    },
    {
      count: devCount,
      label: "Dev Dictionary",
      hint: "용어 · 개념 사전",
      top: "dictionary",
      sub: "dev",
    },
    {
      count: freshCount,
      label: "New",
      hint: "미확인 레퍼런스",
      top: "reference",
      sub: "fresh",
    },
    {
      count: archivedCount,
      label: "Vibe Archived",
      hint: "분류된 보관 자료",
      top: "reference",
      sub: "archived",
    },
  ];

  const handleClick = (s: Stat) => {
    setTop(s.top);
    setSub(s.sub);
    requestAnimationFrame(() => {
      const id =
        s.sub === "visual"
          ? "visual"
          : s.sub === "dev"
            ? "dev"
            : s.sub === "archived"
              ? "reference"
              : "inbox";
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.medium, ease: ease.out }}
      aria-label="카테고리 요약"
      className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 py-14 md:py-20 mt-10 border-y border-hairline"
    >
      {stats.map((s, i) => (
        <motion.button
          key={s.label}
          type="button"
          onClick={() => handleClick(s)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.05 + i * 0.06,
            duration: duration.base,
            ease: ease.out,
          }}
          className="group text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-focus/50 rounded-md"
        >
          <div className="text-[64px] md:text-[80px] font-semibold tracking-[-2.6px] md:tracking-[-3.4px] text-ink leading-[0.95] mb-3 tabular-nums transition-colors duration-200 group-hover:text-brand">
            {s.count}
          </div>
          <div className="text-[15px] font-medium tracking-[-0.1px] text-ink mb-1">
            {s.label}
          </div>
          <div className="text-[12.5px] text-ink-subtle leading-[1.5]">
            {s.hint}
          </div>
        </motion.button>
      ))}
    </motion.section>
  );
}
