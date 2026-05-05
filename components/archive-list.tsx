"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ArchiveRow } from "./archive-row";
import { TagFilter } from "./tag-filter";
import { CategoryManager } from "./category-manager";
import type { InboxCardData, CategoryOption } from "./inbox-card";
import { duration, ease } from "@/lib/motion";

export function ArchiveList({
  initial,
  categories,
}: {
  initial: InboxCardData[];
  categories: CategoryOption[];
}) {
  const [items, setItems] = useState(initial);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((r) =>
      r.tags.forEach(({ tag }) => counts.set(tag.name, (counts.get(tag.name) ?? 0) + 1))
    );
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([n]) => n);
  }, [items]);

  const filtered = activeTag
    ? items.filter((r) => r.tags.some(({ tag }) => tag.name === activeTag))
    : items;

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((r) => r.id !== id));

  const moveItem = (id: string, next: CategoryOption) =>
    setItems((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, category: { id: next.id, slug: next.slug, label: next.label } }
          : r
      )
    );

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div className="flex-1 min-w-0">
          <TagFilter tags={allTags} active={activeTag} onChange={setActiveTag} />
        </div>
        <CategoryManager />
      </div>

      <div className="space-y-12">
        {categories.map((cat) => {
          const colItems = filtered.filter((r) => r.category?.id === cat.id);
          // 미분류(category null) 카드들은 unclassified 컬럼에 합류
          const includesNullForUnclassified = cat.slug === "unclassified";
          const finalItems = includesNullForUnclassified
            ? [...colItems, ...filtered.filter((r) => r.category === null)]
            : colItems;

          return (
            <CategorySection
              key={cat.id}
              category={cat}
              items={finalItems}
              allCategories={categories}
              onRemove={removeItem}
              onCategoryChange={moveItem}
            />
          );
        })}
      </div>
    </>
  );
}

function CategorySection({
  category,
  items,
  allCategories,
  onRemove,
  onCategoryChange,
}: {
  category: CategoryOption;
  items: InboxCardData[];
  allCategories: CategoryOption[];
  onRemove: (id: string) => void;
  onCategoryChange: (id: string, next: CategoryOption) => void;
}) {
  return (
    <section>
      <header className="flex items-center justify-between mb-5 pb-3 border-b border-hairline">
        <div className="flex items-baseline gap-3">
          <h3 className="text-[20px] font-semibold tracking-[-0.3px] text-ink">
            {category.label}
          </h3>
          <span className="text-[13px] text-ink-tertiary tabular-nums">
            {items.length}
          </span>
        </div>
        {!category.isSystem && (
          <DeleteCategoryButton id={category.id} label={category.label} />
        )}
      </header>

      <div className="rounded-[12px] overflow-hidden bg-surface-1/40 border border-hairline">
        {items.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-[13px] text-ink-tertiary">
              이 카테고리에 보관된 자료가 아직 없어요.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {items.map((ref, i) => (
              <ArchiveRow
                key={ref.id}
                index={i}
                data={ref}
                categories={allCategories}
                onRemove={onRemove}
                onCategoryChange={onCategoryChange}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}

function DeleteCategoryButton({ id, label }: { id: string; label: string }) {
  const router = useRouter();
  const handleDelete = async () => {
    if (!confirm(`"${label}" 카테고리를 삭제할까요? 카드들은 Unclassified로 이동합니다.`))
      return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(`"${label}" 삭제됨`);
      router.refresh();
    } else {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(data.error ?? "삭제 실패");
    }
  };

  return (
    <motion.button
      type="button"
      aria-label={`${label} 카테고리 삭제`}
      onClick={handleDelete}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: duration.fast, ease: ease.out }}
      className="size-7 rounded-md flex items-center justify-center text-ink-tertiary hover:text-ink-muted hover:bg-surface-2 transition-colors duration-150"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </motion.button>
  );
}
