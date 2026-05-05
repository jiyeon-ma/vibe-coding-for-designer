"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  MoreHorizontal,
  Archive,
  ArchiveRestore,
  Trash2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import type { Status } from "@/lib/generated/prisma/enums";

export type CategoryOption = {
  id: string;
  slug: string;
  label: string;
  isSystem: boolean;
};

export type InboxCardData = {
  id: string;
  url: string;
  title: string | null;
  ogImage: string | null;
  ogDescription: string | null;
  aiSummary: string | null;
  category: { id: string; slug: string; label: string } | null;
  status: Status;
  tags: { tag: { name: string } }[];
};

/** 시스템 4개 slug에 한해 카드 라벨 색상을 4단계 회색으로 차등. 그 외 사용자 카테고리는 ink-muted. */
function categoryTextColor(slug: string | undefined | null): string {
  switch (slug) {
    case "visual":
      return "text-ink";
    case "dev":
      return "text-ink-muted";
    case "reference":
      return "text-ink-subtle";
    case "unclassified":
      return "text-ink-tertiary";
    default:
      return "text-ink-muted";
  }
}

const SYSTEM_DESTINATION: Record<string, string> = {
  visual: "Visual Dictionary",
  dev: "Dev Dictionary",
  reference: "Reference Hub",
  unclassified: "Reference Hub",
};

function archiveDestinationLabel(slug: string | undefined | null): string {
  if (slug && SYSTEM_DESTINATION[slug]) return SYSTEM_DESTINATION[slug];
  return "Vibe Archived";
}

function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function InboxCard({
  data,
  index,
  categories,
  onRemove,
}: {
  data: InboxCardData;
  index: number;
  categories: CategoryOption[];
  onRemove?: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState(data.category);
  const router = useRouter();
  const isClassifying = !data.aiSummary;
  const host = hostFromUrl(data.url);

  const currentLabel = category?.label ?? "분류 중";
  const currentSlug = category?.slug;

  const handleArchive = () => {
    startTransition(async () => {
      const res = await fetch(`/api/references/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });
      if (res.ok) {
        toast.success(`${archiveDestinationLabel(currentSlug)}에 보관했어요`);
        onRemove?.(data.id);
        router.refresh();
      } else {
        toast.error("보관 실패");
      }
    });
  };

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
    startTransition(async () => {
      const res = await fetch(`/api/references/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: next.id }),
      });
      if (res.ok) {
        toast.success(`${next.label}로 변경됨`);
        router.refresh();
      } else {
        setCategory(previous); // rollback
        toast.error("변경 실패");
      }
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        scale: 0.96,
        transition: { duration: duration.medium, ease: ease.out },
      }}
      transition={{ delay: index * 0.04, duration: duration.base, ease: ease.out }}
      whileHover={{ y: -2 }}
      className={`group relative overflow-hidden bg-surface-1 border border-hairline rounded-[12px] hover:bg-surface-2 hover:border-hairline-strong transition-colors duration-200 ${
        isPending ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Top-right menu */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="카드 메뉴"
            onClick={(e) => e.stopPropagation()}
            className="size-7 rounded-md flex items-center justify-center bg-surface-2/80 backdrop-blur-sm border border-hairline text-ink-muted hover:text-ink hover:bg-surface-3 transition-colors duration-150"
          >
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-surface-2 border-hairline-strong text-ink min-w-[180px]"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-ink hover:bg-surface-3 focus:bg-surface-3">
                카테고리 변경
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-surface-2 border-hairline-strong text-ink">
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
            {data.status === "UNREAD" ? (
              <DropdownMenuItem
                onClick={handleArchive}
                className="text-ink hover:bg-surface-3 focus:bg-surface-3 cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5 mr-2" />
                보관
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={handleUnarchive}
                className="text-ink hover:bg-surface-3 focus:bg-surface-3 cursor-pointer"
              >
                <ArchiveRestore className="w-3.5 h-3.5 mr-2" />
                Vibe Fresh로 복귀
              </DropdownMenuItem>
            )}
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

      <a
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {/* OG image */}
        {data.ogImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.ogImage}
            alt=""
            className="w-full aspect-[16/9] object-cover bg-canvas"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-[16/9] bg-canvas border-b border-hairline flex items-center justify-center">
            <span className="text-ink-tertiary text-[12px] tracking-[0.4px]">
              NO PREVIEW
            </span>
          </div>
        )}

        <div className="p-6">
          {/* Meta row */}
          <div className="flex items-center gap-2 mb-3">
            <Badge
              variant="secondary"
              className={`bg-surface-2 ${categoryTextColor(currentSlug)} border-0 rounded-full text-[11px] tracking-[0.4px] font-medium px-2.5 py-0.5`}
            >
              {currentLabel}
            </Badge>
            <span className="text-[12px] text-ink-tertiary truncate flex items-center gap-1">
              <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
              {host}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-[18px] font-semibold tracking-[-0.2px] text-ink leading-[1.35] mb-3 line-clamp-2">
            {data.title ?? data.url}
          </h3>

          {/* Summary or skeleton */}
          {isClassifying ? (
            <div className="space-y-2">
              <div className="h-[13px] bg-surface-2 rounded animate-pulse w-full" />
              <div className="h-[13px] bg-surface-2 rounded animate-pulse w-2/3" />
            </div>
          ) : (
            <p className="text-[14px] text-ink-subtle leading-[1.55] line-clamp-2">
              {data.aiSummary}
            </p>
          )}

          {/* Tags */}
          {data.tags.length > 0 && (
            <div className="flex flex-wrap gap-x-2.5 gap-y-1 mt-4">
              {data.tags.map(({ tag }) => (
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
      </a>
    </motion.div>
  );
}
