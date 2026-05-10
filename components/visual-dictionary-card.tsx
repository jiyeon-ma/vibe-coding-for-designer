"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { duration, ease } from "@/lib/motion";

export type VisualPrompt = {
  tool: string;
  body: string;
};

export type VisualDictionaryItem = {
  id: string;
  keyword: string;
  vibeDescription: string;
  heroStyle: React.CSSProperties;
  heroOverlay?: React.ReactNode;
  prompts: VisualPrompt[];
};

export function VisualDictionaryCard({
  data,
  index,
}: {
  data: VisualDictionaryItem;
  index: number;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: duration.base, ease: ease.out }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden bg-surface-1 border border-hairline rounded-[20px] shadow-lift hover:bg-surface-2 hover:border-hairline-strong hover:shadow-lift-hover transition-[colors,box-shadow] duration-200"
    >
      {/* Hero — vibe를 시각화한 그래픽 */}
      <div
        className="aspect-[16/9] relative overflow-hidden border-b border-hairline"
        style={data.heroStyle}
      >
        {data.heroOverlay}
      </div>

      <div className="p-7">
        <h3 className="text-[24px] font-semibold tracking-[-0.5px] text-ink leading-[1.15] mb-2">
          {data.keyword}
        </h3>
        <p className="text-[14px] text-ink-muted leading-[1.6] mb-6">
          {data.vibeDescription}
        </p>

        <div className="space-y-3">
          {data.prompts.map((p, i) => (
            <PromptRow key={i} tool={p.tool} body={p.body} />
          ))}
        </div>
      </div>
    </motion.article>
  );
}

function PromptRow({ tool, body }: { tool: string; body: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      toast.success(`${tool} 프롬프트 복사됨`);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error("복사 실패");
    }
  };

  return (
    <div className="bg-canvas border border-hairline rounded-[14px] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-hairline">
        <span className="text-[11px] font-medium tracking-[0.4px] uppercase text-ink-subtle">
          {tool}
        </span>
        <button
          type="button"
          aria-label={`${tool} 프롬프트 복사`}
          onClick={handleCopy}
          className="size-7 rounded-md flex items-center justify-center text-ink-tertiary hover:text-ink hover:bg-surface-2 transition-colors duration-150"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-success" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
      <pre className="px-4 py-3 font-mono text-[12.5px] text-ink-muted leading-[1.6] overflow-x-auto whitespace-pre-wrap break-words">
        {body}
      </pre>
    </div>
  );
}
