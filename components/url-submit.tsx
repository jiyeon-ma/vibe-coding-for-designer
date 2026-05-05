"use client";

import { useState, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function UrlSubmit() {
  const [url, setUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const res = await fetch("/api/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      if (res.status === 201) {
        toast.success("보관 시작했어요. AI가 분류 중...");
        setUrl("");
        router.refresh();
      } else if (res.status === 409) {
        toast.info("이미 보관된 링크예요");
        setUrl("");
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(data.error ?? "보관에 실패했어요");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2.5 w-full">
      <Input
        type="url"
        inputMode="url"
        autoComplete="off"
        placeholder="https://..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={isPending}
        className="h-11 bg-surface-1 border-hairline text-ink placeholder:text-ink-tertiary text-[15px] tracking-[-0.05px] focus-visible:ring-brand-focus/50 focus-visible:ring-2 focus-visible:border-hairline-strong transition-colors duration-150"
      />
      <Button
        type="submit"
        disabled={isPending || !url.trim()}
        className="h-11 px-5 bg-brand text-white hover:bg-brand-hover transition-colors duration-150 font-medium text-[14px] tracking-[0]"
      >
        {isPending ? "보관 중..." : "보관"}
      </Button>
    </form>
  );
}
