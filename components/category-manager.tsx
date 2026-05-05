"use client";

import { useState, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CategoryManager() {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!label.trim()) return;

    startTransition(async () => {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim() }),
      });
      if (res.ok) {
        toast.success(`"${label.trim()}" 카테고리 생성됨`);
        setLabel("");
        setOpen(false);
        router.refresh();
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(data.error ?? "생성 실패");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center h-8 px-2.5 rounded-md text-[12px] font-medium bg-surface-1 border border-hairline text-ink-muted hover:text-ink hover:bg-surface-2 hover:border-hairline-strong transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-focus/50">
        <Plus className="w-3.5 h-3.5 mr-1" />
        카테고리 추가
      </DialogTrigger>
      <DialogContent className="bg-surface-2 border-hairline-strong text-ink sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-ink text-[18px] tracking-[-0.2px]">
            새 카테고리
          </DialogTitle>
          <DialogDescription className="text-ink-subtle text-[13px]">
            Vibe Archived에 새 컬럼이 추가됩니다. 카드를 드래그해서 옮길 수 있어요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="category-label" className="text-ink-muted text-[13px]">
              카테고리 이름
            </Label>
            <Input
              id="category-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="예: Animation, Branding, Typography"
              maxLength={40}
              autoFocus
              className="bg-surface-1 border-hairline text-ink placeholder:text-ink-tertiary focus-visible:ring-brand-focus/50 focus-visible:ring-2"
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-ink-subtle hover:text-ink hover:bg-surface-3"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isPending || !label.trim()}
              className="bg-brand text-white hover:bg-brand-hover transition-colors duration-150"
            >
              {isPending ? "생성 중..." : "생성"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
