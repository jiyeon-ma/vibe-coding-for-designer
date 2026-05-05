"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Copy, Check, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { duration, ease } from "@/lib/motion";
import { DevDictionaryForm } from "./dev-dictionary-form";

export type DevDictionaryItem = {
  id: string;
  keyword: string;
  description: string;
  example: string | null;
};

export function DevDictionaryCard({
  data,
  index,
  onRemove,
}: {
  data: DevDictionaryItem;
  index: number;
  onRemove?: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  const handleCopy = async () => {
    if (!data.example) return;
    try {
      await navigator.clipboard.writeText(data.example);
      setCopied(true);
      toast.success("복사됨");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error("복사 실패");
    }
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await fetch(`/api/dev-dictionary/${data.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("삭제했어요");
        onRemove?.(data.id);
        router.refresh();
      } else {
        toast.error("삭제 실패");
      }
    });
  };

  return (
    <>
      <motion.article
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
        className={`group relative bg-surface-1 border border-hairline rounded-[12px] p-7 hover:bg-surface-2 hover:border-hairline-strong transition-colors duration-200 ${
          isPending ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {/* Top-right menu */}
        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="카드 메뉴"
              className="size-8 rounded-md flex items-center justify-center bg-surface-2/80 backdrop-blur-sm border border-hairline text-ink-muted hover:text-ink hover:bg-surface-3 transition-colors duration-150"
            >
              <MoreHorizontal className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-surface-2 border-hairline-strong text-ink min-w-[140px]"
            >
              <DropdownMenuItem
                onClick={() => setEditing(true)}
                className="text-ink hover:bg-surface-3 focus:bg-surface-3 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 mr-2" />
                수정
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

        {/* Keyword */}
        <h3 className="text-[24px] font-semibold tracking-[-0.4px] text-ink mb-2.5 pr-10 leading-[1.25]">
          {data.keyword}
        </h3>

        {/* Description */}
        <p className="text-[15px] text-ink-muted leading-[1.6] mb-5">
          {data.description}
        </p>

        {/* Example (mono code block) */}
        {data.example && (
          <div className="relative">
            <pre className="bg-canvas border border-hairline rounded-lg p-4 pr-12 font-mono text-[13px] text-ink-muted leading-[1.6] overflow-x-auto whitespace-pre-wrap break-words">
              {data.example}
            </pre>
            <button
              type="button"
              aria-label="예시 복사"
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 size-8 rounded-md flex items-center justify-center bg-surface-2 border border-hairline text-ink-subtle hover:text-ink hover:bg-surface-3 transition-colors duration-150 opacity-0 group-hover:opacity-100"
            >
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}
      </motion.article>

      {editing && (
        <DevDictionaryForm
          mode="edit"
          initial={data}
          open={editing}
          onOpenChange={setEditing}
        />
      )}
    </>
  );
}
