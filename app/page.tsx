import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <main className="min-h-screen px-8 py-16 max-w-5xl mx-auto">
      {/* Hero */}
      <section className="mb-16">
        <p className="text-[13px] font-medium tracking-[0.4px] text-ink-subtle mb-4">
          DESIGN TOKEN PREVIEW
        </p>
        <h1 className="text-[56px] font-semibold leading-[1.10] tracking-[-1.8px] text-ink mb-3">
          Vibe Archive
        </h1>
        <p className="text-[18px] leading-[1.5] tracking-[-0.1px] text-ink-muted max-w-xl">
          디자이너의 영감과 개발 지식을 AI가 자동 정리해주는{" "}
          <span className="text-brand">제2의 뇌</span>
        </p>
      </section>

      {/* Surface ladder */}
      <section className="mb-16">
        <h2 className="text-[22px] font-medium tracking-[-0.4px] text-ink mb-6">
          Surface ladder
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { name: "canvas", bg: "bg-canvas" },
            { name: "surface-1", bg: "bg-surface-1" },
            { name: "surface-2", bg: "bg-surface-2" },
            { name: "surface-3", bg: "bg-surface-3" },
          ].map((s) => (
            <div
              key={s.name}
              className={`${s.bg} border border-hairline rounded-lg p-6 transition-colors duration-200 hover:border-hairline-strong`}
            >
              <p className="text-[14px] text-ink mb-1">{s.name}</p>
              <p className="text-[12px] font-mono text-ink-subtle">
                hover: hairline-strong
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Cards */}
      <section className="mb-16">
        <h2 className="text-[22px] font-medium tracking-[-0.4px] text-ink mb-6">
          Cards & Categories
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { tag: "VISUAL", color: "text-ink", title: "유리 모피즘" },
            { tag: "DEV", color: "text-ink-muted", title: "git rebase -i" },
            { tag: "REFERENCE", color: "text-ink-subtle", title: "Apple HIG 2026" },
          ].map((c) => (
            <Card
              key={c.tag}
              className="bg-surface-1 border-hairline p-6 transition-all duration-200 hover:bg-surface-2 hover:border-hairline-strong cursor-pointer"
            >
              <Badge
                variant="secondary"
                className="bg-surface-2 text-ink-muted border-0 mb-3 rounded-full text-[12px] px-2 py-0.5"
              >
                {c.tag}
              </Badge>
              <p className={`text-[16px] ${c.color}`}>{c.title}</p>
              <p className="text-[14px] text-ink-subtle mt-2">
                AI가 자동으로 분류한 카드입니다.
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="mb-16">
        <h2 className="text-[22px] font-medium tracking-[-0.4px] text-ink mb-6">
          Input & Buttons
        </h2>
        <div className="flex gap-3 max-w-xl mb-6">
          <Input
            placeholder="https://..."
            className="bg-surface-1 border-hairline text-ink placeholder:text-ink-tertiary focus-visible:ring-brand-focus/50 focus-visible:ring-2"
          />
          <Button className="bg-brand text-white hover:bg-brand-hover transition-colors duration-150">
            보관
          </Button>
        </div>
        <div className="flex gap-3">
          <Button className="bg-brand text-white hover:bg-brand-hover">Primary</Button>
          <Button variant="secondary" className="bg-surface-1 text-ink border border-hairline hover:bg-surface-2">
            Secondary
          </Button>
          <Button variant="ghost" className="text-ink hover:bg-surface-1">
            Ghost
          </Button>
        </div>
      </section>

      {/* Mono */}
      <section>
        <h2 className="text-[22px] font-medium tracking-[-0.4px] text-ink mb-6">
          Code (Geist Mono)
        </h2>
        <div className="bg-surface-1 border border-hairline rounded-lg p-6 font-mono text-[13px] text-ink-muted">
          <span className="text-ink-tertiary">$ </span>
          git rebase -i HEAD~3
        </div>
      </section>
    </main>
  );
}
