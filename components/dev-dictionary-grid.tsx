"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { DevDictionaryCard, type DevDictionaryItem } from "./dev-dictionary-card";
import { DevDictionaryForm } from "./dev-dictionary-form";

export function DevDictionaryGrid({ initial }: { initial: DevDictionaryItem[] }) {
  const [items, setItems] = useState(initial);

  return (
    <>
      <div className="flex justify-end mb-6">
        <DevDictionaryForm />
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-hairline rounded-[16px] py-20 px-8 text-center">
          <p className="text-[17px] text-ink-subtle leading-[1.55]">
            아직 등록한 용어가 없어요.
          </p>
          <p className="text-[14px] text-ink-tertiary mt-2">
            "새 용어 추가" 버튼으로 첫 항목을 만들어 보세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
