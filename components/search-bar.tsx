"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, BookOpen, Image as ImageIcon, FileText } from "lucide-react";
import { useTabFilter } from "@/lib/use-tab-filter";
import { duration, ease } from "@/lib/motion";
import type { SearchResult } from "@/app/api/search/route";

const COLLAPSED_WIDTH = 48;
const EXPANDED_WIDTH = 420;

const SOURCE_LABELS: Record<SearchResult["source"], string> = {
  reference: "Reference",
  dev: "Dev Dictionary",
  visual: "Visual Dictionary",
};

const SOURCE_ICONS: Record<SearchResult["source"], React.ComponentType<{ className?: string }>> = {
  reference: FileText,
  dev: BookOpen,
  visual: ImageIcon,
};

export function SearchBar() {
  const [expanded, setExpanded] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setTop, setSub } = useTabFilter();

  /* Debounced fetch */
  useEffect(() => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as { results: SearchResult[] };
        setResults(data.results);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  /* Collapse on outside click */
  useEffect(() => {
    if (!expanded) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        collapse();
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  /* ESC */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && expanded) {
        collapse();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const expand = () => {
    setExpanded(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const collapse = () => {
    setExpanded(false);
    setQ("");
    inputRef.current?.blur();
  };

  const handlePick = (r: SearchResult) => {
    setTop(r.navHint.top);
    setSub(r.navHint.sub);
    collapse();
    requestAnimationFrame(() => {
      document.getElementById(sectionIdFor(r))?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const showDropdown = expanded && q.trim().length > 0;

  return (
    <div ref={containerRef} className="relative">
      <motion.div
        initial={false}
        animate={{ width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
        transition={{ duration: duration.medium, ease: ease.out }}
        className="h-12 rounded-full bg-glass-2 backdrop-blur-2xl border border-hairline shadow-lift overflow-hidden ml-auto"
      >
        <div className="flex items-center h-full">
          <button
            type="button"
            aria-label={expanded ? "검색" : "검색 열기"}
            onClick={() => !expanded && expand()}
            className="size-12 shrink-0 flex items-center justify-center text-ink-muted hover:text-ink transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-focus/50 rounded-full"
          >
            <Search className="w-4 h-4" />
          </button>
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="요약·태그·용어 검색"
            tabIndex={expanded ? 0 : -1}
            className="flex-1 bg-transparent border-0 outline-none text-ink placeholder:text-ink-tertiary text-[15px] tracking-[-0.05px] pr-2 min-w-0"
          />
          {loading && <Loader2 className="w-4 h-4 text-ink-tertiary animate-spin shrink-0 mr-3" />}
          <button
            type="button"
            aria-label="검색 닫기"
            onClick={collapse}
            tabIndex={expanded ? 0 : -1}
            className="size-9 mr-1.5 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink hover:bg-surface-3 transition-colors duration-150 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-brand-focus/50"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: duration.fast, ease: ease.out }}
            style={{ width: EXPANDED_WIDTH }}
            className="absolute top-[calc(100%+8px)] right-0 rounded-[20px] bg-glass-2 backdrop-blur-2xl border border-hairline shadow-lift overflow-hidden z-50"
          >
            {results.length === 0 ? (
              <div className="px-5 py-7 text-center text-[13px] text-ink-tertiary">
                {loading ? "검색 중..." : "결과가 없어요"}
              </div>
            ) : (
              <ul className="max-h-[420px] overflow-y-auto py-1.5">
                {results.map((r) => {
                  const Icon = SOURCE_ICONS[r.source];
                  return (
                    <li key={`${r.source}-${r.id}`}>
                      <button
                        type="button"
                        onClick={() => handlePick(r)}
                        className="w-full flex items-start gap-3 px-5 py-3 text-left hover:bg-surface-3/60 transition-colors duration-150"
                      >
                        <Icon className="w-4 h-4 mt-0.5 shrink-0 text-ink-tertiary" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="text-[14px] font-medium text-ink truncate">
                              {r.title}
                            </span>
                            <span className="text-[11px] tracking-[0.3px] text-ink-tertiary shrink-0 uppercase">
                              {SOURCE_LABELS[r.source]}
                            </span>
                          </div>
                          <p className="text-[12.5px] text-ink-subtle leading-[1.5] line-clamp-2">
                            {r.snippet}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function sectionIdFor(r: SearchResult): string {
  if (r.source === "visual") return "visual";
  if (r.source === "dev") return "dev";
  return r.navHint.sub === "archived" ? "reference" : "inbox";
}
