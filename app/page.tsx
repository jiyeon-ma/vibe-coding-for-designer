import { Suspense } from "react";
import { db } from "@/lib/db";
import { UrlSubmit } from "@/components/url-submit";
import { InboxGrid } from "@/components/inbox-grid";
import { TabNav } from "@/components/tab-nav";
import { FilteredSection } from "@/components/filtered-section";
import { DevDictionaryGrid } from "@/components/dev-dictionary-grid";
import type { InboxCardData, CategoryOption } from "@/components/inbox-card";

export const dynamic = "force-dynamic";

function toCardData(ref: {
  id: string;
  url: string;
  title: string | null;
  ogImage: string | null;
  ogDescription: string | null;
  aiSummary: string | null;
  category: { id: string; slug: string; label: string } | null;
  status: InboxCardData["status"];
  tags: { tag: { name: string } }[];
}): InboxCardData {
  return {
    id: ref.id,
    url: ref.url,
    title: ref.title,
    ogImage: ref.ogImage,
    ogDescription: ref.ogDescription,
    aiSummary: ref.aiSummary,
    category: ref.category
      ? { id: ref.category.id, slug: ref.category.slug, label: ref.category.label }
      : null,
    status: ref.status,
    tags: ref.tags,
  };
}

export default async function Home() {
  const include = {
    category: true,
    tags: { include: { tag: true } },
  };

  const [categoriesRaw, inbox, archivedAll, devDictionary] = await Promise.all([
    db.category.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
    db.reference.findMany({
      where: { status: "UNREAD" },
      orderBy: { createdAt: "desc" },
      take: 60,
      include,
    }),
    db.reference.findMany({
      where: { status: "ARCHIVED" },
      orderBy: { archivedAt: "desc" },
      take: 120,
      include,
    }),
    db.devDictionary.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
  ]);

  const categories: CategoryOption[] = categoriesRaw.map((c) => ({
    id: c.id,
    slug: c.slug,
    label: c.label,
    isSystem: c.isSystem,
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

      <Suspense fallback={null}>
        <TabNav />
      </Suspense>

      <Suspense fallback={null}>
        {/* Vibe Fresh */}
        <FilteredSection id="inbox">
          <Section
            id="inbox"
            title="Vibe Fresh"
            meta={`${inbox.length}개의 미확인 링크`}
          >
            <InboxGrid initial={inbox.map(toCardData)} categories={categories} />
          </Section>
        </FilteredSection>

        {/* Visual Dictionary — 등록한 키워드·프롬프트만 (Step 14~15에서 추가) */}
        <FilteredSection id="visual">
          <Section
            id="visual"
            title="Visual Dictionary"
            meta="감성 키워드 ↔ AI 프롬프트"
          >
            <Placeholder>
              곧 등록 기능이 추가됩니다. 디자인 감성 키워드(예: "유리 모피즘")와
              그에 매칭되는 Midjourney·three.js 프롬프트를 한 번에 보관하고 한 번
              클릭으로 복사할 수 있게 될 예정입니다.
            </Placeholder>
          </Section>
        </FilteredSection>

        {/* Dev Dictionary — 등록한 용어·개념 */}
        <FilteredSection id="dev">
          <Section
            id="dev"
            title="Dev Dictionary"
            meta={`${devDictionary.length}개의 용어`}
          >
            <DevDictionaryGrid
              initial={devDictionary.map((d) => ({
                id: d.id,
                keyword: d.keyword,
                description: d.description,
                example: d.example,
              }))}
            />
          </Section>
        </FilteredSection>

        {/* Vibe Archived — 모든 카테고리의 archived 카드 (R6에서 카테고리 보드로 교체 예정) */}
        <FilteredSection id="reference">
          <Section
            id="reference"
            title="Vibe Archived"
            meta={`${archivedAll.length}개의 보관 자료`}
          >
            <InboxGrid
              initial={archivedAll.map(toCardData)}
              categories={categories}
              showTagFilter
              emptyTitle="보관한 레퍼런스가 없어요."
              emptyHint="Vibe Fresh 카드를 보관하면 여기로 모입니다."
            />
          </Section>
        </FilteredSection>
      </Suspense>
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

function SubSectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-baseline justify-between mt-10 mb-4">
      <h3 className="text-[16px] font-medium tracking-[-0.05px] text-ink">
        {title}
      </h3>
      <span className="text-[12px] text-ink-tertiary">{count}개</span>
    </div>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-dashed border-hairline rounded-[12px] py-10 px-6">
      <p className="text-[14px] text-ink-subtle leading-[1.6] max-w-md">
        {children}
      </p>
    </div>
  );
}
