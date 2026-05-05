"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { duration, ease } from "@/lib/motion";
import type { Category } from "@/lib/generated/prisma/enums";

export type InboxCardData = {
  id: string;
  url: string;
  title: string | null;
  ogImage: string | null;
  ogDescription: string | null;
  aiSummary: string | null;
  aiCategory: Category;
  tags: { tag: { name: string } }[];
};

const categoryLabel: Record<Category, string> = {
  VISUAL: "Visual",
  DEV: "Dev",
  REFERENCE: "Reference",
  UNCLASSIFIED: "분류 중",
};

const categoryTextColor: Record<Category, string> = {
  VISUAL: "text-ink",
  DEV: "text-ink-muted",
  REFERENCE: "text-ink-subtle",
  UNCLASSIFIED: "text-ink-tertiary",
};

function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function InboxCard({ data, index }: { data: InboxCardData; index: number }) {
  const isClassifying = !data.aiSummary;
  const host = hostFromUrl(data.url);

  return (
    <motion.a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: duration.base, ease: ease.out }}
      whileHover={{ y: -2 }}
      className="group relative block overflow-hidden bg-surface-1 border border-hairline rounded-[12px] hover:bg-surface-2 hover:border-hairline-strong transition-colors duration-200"
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

      <div className="p-5">
        {/* Meta row: category + host */}
        <div className="flex items-center gap-2 mb-2.5">
          <Badge
            variant="secondary"
            className={`bg-surface-2 ${categoryTextColor[data.aiCategory]} border-0 rounded-full text-[11px] tracking-[0.4px] font-medium px-2 py-0.5`}
          >
            {categoryLabel[data.aiCategory]}
          </Badge>
          <span className="text-[12px] text-ink-tertiary truncate flex items-center gap-1">
            <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
            {host}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[16px] font-medium tracking-[-0.05px] text-ink leading-[1.35] mb-2 line-clamp-2">
          {data.title ?? data.url}
        </h3>

        {/* Summary or skeleton */}
        {isClassifying ? (
          <div className="space-y-1.5">
            <div className="h-[12px] bg-surface-2 rounded animate-pulse w-full" />
            <div className="h-[12px] bg-surface-2 rounded animate-pulse w-2/3" />
          </div>
        ) : (
          <p className="text-[14px] text-ink-subtle leading-[1.5] line-clamp-2">
            {data.aiSummary}
          </p>
        )}

        {/* Tags */}
        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
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
    </motion.a>
  );
}
