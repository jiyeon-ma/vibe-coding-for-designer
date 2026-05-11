import { Suspense } from "react";
import { db } from "@/lib/db";
import { UrlSubmit } from "@/components/url-submit";
import { InboxGrid } from "@/components/inbox-grid";
import { TabNav } from "@/components/tab-nav";
import { FilteredSection } from "@/components/filtered-section";
import { DevDictionaryGrid } from "@/components/dev-dictionary-grid";
import { ArchiveList } from "@/components/archive-list";
import { VisualDictionaryCard } from "@/components/visual-dictionary-card";
import { SearchBar } from "@/components/search-bar";
import { CategoryOverview } from "@/components/category-overview";
import { MOCK_VISUAL_DICTIONARY } from "@/lib/mock-visual-dictionary";
import { TabFilterProvider } from "@/lib/use-tab-filter";
import {
  parseTop,
  parseSub,
  type TopTab,
  type SubTab,
} from "@/lib/tab-filter-shared";
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

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const tabParam = typeof sp.tab === "string" ? sp.tab : null;
  const subParam = typeof sp.sub === "string" ? sp.sub : null;
  const initialTop: TopTab = parseTop(tabParam);
  const initialSub: SubTab | null = parseSub(subParam, initialTop);

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
    <TabFilterProvider initialTop={initialTop} initialSub={initialSub}>
      <main className="min-h-screen px-6 md:px-12 max-w-7xl mx-auto">
      {/* Hero */}
      <section className="pt-20 md:pt-36 pb-16 md:pb-24 text-center">
        <p className="text-[12px] font-medium tracking-[0.6px] text-ink-subtle mb-6 uppercase">
          Vibe Archive
        </p>
        <h1 className="text-[56px] md:text-[88px] font-semibold leading-[1.02] tracking-[-2.2px] md:tracking-[-3.6px] text-ink mb-6">
          Capture the vibe.
        </h1>
        <p className="text-[18px] md:text-[20px] leading-[1.55] tracking-[-0.1px] text-ink-muted max-w-xl mx-auto mb-14">
          링크를 던지면 AI가 요약·분류·태깅해서 보관해줍니다.
        </p>
        <div className="max-w-2xl mx-auto">
          <UrlSubmit />
        </div>
      </section>

      <Suspense fallback={null}>
        <div className="fixed top-6 right-6 md:top-8 md:right-8 z-50">
          <SearchBar />
        </div>
      </Suspense>

      <Suspense fallback={null}>
        <TabNav />
      </Suspense>

      <Suspense fallback={null}>
        <CategoryOverview
          visualCount={MOCK_VISUAL_DICTIONARY.length}
          devCount={devDictionary.length}
          freshCount={inbox.length}
          archivedCount={archivedAll.length}
        />
      </Suspense>

      <Suspense fallback={null}>
        {/* New */}
        <FilteredSection id="inbox">
          <Section
            id="inbox"
            title="New"
            meta={`${inbox.length}개의 미확인 링크`}
          >
            <InboxGrid initial={inbox.map(toCardData)} categories={categories} />
          </Section>
        </FilteredSection>

        {/* Visual Dictionary — 감성 키워드 ↔ 도구별 AI 프롬프트 (현재 가상 데이터) */}
        <FilteredSection id="visual">
          <Section
            id="visual"
            title="Visual Dictionary"
            meta={`${MOCK_VISUAL_DICTIONARY.length}개의 vibe`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_VISUAL_DICTIONARY.map((item, i) => (
                <VisualDictionaryCard key={item.id} data={item} index={i} />
              ))}
            </div>
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

        {/* Vibe Archived — 카테고리 컬럼 + D&D + 태그 필터 */}
        <FilteredSection id="reference">
          <Section
            id="reference"
            title="Vibe Archived"
            meta={`${archivedAll.length}개의 보관 자료`}
          >
            {archivedAll.length === 0 ? (
              <div className="border border-hairline rounded-[22px] py-28 px-10 text-center bg-glass-1 backdrop-blur-xl">
                <p className="text-[20px] text-ink leading-[1.4] tracking-[-0.2px] font-medium">
                  보관한 레퍼런스가 없어요.
                </p>
                <p className="text-[15px] text-ink-tertiary mt-3 leading-[1.5]">
                  New 탭의 카드를 보관하면 여기로 모입니다.
                </p>
              </div>
            ) : (
              <ArchiveList
                initial={archivedAll.map(toCardData)}
                categories={categories}
              />
            )}
          </Section>
        </FilteredSection>
      </Suspense>
      </main>
    </TabFilterProvider>
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
    <section id={id} className="scroll-mt-[120px] py-24 md:py-32">
      <div className="flex items-end justify-between mb-12 md:mb-14 gap-6">
        <h2 className="text-[40px] md:text-[56px] font-semibold tracking-[-1.4px] md:tracking-[-2.0px] text-ink leading-[1.05]">
          {title}
        </h2>
        <span className="text-[13px] text-ink-subtle shrink-0 pb-2">{meta}</span>
      </div>
      {children}
    </section>
  );
}
