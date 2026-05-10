"use client";

import { motion } from "framer-motion";
import { useTabFilter, TABS_META, type SubTab } from "@/lib/use-tab-filter";
import { duration, ease } from "@/lib/motion";

type SubItem = { id: SubTab; label: string };

export function TabNav() {
  const { top, sub, setTop, setSub } = useTabFilter();

  return (
    <nav
      aria-label="섹션 필터"
      className="sticky top-4 z-30 flex justify-center py-2"
    >
      <motion.div
        layout
        transition={{ duration: duration.medium, ease: ease.out }}
        className="inline-flex items-center gap-1 p-1 rounded-full bg-glass-2 backdrop-blur-2xl border border-hairline shadow-lift max-w-full overflow-x-auto scrollbar-none"
      >
        <SimplePill
          label="All"
          active={top === "all"}
          onClick={() => {
            setTop("all");
          }}
        />
        <ExpandablePill
          label="Vibe Dictionary"
          active={top === "dictionary"}
          activeSub={sub}
          subs={TABS_META.SUB.dictionary as readonly SubItem[]}
          onMainClick={() => {
            if (top === "dictionary") setSub(null);
            else setTop("dictionary");
          }}
          onSubClick={(id) => setSub(id)}
        />
        <ExpandablePill
          label="Vibe Reference"
          active={top === "reference"}
          activeSub={sub}
          subs={TABS_META.SUB.reference as readonly SubItem[]}
          onMainClick={() => {
            if (top === "reference") setSub(null);
            else setTop("reference");
          }}
          onSubClick={(id) => setSub(id)}
        />
      </motion.div>
    </nav>
  );
}

function SimplePill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      layout
      type="button"
      onClick={onClick}
      transition={{ duration: duration.medium, ease: ease.out }}
      className={`shrink-0 px-4 py-2 rounded-full text-[15px] font-semibold tracking-[-0.05px] transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-focus/50 ${
        active
          ? "bg-ink text-canvas"
          : "bg-transparent text-ink-subtle hover:text-ink-muted"
      }`}
    >
      {label}
    </motion.button>
  );
}

function ExpandablePill({
  label,
  active,
  activeSub,
  subs,
  onMainClick,
  onSubClick,
}: {
  label: string;
  active: boolean;
  activeSub: SubTab | null;
  subs: readonly SubItem[];
  onMainClick: () => void;
  onSubClick: (id: SubTab) => void;
}) {
  return (
    <motion.div
      layout
      transition={{ duration: duration.medium, ease: ease.out }}
      className={`shrink-0 flex items-center rounded-full transition-colors duration-150 ${
        active ? "bg-ink" : "bg-transparent"
      }`}
    >
      <motion.button
        layout
        type="button"
        onClick={onMainClick}
        transition={{ duration: duration.medium, ease: ease.out }}
        className={`shrink-0 px-4 py-2 rounded-full text-[15px] font-semibold tracking-[-0.05px] transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-focus/50 ${
          active ? "text-canvas" : "text-ink-subtle hover:text-ink-muted"
        }`}
      >
        {label}
      </motion.button>

      {active && (
        <div className="flex items-center gap-5 pl-3 pr-5 whitespace-nowrap">
          {subs.map((s) => {
            const isActive = activeSub === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSubClick(s.id)}
                className={`text-[15px] font-medium tracking-[-0.1px] transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-focus/50 rounded-sm ${
                  isActive ? "text-brand" : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
