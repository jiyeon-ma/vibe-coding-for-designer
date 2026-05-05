"use client";

import { useState, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DevDictionaryItem } from "./dev-dictionary-card";

type Mode = "create" | "edit";

export function DevDictionaryForm({
  mode = "create",
  initial,
  open,
  onOpenChange,
}: {
  mode?: Mode;
  initial?: DevDictionaryItem;
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = (next: boolean) => {
    if (isControlled) onOpenChange?.(next);
    else setInternalOpen(next);
  };

  const [keyword, setKeyword] = useState(initial?.keyword ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [example, setExample] = useState(initial?.example ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!keyword.trim() || !description.trim()) return;

    startTransition(async () => {
      const url = mode === "edit" ? `/api/dev-dictionary/${initial!.id}` : "/api/dev-dictionary";
      const method = mode === "edit" ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: keyword.trim(),
          description: description.trim(),
          example: example.trim() || null,
        }),
      });

      if (res.ok) {
        toast.success(mode === "edit" ? "수정했어요" : "등록했어요");
        if (mode === "create") {
          setKeyword("");
          setDescription("");
          setExample("");
        }
        setDialogOpen(false);
        router.refresh();
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(data.error ?? "저장 실패");
      }
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {mode === "create" && !isControlled && (
        <DialogTrigger className="inline-flex items-center h-9 px-3 rounded-md text-[14px] font-medium bg-surface-1 border border-hairline text-ink hover:bg-surface-2 hover:border-hairline-strong transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-focus/50">
          <Plus className="w-4 h-4 mr-1" />
          새 용어 추가
        </DialogTrigger>
      )}
      <DialogContent className="bg-surface-2 border-hairline-strong text-ink sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-ink text-[18px] tracking-[-0.2px]">
            {mode === "edit" ? "용어 수정" : "새 용어 추가"}
          </DialogTitle>
          <DialogDescription className="text-ink-subtle text-[13px]">
            바이브 코딩에서 자주 마주치는 용어와 그 설명·예시를 보관합니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="keyword" className="text-ink-muted text-[13px]">
              키워드
            </Label>
            <Input
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="예: rebase, tool use, prompt caching"
              maxLength={80}
              className="bg-surface-1 border-hairline text-ink placeholder:text-ink-tertiary focus-visible:ring-brand-focus/50 focus-visible:ring-2"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-ink-muted text-[13px]">
              한 줄 설명
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이 용어가 무엇인지 짧게 설명해주세요."
              rows={2}
              maxLength={300}
              className="bg-surface-1 border-hairline text-ink placeholder:text-ink-tertiary focus-visible:ring-brand-focus/50 focus-visible:ring-2"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="example" className="text-ink-muted text-[13px]">
              예시 코드 / 명령어 (선택)
            </Label>
            <Textarea
              id="example"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="git rebase -i HEAD~3"
              rows={4}
              className="bg-surface-1 border-hairline text-ink placeholder:text-ink-tertiary font-mono text-[13px] focus-visible:ring-brand-focus/50 focus-visible:ring-2"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              className="text-ink-subtle hover:text-ink hover:bg-surface-3"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isPending || !keyword.trim() || !description.trim()}
              className="bg-brand text-white hover:bg-brand-hover transition-colors duration-150"
            >
              {isPending ? "저장 중..." : mode === "edit" ? "수정" : "등록"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
