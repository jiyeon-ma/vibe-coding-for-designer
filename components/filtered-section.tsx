"use client";

import { useTabFilter, type SectionId } from "@/lib/use-tab-filter";

/**
 * 탭 필터에 따라 섹션을 mount/unmount.
 * SSR/CSR hydration 안정성을 위해 framer-motion 사용 안 함.
 */
export function FilteredSection({
  id,
  children,
}: {
  id: SectionId;
  children: React.ReactNode;
}) {
  const { isVisible } = useTabFilter();
  if (!isVisible(id)) return null;
  return <>{children}</>;
}
