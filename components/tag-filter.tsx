"use client";

import { motion } from "framer-motion";
import { duration, ease } from "@/lib/motion";

export function TagFilter({
  tags,
  active,
  onChange,
}: {
  tags: string[];
  active: string | null;
  onChange: (next: string | null) => void;
}) {
  if (tags.length === 0) return null;

  return (
    <div className="mb-5 -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none">
      <Chip
        label="전체"
        active={active === null}
        onClick={() => onChange(null)}
      />
      {tags.map((tag) => (
        <Chip
          key={tag}
          label={`#${tag}`}
          active={active === tag}
          onClick={() => onChange(active === tag ? null : tag)}
        />
      ))}
    </div>
  );
}

function Chip({
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
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: duration.fast, ease: ease.out }}
      className={`shrink-0 px-3 py-1 rounded-full text-[12px] font-medium tracking-[0] transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-focus/50 ${
        active
          ? "bg-surface-2 text-ink border border-hairline-strong"
          : "bg-transparent text-ink-subtle border border-hairline hover:text-ink-muted hover:border-hairline-strong"
      }`}
    >
      {label}
    </motion.button>
  );
}
