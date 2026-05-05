"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTabFilter, TABS_META, type TopTab, type SubTab } from "@/lib/use-tab-filter";
import { duration, ease } from "@/lib/motion";

export function TabNav() {
  const { top, sub, setTop, setSub } = useTabFilter();

  const subItems =
    top === "dictionary"
      ? TABS_META.SUB.dictionary
      : top === "reference"
        ? TABS_META.SUB.reference
        : null;

  return (
    <nav
      aria-label="섹션 필터"
      className="sticky top-0 z-30 -mx-6 md:-mx-10 px-6 md:px-10 pt-3 bg-canvas/80 backdrop-blur-md border-b border-hairline"
    >
      {/* Top tabs */}
      <ul className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-2.5">
        {TABS_META.TOP.map((tab) => (
          <li key={tab.id} className="shrink-0">
            <Pill
              label={tab.label}
              active={top === tab.id}
              onClick={() => setTop(tab.id as TopTab)}
            />
          </li>
        ))}
      </ul>

      {/* Sub tabs */}
      <AnimatePresence initial={false} mode="wait">
        {subItems && (
          <motion.div
            key={top}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: duration.base, ease: ease.out }}
            className="overflow-hidden"
          >
            <ul className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-2.5">
              <li className="shrink-0">
                <SubPill
                  label={top === "dictionary" ? "전체" : "전체"}
                  active={sub === null}
                  onClick={() => setSub(null)}
                />
              </li>
              {subItems.map((item) => (
                <li key={item.id} className="shrink-0">
                  <SubPill
                    label={item.label}
                    active={sub === item.id}
                    onClick={() => setSub(item.id as SubTab)}
                  />
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-[14px] font-medium tracking-[0] transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-focus/50 ${
        active
          ? "bg-surface-2 text-ink"
          : "bg-transparent text-ink-subtle hover:text-ink-muted"
      }`}
    >
      {label}
    </button>
  );
}

function SubPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-[12px] font-medium tracking-[0] transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-focus/50 ${
        active
          ? "bg-surface-2 text-ink border border-hairline-strong"
          : "bg-transparent text-ink-subtle border border-hairline hover:text-ink-muted hover:border-hairline-strong"
      }`}
    >
      {label}
    </button>
  );
}
