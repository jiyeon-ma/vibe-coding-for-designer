"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { DevDictionaryCard, type DevDictionaryItem } from "./dev-dictionary-card";
import { DevDictionaryForm } from "./dev-dictionary-form";

export function DevDictionaryGrid({ initial }: { initial: DevDictionaryItem[] }) {
  const [items, setItems] = useState(initial);

  return (
    <>
      <div className="flex justify-end mb-4">
        <DevDictionaryForm />
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-hairline rounded-[12px] py-16 px-6 text-center">
          <p className="text-[15px] text-ink-subtle leading-[1.5]">
            아직 등록한 용어가 없어요.
          </p>
          <p className="text-[13px] text-ink-tertiary mt-1">
            "새 용어 추가" 버튼으로 첫 항목을 만들어 보세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <DevDictionaryCard
                key={item.id}
                index={i}
                data={item}
                onRemove={(id) => setItems((prev) => prev.filter((x) => x.id !== id))}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
