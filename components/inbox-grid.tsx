"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { InboxCard, type InboxCardData } from "./inbox-card";

export function InboxGrid({ initial }: { initial: InboxCardData[] }) {
  const [items, setItems] = useState(initial);

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-hairline rounded-[12px] py-20 px-6 text-center">
        <p className="text-[16px] text-ink-subtle leading-[1.5]">
          아직 비어있어요.
        </p>
        <p className="text-[14px] text-ink-tertiary mt-1">
          위 입력창에 첫 링크를 붙여넣어 보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {items.map((ref, i) => (
          <InboxCard
            key={ref.id}
            index={i}
            data={ref}
            onRemove={(id) => setItems((prev) => prev.filter((r) => r.id !== id))}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
