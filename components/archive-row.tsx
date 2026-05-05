"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  ArchiveRestore,
  Trash2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { duration, ease } from "@/lib/motion";
import type { InboxCardData, CategoryOption } from "./inbox-card";

function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function ArchiveRow({
  data,
  index,
  categories,
  onRemove,
  onCategoryChange,
}: {
  data: InboxCardData;
  index: number;
  categories: CategoryOption[];
  onRemove?: (id: string) => void;
  onCategoryChange?: (id: string, next: CategoryOption) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState(data.category);
  const router = useRouter();

  const host = hostFromUrl(data.url);

  const handleUnarchive = () => {
    startTransition(async () => {
      const res = await fetch(`/api/references/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "UNREAD" }),
      });
      if (res.ok) {
        toast.success("Vibe Fresh로 복귀했어요");
        onRemove?.(data.id);
        router.refresh();
      } else {
        toast.error("복귀 실패");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await fetch(`/api/references/${data.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("삭제했어요");
        onRemove?.(data.id);
        router.refresh();
      } else {
        toast.error("삭제 실패");
      }
    });
  };

  const handleCategoryChange = (next: CategoryOption) => {
    if (next.id === category?.id) return;
    const previous = category;
    setCategory({ id: next.id, slug: next.slug, label: next.label }); // optimistic
    onCategoryChange?.(data.id, next);
    startTransition(async () => {
      const res = await fetch(`/api/references/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: next.id }),
      });
      if (res.ok) {
        toast.success(`${next.label}로 이동됨`);
        router.refresh();
      } else {
        setCategory(previous);
        toast.error("이동 실패");
      }
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        x: 24,
        transition: { duration: duration.medium, ease: ease.out },
      }}
      transition={{ delay: Math.min(index, 12) * 0.02, duration: duration.base, ease: ease.out }}
      className={`group relative flex items-center gap-4 px-3 py-3 border-b border-hairline last:border-b-0 hover:bg-surface-2/60 transition-colors duration-150 ${
        isPending ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Thumbnail */}
      <a
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 size-[60px] rounded-md overflow-hidden border border-hairline bg-canvas relative"
      >
        {data.ogImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.ogImage}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[9px] tracking-[0.4px] text-ink-tertiary">
              NO IMG
            </span>
          </div>
        )}
      </a>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <h4 className="text-[14px] font-medium tracking-[-0.05px] text-ink leading-[1.35] truncate">
            {data.title ?? data.url}
          </h4>
          <p className="text-[12px] text-ink-subtle leading-[1.4] truncate mt-0.5">
            {data.aiSummary ?? host}
          </p>
        </a>
        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1.5">
            {data.tags.slice(0, 5).map(({ tag }) => (
              <span
                key={tag.name}
                className="text-[11px] text-ink-tertiary tracking-[0]"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Host */}
      <span className="hidden md:inline-block shrink-0 text-[11px] text-ink-tertiary truncate max-w-[140px]">
        {host}
      </span>

      {/* Menu */}
      <div className="shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="카드 메뉴"
            className="size-7 rounded-md flex items-center justify-center text-ink-tertiary hover:text-ink hover:bg-surface-3 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-focus/50"
          >
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-surface-2 border-hairline-strong text-ink min-w-[180px]"
          >
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-ink hover:bg-surface-3 focus:bg-surface-3">
                카테고리 변경
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-surface-2 border-hairline-strong text-ink max-h-[280px] overflow-y-auto">
                {categories.map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onClick={() => handleCategoryChange(c)}
                    className="hover:bg-surface-3 focus:bg-surface-3 cursor-pointer"
                  >
                    {category?.id === c.id && <Check className="w-3 h-3 mr-2" />}
                    {category?.id !== c.id && <span className="w-3 mr-2 inline-block" />}
                    {c.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator className="bg-hairline" />
            <DropdownMenuItem
              onClick={handleUnarchive}
              className="text-ink hover:bg-surface-3 focus:bg-surface-3 cursor-pointer"
            >
              <ArchiveRestore className="w-3.5 h-3.5 mr-2" />
              Vibe Fresh로 복귀
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-ink-muted hover:bg-surface-3 focus:bg-surface-3 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
