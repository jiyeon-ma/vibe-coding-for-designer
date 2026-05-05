"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTabFilter, type SectionId } from "@/lib/use-tab-filter";
import { duration, ease } from "@/lib/motion";

/**
 * 탭 필터에 따라 섹션을 mount/unmount.
 * 부드러운 fade + 살짝 위로 떠오르는 진입 모션.
 */
export function FilteredSection({
  id,
  children,
}: {
  id: SectionId;
  children: React.ReactNode;
}) {
  const { isVisible } = useTabFilter();
  const visible = isVisible(id);

  return (
    <AnimatePresence initial={false} mode="popLayout">
      {visible && (
        <motion.div
          key={id}
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8, transition: { duration: duration.fast, ease: ease.out } }}
          transition={{ duration: duration.base, ease: ease.out }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
