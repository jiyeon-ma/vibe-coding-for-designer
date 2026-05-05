"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { InboxCard, type InboxCardData } from "./inbox-card";
import { TagFilter } from "./tag-filter";

export function InboxGrid({
  initial,
  showTagFilter = false,
  emptyTitle = "아직 비어있어요.",
  emptyHint = "위 입력창에 첫 링크를 붙여넣어 보세요.",
}: {
  initial: InboxCardData[];
  showTagFilter?: boolean;
  emptyTitle?: string;
  emptyHint?: string;
}) {
  const [items, setItems] = useState(initial);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((r) =>
      r.tags.forEach(({ tag }) => counts.set(tag.name, (counts.get(tag.name) ?? 0) + 1))
    );
    // 빈도 내림차순, 같으면 알파벳 오름차순
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name]) => name);
  }, [items]);

  const filtered = activeTag
    ? items.filter((r) => r.tags.some(({ tag }) => tag.name === activeTag))
    : items;

  if (initial.length === 0) {
    return (
      <div className="border border-dashed border-hairline rounded-[12px] py-20 px-6 text-center">
        <p className="text-[16px] text-ink-subtle leading-[1.5]">{emptyTitle}</p>
        <p className="text-[14px] text-ink-tertiary mt-1">{emptyHint}</p>
      </div>
    );
  }

  return (
    <>
      {showTagFilter && (
        <TagFilter tags={allTags} active={activeTag} onChange={setActiveTag} />
      )}

      {filtered.length === 0 ? (
        <div className="border border-dashed border-hairline rounded-[12px] py-12 px-6 text-center">
          <p className="text-[14px] text-ink-subtle">
            {`#${activeTag}`} 태그가 달린 카드가 없어요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((ref, i) => (
              <InboxCard
                key={ref.id}
                index={i}
                data={ref}
                onRemove={(id) => setItems((prev) => prev.filter((r) => r.id !== id))}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
