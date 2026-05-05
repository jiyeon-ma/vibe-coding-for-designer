import { db } from "@/lib/db";
import { UrlSubmit } from "@/components/url-submit";
import { InboxGrid } from "@/components/inbox-grid";

export const dynamic = "force-dynamic";

export default async function Home() {
  const references = await db.reference.findMany({
    where: { status: "UNREAD" },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: {
      tags: { include: { tag: true } },
    },
  });

  return (
    <main className="min-h-screen px-6 md:px-10 py-12 md:py-20 max-w-6xl mx-auto">
      {/* Hero */}
      <section className="mb-12 md:mb-16">
        <p className="text-[13px] font-medium tracking-[0.4px] text-ink-subtle mb-4 uppercase">
          Vibe Archive
        </p>
        <h1 className="text-[40px] md:text-[56px] font-semibold leading-[1.10] tracking-[-1.4px] md:tracking-[-1.8px] text-ink mb-3">
          제2의 뇌
        </h1>
        <p className="text-[16px] md:text-[18px] leading-[1.5] tracking-[-0.05px] text-ink-muted max-w-xl mb-8">
          링크를 던지면 AI가 요약·분류·태깅해서 보관해줍니다.
        </p>
        <div className="max-w-2xl">
          <UrlSubmit />
        </div>
      </section>

      {/* Inbox */}
      <section id="inbox">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-[22px] font-medium tracking-[-0.4px] text-ink">
            Smart Inbox
          </h2>
          <span className="text-[13px] text-ink-subtle">
            {references.length}개의 링크
          </span>
        </div>

        <InboxGrid
          initial={references.map((ref) => ({
            id: ref.id,
            url: ref.url,
            title: ref.title,
            ogImage: ref.ogImage,
            ogDescription: ref.ogDescription,
            aiSummary: ref.aiSummary,
            aiCategory: ref.aiCategory,
            tags: ref.tags,
          }))}
        />
      </section>
    </main>
  );
}
