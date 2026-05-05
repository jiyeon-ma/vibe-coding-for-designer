"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { InboxCard, type InboxCardData, type CategoryOption } from "./inbox-card";
import { TagFilter } from "./tag-filter";
import { CategoryManager } from "./category-manager";
import { duration, ease } from "@/lib/motion";

export function CategoryBoard({
  initial,
  categories,
}: {
  initial: InboxCardData[];
  categories: CategoryOption[];
}) {
  const [items, setItems] = useState(initial);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((r) =>
      r.tags.forEach(({ tag }) => counts.set(tag.name, (counts.get(tag.name) ?? 0) + 1))
    );
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([n]) => n);
  }, [items]);

  const filteredItems = activeTag
    ? items.filter((r) => r.tags.some(({ tag }) => tag.name === activeTag))
    : items;

  const draggingCard = draggingId ? items.find((r) => r.id === draggingId) ?? null : null;

  const handleDragStart = (e: DragStartEvent) => {
    setDraggingId(String(e.active.id));
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    setDraggingId(null);
    const { active, over } = e;
    if (!over) return;
    const refId = String(active.id);
    const targetCategoryId = String(over.id);

    const ref = items.find((r) => r.id === refId);
    if (!ref) return;
    if (ref.category?.id === targetCategoryId) return;

    const target = categories.find((c) => c.id === targetCategoryId);
    if (!target) return;

    // Optimistic
    const previous = items;
    setItems((prev) =>
      prev.map((r) =>
        r.id === refId
          ? { ...r, category: { id: target.id, slug: target.slug, label: target.label } }
          : r
      )
    );

    try {
      const res = await fetch(`/api/references/${refId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: target.id }),
      });
      if (!res.ok) throw new Error("PATCH failed");
      toast.success(`${target.label}로 이동됨`);
      router.refresh();
    } catch {
      setItems(previous); // rollback
      toast.error("이동 실패");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-0">
          <TagFilter tags={allTags} active={activeTag} onChange={setActiveTag} />
        </div>
        <CategoryManager />
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const colItems = filteredItems.filter((r) => r.category?.id === cat.id);
            return (
              <CategoryColumn
                key={cat.id}
                category={cat}
                items={colItems}
                allCategories={categories}
                onCategoryDeleted={(deletedId) => {
                  // 카테고리 삭제 후 카드들이 unclassified로 이동했으니 부모 데이터 동기화 필요
                  // 가장 간단: page refresh로 처리. 단 router.refresh()는 server data 다시 가져옴
                  router.refresh();
                  void deletedId;
                }}
              />
            );
          })}
        </div>

        <DragOverlay
          dropAnimation={{
            duration: 180,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {draggingCard && (
            <div className="rotate-1 cursor-grabbing">
              <InboxCard
                data={draggingCard}
                index={0}
                categories={categories}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </>
  );
}

function CategoryColumn({
  category,
  items,
  allCategories,
  onCategoryDeleted,
}: {
  category: CategoryOption;
  items: InboxCardData[];
  allCategories: CategoryOption[];
  onCategoryDeleted: (id: string) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: category.id });

  return (
    <section
      ref={setNodeRef}
      className={`rounded-[12px] border transition-colors duration-150 ${
        isOver
          ? "border-brand-focus/60 bg-surface-2/40"
          : "border-hairline bg-canvas"
      }`}
    >
      <header className="flex items-center justify-between px-4 py-3 border-b border-hairline">
        <div className="flex items-center gap-2">
          <h3 className="text-[14px] font-medium tracking-[-0.05px] text-ink">
            {category.label}
          </h3>
          <span className="text-[12px] text-ink-tertiary tabular-nums">
            {items.length}
          </span>
        </div>
        {!category.isSystem && (
          <DeleteCategoryButton id={category.id} label={category.label} onDeleted={onCategoryDeleted} />
        )}
      </header>

      <div className="p-3 space-y-3 min-h-[120px]">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.fast, ease: ease.out }}
              className="border border-dashed border-hairline rounded-[10px] py-8 px-4 text-center"
            >
              <p className="text-[12px] text-ink-tertiary">
                여기로 드롭하면 {category.label}로 이동해요
              </p>
            </motion.div>
          ) : (
            items.map((ref, i) => (
              <DraggableCard key={ref.id} data={ref} index={i} categories={allCategories} />
            ))
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function DraggableCard({
  data,
  index,
  categories,
}: {
  data: InboxCardData;
  index: number;
  categories: CategoryOption[];
}) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id: data.id });

  return (
    <div ref={setNodeRef} className="relative">
      {/* Drag handle (왼쪽 가장자리, 카드 자체는 클릭/메뉴 가능) */}
      <button
        type="button"
        aria-label="카드 드래그"
        className="absolute left-1 top-1/2 -translate-y-1/2 z-20 size-6 rounded-md flex items-center justify-center text-ink-tertiary hover:text-ink-muted hover:bg-surface-2 transition-colors duration-150 opacity-0 group-hover:opacity-100 touch-none cursor-grab active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <div
        className={`group ${isDragging ? "opacity-30" : ""} pl-7`}
      >
        <InboxCard data={data} index={index} categories={categories} />
      </div>
    </div>
  );
}

function DeleteCategoryButton({
  id,
  label,
  onDeleted,
}: {
  id: string;
  label: string;
  onDeleted: (id: string) => void;
}) {
  const router = useRouter();
  const handleDelete = async () => {
    if (!confirm(`"${label}" 카테고리를 삭제할까요? 카드들은 Unclassified로 이동합니다.`)) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(`"${label}" 삭제됨`);
      onDeleted(id);
      router.refresh();
    } else {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(data.error ?? "삭제 실패");
    }
  };

  return (
    <button
      type="button"
      aria-label={`${label} 카테고리 삭제`}
      onClick={handleDelete}
      className="size-6 rounded-md flex items-center justify-center text-ink-tertiary hover:text-ink-muted hover:bg-surface-2 transition-colors duration-150"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
