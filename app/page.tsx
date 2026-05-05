import { db } from "@/lib/db";
import { UrlSubmit } from "@/components/url-submit";
import { InboxGrid } from "@/components/inbox-grid";
import { TabNav } from "@/components/tab-nav";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [inbox, archivedReferences] = await Promise.all([
    db.reference.findMany({
      where: { status: "UNREAD" },
      orderBy: { createdAt: "desc" },
      take: 60,
      include: { tags: { include: { tag: true } } },
    }),
    db.reference.findMany({
      where: { status: "ARCHIVED", aiCategory: "REFERENCE" },
      orderBy: { archivedAt: "desc" },
      take: 60,
      include: { tags: { include: { tag: true } } },
    }),
  ]);

  const inboxData = inbox.map((ref) => ({
    id: ref.id,
    url: ref.url,
    title: ref.title,
    ogImage: ref.ogImage,
    ogDescription: ref.ogDescription,
    aiSummary: ref.aiSummary,
    aiCategory: ref.aiCategory,
    tags: ref.tags,
  }));

  const referenceData = archivedReferences.map((ref) => ({
    id: ref.id,
    url: ref.url,
    title: ref.title,
    ogImage: ref.ogImage,
    ogDescription: ref.ogDescription,
    aiSummary: ref.aiSummary,
    aiCategory: ref.aiCategory,
    tags: ref.tags,
  }));

  return (
    <main className="min-h-screen px-6 md:px-10 max-w-6xl mx-auto">
      {/* Hero */}
      <section className="pt-12 md:pt-20 pb-10 md:pb-12">
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

      {/* Sticky tabs */}
      <TabNav />

      {/* Inbox */}
      <Section
        id="inbox"
        title="Smart Inbox"
        meta={`${inbox.length}개의 미확인 링크`}
      >
        <InboxGrid initial={inboxData} />
      </Section>

      {/* Visual Dictionary placeholder (Step 14-15) */}
      <Section
        id="visual"
        title="Visual Dictionary"
        meta="감성 키워드 ↔ AI 프롬프트"
      >
        <Placeholder>
          곧 등록 기능이 추가됩니다. 키워드와 Midjourney·three.js 프롬프트를 한
          번에 보관하고 한 번 클릭으로 복사하세요.
        </Placeholder>
      </Section>

      {/* Dev Terminal placeholder (Step 16-17) */}
      <Section
        id="dev"
        title="Dev Terminal"
        meta="Git · Claude Code · Shell 명령어"
      >
        <Placeholder>
          곧 등록 기능이 추가됩니다. 디자이너에게 필요한 명령어를 카드로 모아
          한 번 클릭으로 복사하세요.
        </Placeholder>
      </Section>

      {/* Reference Hub: archived REFERENCE */}
      <Section
        id="reference"
        title="Reference Hub"
        meta={`${archivedReferences.length}개의 보관 자료`}
      >
        <InboxGrid initial={referenceData} />
      </Section>
    </main>
  );
}

function Section({
  id,
  title,
  meta,
  children,
}: {
  id: string;
  title: string;
  meta: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[88px] py-12 md:py-16">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-[22px] font-medium tracking-[-0.4px] text-ink">
          {title}
        </h2>
        <span className="text-[13px] text-ink-subtle">{meta}</span>
      </div>
      {children}
    </section>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-dashed border-hairline rounded-[12px] py-16 px-6">
      <p className="text-[14px] text-ink-subtle leading-[1.6] max-w-md">
        {children}
      </p>
    </div>
  );
}
