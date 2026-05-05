# Vibe Archive — 개발 플랜

> 디자이너의 영감과 개발 지식을 AI가 자동 정리해주는 **제2의 뇌**.
> 이 문서는 사람이 읽기도 쉽고, AI가 진행 상황을 추적할 수 있도록 설계되었습니다.

---

## 🧭 이 문서 사용법 (AI·사람 공통)

- **현재 진행 단계는 체크박스로 추적**합니다. 완료된 작업은 `[x]`로 표시.
- 각 단계는 **30~60분 단위**로 끊어서, 한 단계가 끝나면 **완료 기준**을 확인하고 다음으로 넘어갑니다.
- 막히면 해당 Step의 **목적**과 **완료 기준**을 다시 읽어 길을 잡습니다.
- 단계는 **순차 의존**이 기본입니다 (Step N+1은 Step N의 산출물을 사용).
- AI 작업 시 **§핵심 결정**과 **§Gemini 한도 효율화 규칙**을 절대 어기지 않습니다.
- 이 플랜은 **2부 구성**입니다.
  - **Part A: 기본 MVP (Step 0~21)** — 웹사이트에서 직접 URL 추가하는 핵심 흐름 완성
  - **Part B: 텔레그램 연동 (Step 22~24)** — 봇으로 보내면 자동 수집되는 추가 채널

---

## 📌 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 무엇 | 링크를 던지면 AI가 요약·분류·태깅해서 보관해주는 개인용 아카이브 |
| 누가 쓴다 | 1인 (디자이너 본인). 외부에서 봐도 무방하므로 로그인 없음 |
| 사용량 가정 | **하루 URL 10개 이하** — 초기엔 가볍게, 사용량 늘면 그때 보강 |
| 얼마나 걸린다 | 기본 MVP 약 17시간 + 텔레그램 약 1.5시간 |
| 비용 | **월 $0** — 모두 무료 tier |
| 핵심 가치 | "무지성 수집, 유지성 활용" |

---

## 🎯 핵심 결정 (변경 금지)

| 항목 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | Next.js 15 (App Router) + TypeScript | |
| UI | Tailwind CSS + shadcn/ui + Framer Motion | |
| DB | Supabase Postgres | Free tier |
| ORM | Prisma | |
| **인증** | **없음** (공개 앱) | |
| AI | Google Gemini API (Flash만) | Pro 토글은 Phase 2로 이연 |
| 메타 추출 | open-graph-scraper | 5초 타임아웃 필수 |
| 백그라운드 | Next.js 15 `after()` | |
| 호스팅 | Vercel Hobby | |
| 외부 수집 채널 | Telegram Bot (Part B) | 카톡 직결은 약관/안정성 이슈로 포기 |
| **디자인 시스템** | **Linear-style 다크 모노크롬** | DESIGN.md 기반, 라이트 모드 없음 |
| **모션** | **부드럽고 고급스럽게** (out-expo, 절제) | 통통 튀는 spring 금지 |

---

## 💰 비용 — 모두 $0

| 서비스 | 무료 한도 | 평가 |
|---|---|---|
| Gemini API (Flash) | 일일 1,500 요청 | 하루 10건 사용에 사실상 무제한 |
| Vercel Hobby | 100GB/월, 함수 10초 | 충분 |
| Supabase Free | DB 500MB | 텍스트 위주라 수년 |
| Telegram Bot | 무제한 | 무료 |

---

## 🛡️ Gemini 한도 효율화 규칙 (절대 어기지 말 것)

1. **신규 URL 수집 시 단 1회만 AI 호출** (DB unique 제약으로 중복 방지)
2. **AI 입력 최소화**: URL + 페이지 제목 + OG description (200자 이내). 본문 스크래핑 금지
3. **자동 재시도 금지**: 429 에러 시 카드를 "분류 실패" 상태로 두고 다음 수집부터 정상 처리
4. **Flash만 사용** (MVP). Pro 모델은 Phase 2에서 도입
5. **수동 분류 우회로 항상 열어둠**: 카드 메뉴에서 카테고리 직접 변경 가능

---

## 🗄️ 데이터 모델 (Prisma)

```prisma
// prisma/schema.prisma — 인증 없음, 1인 사용 가정

model Reference {
  id            String   @id @default(uuid())
  url           String   @unique
  title         String?
  ogImage       String?
  ogDescription String?
  aiSummary     String?
  aiCategory    Category @default(UNCLASSIFIED)
  aiConfidence  Float?                        // 컬럼은 두되, MVP UI에는 노출 안 함
  status        Status   @default(UNREAD)
  source        Source   @default(MANUAL)
  rawAiResponse Json?                         // 디버깅용
  createdAt     DateTime @default(now())
  archivedAt    DateTime?
  tags          ReferenceTag[]

  @@index([status, createdAt])
}

enum Category { VISUAL DEV REFERENCE UNCLASSIFIED }
enum Status   { UNREAD ARCHIVED }
enum Source   { MANUAL TELEGRAM }              // MVP 두 채널만

model Tag           { id String @id @default(uuid()); name String @unique; refs ReferenceTag[] }
model ReferenceTag  {
  referenceId String
  tagId       String
  reference   Reference @relation(fields: [referenceId], references: [id], onDelete: Cascade)
  tag         Tag       @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([referenceId, tagId])
}

model VisualDictionary {
  id              String   @id @default(uuid())
  keyword         String                       // "유리 모피즘"
  vibeDescription String?
  prompts         Prompt[]
  createdAt       DateTime @default(now())
}

model Prompt {
  id              String @id @default(uuid())
  dictionaryId    String
  tool            Tool                         // MIDJOURNEY | THREEJS | DALLE | SD | OTHER
  body            String @db.Text
  exampleImageUrl String?
  dictionary      VisualDictionary @relation(fields: [dictionaryId], references: [id], onDelete: Cascade)
}

enum Tool { MIDJOURNEY THREEJS DALLE STABLE_DIFFUSION OTHER }

model DevCommand {
  id          String      @id @default(uuid())
  category    DevCategory                      // GIT | CLAUDE_CODE | SHELL | TERM
  title       String
  body        String      @db.Text
  description String?
  createdAt   DateTime    @default(now())
}

enum DevCategory { GIT CLAUDE_CODE SHELL TERM }
```

---

## 🖼️ 화면 구조

단일 페이지 + 앵커 네비게이션 (`/` 외 라우트 없음).

```
/
├─ 상단 고정: 통합 검색바
├─ 탭: [전체] [Visual Dictionary] [Dev Terminal] [Reference Hub]
├─ #inbox      Smart Inbox (UNREAD 카드, 최신순)
├─ #visual     Visual Dictionary
├─ #dev        Dev Terminal
└─ #reference  Archived REFERENCE
```

---

## 🎨 디자인 시스템 (DESIGN.md 기반)

> **컨셉**: Linear-style 다크 모노크롬 — 거의 순수 검정 캔버스 위에 라벤더 블루 단일 액센트. 라이트 모드 없음.

### 컬러 토큰 (CSS 변수로 모두 등록)

```css
/* app/globals.css :root */
--canvas:           #010102;  /* 페이지 배경 (true black 아님, 푸른빛 살짝) */
--surface-1:        #0f1011;  /* 기본 카드 배경 */
--surface-2:        #141516;  /* hover/featured 카드 */
--surface-3:        #18191a;  /* 드롭다운, 서브 네비 */
--surface-4:        #191a1b;  /* 가장 깊은 lift */
--hairline:         #23252a;  /* 1px border 기본 */
--hairline-strong:  #34343a;  /* 강조 border */

--ink:              #f7f8f8;  /* 본문, 헤드라인 */
--ink-muted:        #d0d6e0;  /* 보조 텍스트 */
--ink-subtle:       #8a8f98;  /* 메타 정보, 비활성 탭 */
--ink-tertiary:     #62666d;  /* 비활성, footnote */

--primary:          #5e6ad2;  /* 라벤더 블루 — primary CTA, 브랜드, focus */
--primary-hover:    #828fff;  /* 호버 시 */
--primary-focus:    #5e69d1;  /* focus ring */
--success:          #27a644;  /* 유일한 semantic 색 */
```

### 컬러 사용 규칙 (절대 어기지 말 것)

- **라벤더는 절제**: primary CTA, 브랜드 로고, focus ring, 링크 강조에만. **카드 배경·섹션 배경에 라벤더 금지**
- **두 번째 chromatic 색상 도입 금지** — 노랑/주황/빨강/녹색 다 안 됨 (success 녹색만 예외)
- **카테고리 4개 시각 구분**: 별도 색상 대신 **라벤더 + 회색 4단계**로
  - VISUAL → ink (#f7f8f8)
  - DEV → ink-muted (#d0d6e0)
  - REFERENCE → ink-subtle (#8a8f98)
  - UNCLASSIFIED → ink-tertiary (#62666d)
  - 또는 status badge처럼 surface-2 배경 + ink-muted 텍스트 (구분 미세하게)
- **#000000 사용 금지** — 항상 `--canvas` (#010102) 사용
- **그림자 거의 안 씀** — 깊이는 surface ladder + hairline border로

### 타이포그래피

- **본문 폰트**: Geist Sans (Vercel 무료, Linear에 가장 가까움) — `pnpm add geist`
- **모노 폰트**: Geist Mono (코드 블록, Dev Terminal)
- **Display 음수 letter-spacing** 적극 사용:
  - 80px → -3.0px / 56px → -1.8px / 40px → -1.0px / 28px → -0.6px / 22px → -0.4px / 16px → -0.05px
- **Eyebrow는 양수 tracking** (0.4px) — 작은 라벨에만
- **Display 가중치 600**, 본문 400. 700+ 거의 안 씀

### 사이즈 토큰

| 토큰 | 값 | 용도 |
|---|---|---|
| `radius-sm` | 6px | 인라인 태그 |
| `radius-md` | 8px | **모든 버튼, 인풋** (pill 절대 금지) |
| `radius-lg` | 12px | 카드 (Inbox, Visual, Dev) |
| `radius-xl` | 16px | OG 이미지 큰 카드 |
| `radius-pill` | 9999px | 상태 뱃지, 탭 토글 |
| `space-xs ~ section` | 8/12/16/24/32/48/96px | 4px 베이스 |

### 카드 기본 레시피

```
배경 surface-1 (#0f1011)
1px 보더 hairline (#23252a)
radius-lg 12px
패딩 24px (space-lg)
hover 시 → surface-2 배경 + hairline-strong 보더 (모션은 §모션 가이드 참고)
```

---

## ✨ 모션 가이드 — 부드럽고 고급스럽게

> **원칙**: Linear/Apple-style 절제된 모션. 통통 튀는 spring 금지. 모든 mount/unmount는 fade 동반.

### Easing & Duration 토큰

```ts
// lib/motion.ts (Step 2에서 생성)
export const ease = {
  out:    [0.16, 1, 0.3, 1],     // 표준 out-expo. 95% 케이스 이걸로
  inOut:  [0.65, 0, 0.35, 1],    // 섹션 전환, 중간 화면 이동
  smooth: [0.32, 0.72, 0, 1],    // 페이지 전환 (Apple-style)
} as const

export const duration = {
  fast:   0.15,   // hover, 색 변화, focus ring
  base:   0.25,   // 카드 hover lift, 작은 transform
  medium: 0.4,    // archive/delete, 모달 open/close
  slow:   0.6,    // 페이지 mount, 섹션 진입
} as const

export const springSoft = {
  type: "spring" as const,
  damping: 28,    // 통통 튐 거의 없음
  stiffness: 280,
  mass: 0.8,
}
```

### 마이크로 인터랙션 사양

| 인터랙션 | 모션 |
|---|---|
| **카드 hover** | `y: -2`, `scale: 1.005`, surface-1 → surface-2, `duration: base`, `ease: out` |
| **버튼 hover** | 배경색만 전환 `duration: fast` (이동·스케일 없음) |
| **카드 archive (스와이프)** | `x: 320`, `opacity: 0`, `duration: medium`, `ease: out` |
| **카드 delete** | `scale: 0.96`, `opacity: 0`, `duration: medium` |
| **카드 mount (목록 진입)** | `opacity 0→1` + `y: 8→0`, **stagger 40ms**, `duration: base` |
| **모달 open** | overlay fade + content `scale: 0.96→1` + `opacity: 0→1`, `duration: medium`, `ease: out` |
| **탭 클릭 → 섹션 스크롤** | `scrollIntoView({ behavior: "smooth" })` (네이티브) |
| **검색 결과 dropdown** | `opacity 0→1` + `y: -4→0`, `duration: fast` |
| **focus ring** | 2px primary-focus 50% opacity, 즉시 (transition 없음) |
| **토스트 (sonner)** | sonner 기본 (이미 충분히 부드러움) |

### 금지 사항

- ❌ Spring damping < 20 (통통 튐)
- ❌ duration > 600ms (느려서 답답)
- ❌ 회전·뒤집기·shake 등 장식 모션
- ❌ hover에 큰 scale (1.05+)
- ❌ 색상 fade를 RGB 사이로 보간 (밴드 발생) — opacity로만

---

## 🌊 핵심 워크플로우

### 수집 플로우 (두 채널, 같은 로직)

```
[채널 A] 웹사이트 URL 입력창                  [채널 B] 텔레그램 봇 메시지
        ↓                                          ↓
  POST /api/references               POST /api/telegram/webhook
        ↓                                  메시지에서 URL 추출
        └──────────────┬───────────────────────┘
                       ↓
            collectUrl(url, source)  ← 공통 로직
                       ├─ URL 정규화 + 중복 체크
                       ├─ OG 추출 (5초 타임아웃)
                       ├─ Reference INSERT (status=UNREAD)
                       ├─ after() 등록 → 즉시 응답
                       └─ [백그라운드] Gemini 분류 → DB UPDATE
```

**핵심**: Part B(텔레그램)는 Part A(웹)의 로직을 **그대로 재사용**. 추가 코드는 webhook 어댑터뿐.

---

# Part A. 기본 MVP (Step 0~21)

## 📋 작업 단계

### Step 0. 계정 발급 (30분) — 사람이 직접

**목적**: 외부 서비스 계정을 미리 받아 중간에 막히지 않게.

**작업**
- [x] GitHub 계정
- [x] Vercel 계정
- [x] Supabase 계정 + 프로젝트 생성
- [x] Google AI Studio API 키
- [x] Node.js 20+ (확인: v24.15.0)
- [x] pnpm 설치 (`brew install pnpm` → 11.0.4)

**완료 기준**: ✅ 모두 완료. 다음 단계 진행 가능

**→ 다음**: Step 1

---

### Step 1. Next.js 프로젝트 생성 (30분) ✅

**목적**: 모든 화면·서버 코드가 들어갈 빈 작업장.

**작업**
- [x] `pnpm create next-app@latest .` (TS ✅, Tailwind ✅, App Router ✅, src ❌, Turbopack ✅)
- [x] dev 서버 → [localhost:3000](http://localhost:3000) HTTP 200 확인
- [x] `app/page.tsx`를 비우고 `<h1>Vibe Archive</h1>`만 남기기
- [x] `.gitignore`에 `.claude/` 추가
- [x] 초기 커밋

**실제 설치 버전**: Next.js 16.2.4, React 19.2.4, Tailwind 4.2.4, TypeScript 5.9.3 (Turbopack)

**파일**: `app/page.tsx`, `package.json`, `.gitignore`, `pnpm-workspace.yaml`

> ⚠️ **pnpm 11 strict 이슈**: `pnpm dev`가 sharp/unrs-resolver의 ignored-builds 경고로 exit 1로 종료됨. 우회: `./node_modules/.bin/next dev` 직접 호출 (현재 백그라운드 실행 중).

**완료 기준**: ✅ HTTP 200, "Vibe Archive" 렌더 확인

**→ 다음**: Step 2

---

### Step 2. shadcn/ui + 디자인 토큰 셋업 (60분) ✅

**목적**: 디자인 시스템(다크 모노크롬 + 라벤더)을 CSS 변수와 Tailwind 설정에 모두 깔아두기.

**작업**
- [x] 다크 모드 강제: `app/layout.tsx` `<html className="dark ...">`
- [x] Geist 폰트 (이미 `next/font/google`로 깔림)
- [x] DESIGN.md 컬러·radius 토큰 → `app/globals.css` `:root` + `@theme inline`
- [x] **Tailwind 4**: `tailwind.config.ts` 없음. `globals.css`의 `@theme inline`이 동등 역할
- [x] `pnpm dlx shadcn@latest init -d` (Next + base-nova preset, lucide-react 자동 설치)
- [x] shadcn 변수(`--background`, `--card`, `--primary`, `--border` 등)를 우리 디자인 토큰에 매핑
- [x] 컴포넌트 추가: `card`, `input`, `dialog`, `sheet`, `sonner`, `badge`, `dropdown-menu` (+ 기본 `button`)
- [x] `pnpm add framer-motion`
- [x] `lib/motion.ts` — `ease`, `duration`, `springSoft`, `fadeUp`, `hoverLift`, `modalIn`, `swipeOut` export
- [x] `app/layout.tsx`에 `<Toaster theme="dark" position="bottom-center" />` 추가
- [x] `app/page.tsx`에 디자인 토큰 미리보기 (surface ladder, 카테고리 카드, 버튼·인풋, 모노 코드)

**파일**: `app/layout.tsx`, `app/globals.css`, `lib/motion.ts`, `lib/utils.ts`, `components.json`, `components/ui/*`

> 💡 **Tailwind 4 변화**: `tailwind.config.ts` 파일 없이 CSS-only 설정. 모든 토큰은 `globals.css`의 `@theme inline {}`에 정의.
> 💡 **pnpm 11 빌드 우회**: `pnpm config set dangerously-allow-all-builds true` 적용으로 sharp/unrs-resolver/msw 등 빌드 자동 승인.

**완료 기준**: ✅
- 배경 #010102, Geist 폰트, 라벤더 액센트 정상 렌더
- HTTP 200 + 컴파일 에러 0
- 모든 디자인 토큰 클래스(`bg-surface-1`, `text-ink`, `text-brand` 등) 작동

**→ 다음**: Step 3

---

### Step 3. Supabase + Prisma 연결 (45분) ✅

**목적**: 모든 카드·명령어를 정해진 모양으로 저장하기 위한 DB 셋업.

**작업**
- [x] Supabase Connection string 받음 (사용자 제공)
- [x] `pnpm add prisma @prisma/client` (Prisma 7.8.0)
- [x] `pnpm prisma init` → `prisma/schema.prisma`, `prisma.config.ts` 생성
- [x] `.env`에 `DATABASE_URL` 입력 (Session Pooler URL)
- [x] schema.prisma에 데이터 모델 전체 작성 (Reference, Tag, VisualDictionary, Prompt, DevCommand + 5 enums)
- [x] `pnpm prisma migrate dev --name init` → 마이그레이션 적용 (`20260505033050_init`)
- [x] `pnpm prisma generate` → `lib/generated/prisma/`에 client 생성
- [x] `pnpm add @prisma/adapter-pg pg` + `pnpm add -D @types/pg`
- [x] `lib/db.ts` 작성 (PrismaPg adapter + singleton)

**파일**: `prisma/schema.prisma`, `prisma.config.ts`, `lib/db.ts`, `.env`, `.env.example`, `prisma/migrations/`

> 💡 **Prisma 7 변화**:
> - `prisma-client` provider (NEW)가 default. 이전 `prisma-client-js`는 deprecated
> - PrismaClient는 **Driver Adapter 필수** — `@prisma/adapter-pg`로 pg 연결
> - 환경변수는 `prisma.config.ts`가 dotenv로 직접 로드
>
> 💡 **Supabase 연결 트러블슈팅**:
> - Direct connection (`db.PROJECT.supabase.co:5432`)은 **IPv6 전용**. 무료 tier + 일반 ISP에서 도달 불가
> - Session Pooler (`aws-1-ap-northeast-2.pooler.supabase.com:5432`) 사용
> - Username 형식: `postgres.PROJECT_REF` (project ref가 username의 일부)
> - 자동 추측한 region 도메인이 다를 수 있으므로, 안 되면 Supabase 대시보드의 Connection string 복사

**완료 기준**: ✅ 마이그레이션 SQL 적용 + Prisma client 생성 + 타입 체크 통과

**→ 다음**: Step 4

---

### Step 4. OG 메타 추출 유틸 (30분)

**목적**: 링크에서 제목·이미지·설명을 자동으로 뽑아오는 함수.

**작업**
- [ ] `pnpm add open-graph-scraper`
- [ ] `lib/og.ts` 작성 — 5초 타임아웃 필수

```ts
// lib/og.ts
import ogs from "open-graph-scraper"
export async function fetchOG(url: string) {
  try {
    const { result } = await ogs({ url, timeout: 5000 })
    return {
      title: result.ogTitle ?? result.twitterTitle ?? null,
      ogImage: result.ogImage?.[0]?.url ?? null,
      ogDescription: (result.ogDescription ?? result.twitterDescription ?? "").slice(0, 200),
    }
  } catch {
    return { title: null, ogImage: null, ogDescription: null }
  }
}
```

**파일**: `lib/og.ts`

**완료 기준**: 임시 스크립트로 framer.com URL 넣으면 title/og 객체 반환

**→ 다음**: Step 5

---

### Step 5. 공통 수집 함수 + POST /api/references (60분)

**목적**: 웹·텔레그램 두 채널이 공유할 **공통 수집 함수** 작성. 그 위에 웹용 API 핸들러를 얹음.

**작업**
- [ ] `lib/collect.ts` 작성 — 채널 무관 공통 로직

```ts
// lib/collect.ts
import { db } from "./db"
import { fetchOG } from "./og"

export async function collectUrl(rawUrl: string, source: "MANUAL" | "TELEGRAM") {
  const url = rawUrl.trim().replace(/\/$/, "")
  const existing = await db.reference.findUnique({ where: { url } })
  if (existing) return { status: "duplicate" as const, id: existing.id }

  const og = await fetchOG(url)
  const ref = await db.reference.create({
    data: { url, ...og, source, status: "UNREAD" },
  })
  return { status: "created" as const, id: ref.id }
}
```

- [ ] `app/api/references/route.ts` 작성
- [ ] POST: body의 `url`을 받아 `collectUrl(url, "MANUAL")` 호출 → duplicate면 409, created면 200
- [ ] GET: `?status=UNREAD` 등 쿼리 필터, 최신순 반환

**파일**: `lib/collect.ts`, `app/api/references/route.ts`

**완료 기준**: curl로 POST → DB row 생성, 같은 URL 두 번째는 409

**→ 다음**: Step 6

---

### Step 6. URL 입력 컴포넌트 (30분)

**목적**: 사용자가 메인 화면에서 URL을 붙여넣고 제출할 큰 입력창.

**작업**
- [ ] `components/url-submit.tsx` (Client Component)
- [ ] 큼지막한 Input + Button (모바일 친화)
- [ ] 제출 시 `fetch("/api/references", { method: "POST" })`
- [ ] 성공 시 sonner 토스트 + 입력창 비우기 + `router.refresh()`
- [ ] 409 시 "이미 보관됨" 토스트

**파일**: `components/url-submit.tsx`

**완료 기준**: 메인에서 URL 제출 시 성공 토스트, DB에 row 추가됨

**→ 다음**: Step 7

---

### Step 7. Inbox 카드 + 메인 그리드 (45분)

**목적**: 저장된 카드들이 화면에 보이게. AI 요약 자리는 비워둠 (다음 단계에서 채움).

**작업**
- [ ] `components/inbox-card.tsx` — Reference row 받아 카드 렌더 (OG 이미지, 제목, 도메인, 요약 placeholder)
- [ ] aiSummary가 null이면 "분류 중..." 스켈레톤
- [ ] `app/page.tsx`를 Server Component로 — `db.reference.findMany({ where: { status: "UNREAD" }, orderBy: { createdAt: "desc" } })`
- [ ] 그리드 (md:3열, sm:1열)
- [ ] `<UrlSubmit />` 상단 + Inbox 그리드

**파일**: `components/inbox-card.tsx`, `app/page.tsx`

**완료 기준**: URL 제출 → 카드가 메인에 즉시 나타남 (요약 자리 "분류 중...")

**→ 다음**: Step 8

---

### Step 8. Gemini 분류 함수 (45분)

**목적**: 이 앱의 핵심 — Gemini Flash로 한 줄 요약 + 카테고리 + 태그 자동 생성.

**작업**
- [ ] `pnpm add @google/genai`
- [ ] `.env.local`에 `GEMINI_API_KEY` 추가
- [ ] `lib/ai/classify.ts` 작성

```ts
// lib/ai/classify.ts
import { GoogleGenAI, Type } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

const SYSTEM = `당신은 디자이너의 레퍼런스를 분류하는 큐레이터입니다.
카테고리:
  - VISUAL: 디자인/아트/UI/3D/사진 등 시각 영감
  - DEV: 코드/엔지니어링/도구/CLI
  - REFERENCE: 글/리서치/케이스 스터디/일반 자료
  - UNCLASSIFIED: 위 어디에도 명확히 속하지 않음
요약은 한국어로 1줄(120자 이내). 태그는 5개 이내.`

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary:    { type: Type.STRING },
    category:   { type: Type.STRING, enum: ["VISUAL","DEV","REFERENCE","UNCLASSIFIED"] },
    tags:       { type: Type.ARRAY, items: { type: Type.STRING } },
    confidence: { type: Type.NUMBER },
  },
  required: ["summary","category","tags","confidence"],
}

export async function classify(input: {
  url: string; title: string | null; ogDescription: string | null
}) {
  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: { systemInstruction: SYSTEM, responseMimeType: "application/json", responseSchema: SCHEMA },
    contents: `URL: ${input.url}\n제목: ${input.title ?? ""}\n설명: ${input.ogDescription ?? ""}`,
  })
  return JSON.parse(res.text!) as {
    summary: string
    category: "VISUAL"|"DEV"|"REFERENCE"|"UNCLASSIFIED"
    tags: string[]
    confidence: number
  }
}
```

**파일**: `lib/ai/classify.ts`, `.env.local`

**완료 기준**: 임시 스크립트로 dribbble.com URL → `{ summary, category: "VISUAL", tags, confidence }` 반환

**→ 다음**: Step 9

---

### Step 9. 분류 백그라운드 연결 (45분)

**목적**: URL 제출 후 즉시 응답 + 백그라운드에서 AI 분류 → DB 업데이트.

**작업**
- [ ] `lib/collect.ts`에서 INSERT 직후 `after()`로 분류 작업 등록
- [ ] `import { after } from "next/server"`
- [ ] `after()` 콜백:
  - `classify(...)` 호출
  - 성공: `db.reference.update({ aiSummary, aiCategory, aiConfidence, rawAiResponse })`
  - 태그 connectOrCreate
  - **catch 블록은 `console.error`만, 자동 재시도 절대 금지**

```ts
// lib/collect.ts (분류 추가 부분)
import { after } from "next/server"
import { classify } from "./ai/classify"

// ... collectUrl 내부, ref 생성 직후
after(async () => {
  try {
    const result = await classify({ url, title: og.title, ogDescription: og.ogDescription })
    await db.reference.update({
      where: { id: ref.id },
      data: {
        aiSummary: result.summary,
        aiCategory: result.category,
        aiConfidence: result.confidence,
        rawAiResponse: result as any,
        tags: {
          create: result.tags.map((name) => ({
            tag: { connectOrCreate: { where: { name }, create: { name } } },
          })),
        },
      },
    })
  } catch (e) { console.error("classify failed", e) }
})
```

**파일**: `lib/collect.ts`

**완료 기준**: URL 제출 1~3초 후 페이지 refresh 시 카드의 요약·카테고리·태그가 채워짐

**→ 다음**: Step 10

---

### Step 10. 카드 메뉴: 카테고리 직접 변경 (30분)

**목적**: AI가 잘못 분류했을 때 사용자가 즉시 보정. (재시도·심층 분석은 MVP에서 제외)

**작업**
- [ ] `app/api/references/[id]/route.ts` 생성
- [ ] PATCH: body에서 `aiCategory` 또는 `status` 받아 update
- [ ] 카드 우상단 "..." DropdownMenu
  - 카테고리 변경 (4개 옵션)
  - Archive (다음 단계)
  - Delete (다음 단계)

**파일**: `app/api/references/[id]/route.ts`, `components/inbox-card.tsx`

**완료 기준**: 카드 메뉴에서 카테고리를 DEV로 바꾸면 즉시 반영됨

**→ 다음**: Step 11

---

### Step 11. Archive / Delete 액션 (30분)

**목적**: Inbox에서 카드를 정리하는 두 방법.

**작업**
- [ ] PATCH `/api/references/[id]` — `status: "ARCHIVED"` + `archivedAt: now()`
- [ ] DELETE `/api/references/[id]` — hard delete
- [ ] 카드 메뉴에 Archive / Delete 추가
- [ ] Framer Motion `AnimatePresence` + `exit={{ x: 300, opacity: 0 }}`
- [ ] Archive 시 토스트 "{카테고리} 탭에 보관했어요"

**파일**: `app/api/references/[id]/route.ts`, `components/inbox-card.tsx`

**완료 기준**: Archive → 카드 슬라이드 사라짐, Delete → 즉시 사라짐

**→ 다음**: Step 12

---

### Step 12. 탭 네비 + 4섹션 (45분)

**목적**: 메인 페이지에 [전체][Visual Dictionary][Dev Terminal][Reference Hub] 탭과 4개 앵커 섹션.

**작업**
- [ ] `components/tab-nav.tsx` — sticky 상단, 클릭 시 `scrollIntoView({ behavior: "smooth" })`
- [ ] 앵커: `#inbox`, `#visual`, `#dev`, `#reference`
- [ ] `app/page.tsx`를 4섹션 레이아웃으로
  - `#inbox` UNREAD 카드 그리드
  - `#visual` placeholder
  - `#dev` placeholder
  - `#reference` `status=ARCHIVED && aiCategory=REFERENCE` 그리드

**파일**: `components/tab-nav.tsx`, `app/page.tsx`

**완료 기준**: 탭 클릭 시 부드럽게 해당 섹션으로 스크롤, Reference Hub에 archived REFERENCE 표시

**→ 다음**: Step 13

---

### Step 13. 검색바 자리잡기 (30분)

**목적**: 상단 고정 검색바. API 연결은 Step 18에서.

**작업**
- [ ] `components/search-bar.tsx` — sticky Input
- [ ] 디바운스 300ms (setTimeout)
- [ ] placeholder "요약·태그·명령어 검색..."
- [ ] 결과 표시 영역은 빈 div (Step 18에서 연결)

**파일**: `components/search-bar.tsx`, `app/page.tsx`

**완료 기준**: 상단에 검색바 보이고 입력 가능

**→ 다음**: Step 14

---

### Step 14. Visual Dictionary API (30분)

**목적**: 감성 키워드 ↔ AI 프롬프트 사전 CRUD 백엔드.

**작업**
- [ ] `app/api/visual-dictionary/route.ts` — GET, POST
- [ ] `app/api/visual-dictionary/[id]/route.ts` — PATCH, DELETE
- [ ] POST body: `{ keyword, vibeDescription, prompts: [{ tool, body, exampleImageUrl }] }`
- [ ] Prisma `prompts: { create: [...] }`로 한 번에 생성

**파일**: `app/api/visual-dictionary/route.ts`, `app/api/visual-dictionary/[id]/route.ts`

**완료 기준**: curl로 POST → 키워드 + 프롬프트 한 번에 생성, GET으로 목록 반환

**→ 다음**: Step 15

---

### Step 15. Visual Dictionary UI + 복사 버튼 (60분)

**목적**: `#visual` 섹션에 사전 카드 그리드 + 등록 모달 + 원클릭 복사.

**작업**
- [ ] `components/visual-prompt-card.tsx` — 키워드, 무드, 도구별 프롬프트 (Tabs로 도구 전환)
- [ ] 각 프롬프트에 복사 버튼 → `navigator.clipboard.writeText()` + sonner 토스트
- [ ] `components/visual-dictionary-form.tsx` — Dialog로 등록 (도구 추가/제거 가능)
- [ ] `#visual` 섹션에 그리드 + "새 항목" 버튼

**파일**: `components/visual-prompt-card.tsx`, `components/visual-dictionary-form.tsx`

**완료 기준**: "유리 모피즘" + Midjourney 프롬프트 등록 → 카드 표시 → 복사 → 클립보드 들어감

**→ 다음**: Step 16

---

### Step 16. Dev Terminal API (30분)

**목적**: Git/Claude Code/Shell 명령어 모음의 CRUD 백엔드.

**작업**
- [ ] `app/api/dev-commands/route.ts` — GET, POST
- [ ] `app/api/dev-commands/[id]/route.ts` — PATCH, DELETE
- [ ] POST body: `{ category, title, body, description }`

**파일**: `app/api/dev-commands/route.ts`, `app/api/dev-commands/[id]/route.ts`

**완료 기준**: curl로 `git rebase -i HEAD~3` 등록·조회 가능

**→ 다음**: Step 17

---

### Step 17. Dev Terminal UI + 복사 버튼 (45분)

**목적**: `#dev` 섹션에 명령어 카드 + 등록 모달.

**작업**
- [ ] `components/dev-command-card.tsx` — Badge + title + 코드 블록(monospace) + 설명 + 복사 버튼
- [ ] `components/dev-command-form.tsx` — Dialog로 등록
- [ ] `#dev` 섹션 — 카테고리별 그룹 제목 + 그리드

**파일**: `components/dev-command-card.tsx`, `components/dev-command-form.tsx`

**완료 기준**: `git rebase -i HEAD~3` 등록 → 카드 표시 → 복사 → 터미널 붙여넣기 동작

**→ 다음**: Step 18

---

### Step 18. 통합 검색 API + 검색바 연결 (60분)

**목적**: 검색바 한 곳에서 references / visual dictionary / dev commands 모두 검색.

**작업**
- [ ] `app/api/search/route.ts` — `?q=` 쿼리
- [ ] **단순 ILIKE로 시작** (1,000건 미만이면 충분, 사용자 가정 하루 10건이면 한참 동안 OK)
- [ ] 3개 테이블 각각 findMany 후 합치기:
  - References: title/aiSummary ILIKE
  - VisualDictionary: keyword/vibeDescription/prompts.body ILIKE
  - DevCommand: title/body/description ILIKE
- [ ] 응답: `[{ source: "reference"|"visual"|"dev", id, title, snippet, ... }]`
- [ ] 검색바 결과를 dropdown 또는 popover로 표시 (출처 라벨 함께)
- [ ] 결과 클릭 시 해당 섹션으로 스크롤

**파일**: `app/api/search/route.ts`, `components/search-bar.tsx`

**완료 기준**: "glass" 입력 → 여러 출처에서 결과가 라벨과 함께 섞여 표시

**→ 다음**: Step 19

---

### Step 19. 마이크로 인터랙션 다듬기 (60분)

**목적**: 디자인 토큰은 Step 2에서 다 깔았으니, 이제 카드·전환·빈 상태의 마이크로 인터랙션과 감성 디테일을 마무리.

**작업**
- [ ] **카드 mount stagger** — Inbox·Visual·Dev 그리드에 `<motion.div>` + `transition={{ delay: i * 0.04, ease: ease.out, duration: duration.base }}`
- [ ] **카드 hover** — `whileHover={{ y: -2, scale: 1.005 }}` + Tailwind hover에서 surface-1 → surface-2, hairline → hairline-strong (transition 200ms)
- [ ] **버튼 press** — `whileTap={{ scale: 0.98 }}` (모든 primary CTA에)
- [ ] **모달 open** — Dialog의 content에 `initial={{ scale: 0.96, opacity: 0 }}` `animate={{ scale: 1, opacity: 1 }}` (`duration.medium`, `ease.out`)
- [ ] **빈 상태** — Inbox 비어있을 때 ink-subtle 카피 "아직 비어있어요. 첫 링크를 붙여넣어 보세요." (display-md, letter-spacing -1.0px)
- [ ] **검색 결과 dropdown** — `opacity 0→1` + `y: -4→0`, `duration.fast`
- [ ] **focus ring 점검** — 모든 인풋·버튼에 `focus-visible:ring-2 ring-primary/50` (즉시, transition 없음)
- [ ] **모바일 반응형 점검** — 검색바, 그리드(3→1열), 모달 풀스크린 sheet 전환

**파일**: 전체 카드·모달·인풋 컴포넌트

**완료 기준**:
- 페이지 새로고침 시 카드들이 부드럽게 차례로 떠오름 (stagger)
- 카드 hover에 살짝 떠오르는 느낌, 통통 튀지 않음
- 모달이 부드럽게 페이드인 + 미세하게 확대
- 본인이 봤을 때 "고급스럽다" 느낌이 듦

**→ 다음**: Step 20

---

### Step 20. Vercel 배포 (45분)

**목적**: 어디서든 접속 가능하게.

**작업**
- [ ] GitHub에 push
- [ ] Vercel에서 GitHub 저장소 import
- [ ] 환경변수: `DATABASE_URL`, `GEMINI_API_KEY`
- [ ] Build Command를 `prisma generate && next build`로
- [ ] 배포된 도메인(`https://xxx.vercel.app`) 메모 — Part B에서 사용

**파일**: `package.json` (build script), Vercel 환경변수

**완료 기준**: 모바일·데스크톱 모두에서 정상 동작

**→ 다음**: Step 21

---

### Step 21. 기본 MVP 검증 (45분)

**목적**: PRD 핵심 시나리오로 한 번씩 돌려보기.

**작업**
- [ ] Dribbble 링크 → VISUAL로 분류
- [ ] GitHub 링크 → DEV로 분류
- [ ] 같은 URL 두 번 → 409 + "이미 보관됨"
- [ ] 카드 메뉴에서 카테고리 변경 → 즉시 반영
- [ ] Archive → 해당 카테고리 탭에 표시
- [ ] Visual Dictionary 등록 → 복사 버튼 동작
- [ ] Dev Terminal 등록 → 복사 버튼 동작
- [ ] 검색바 "glass" → 여러 출처에서 결과
- [ ] 모바일에서 URL 제출 → 정상 동작

**완료 기준**: 모든 시나리오 통과 → **기본 MVP 완성** 🎉

**→ 다음**: Part B (텔레그램 연동) 또는 운영 시작

---

# Part B. 텔레그램 자동 수집 (Step 22~24)

> **언제 시작하나**: Part A를 모두 완료하고 Vercel 배포가 끝난 후. webhook URL이 있어야 봇 등록 가능.
>
> **무엇을 얻나**: 봇과의 1:1 대화창에 URL을 보내면 자동으로 아카이브됨. 모바일에서 카톡처럼 쓰는 흐름.

---

### Step 22. Telegram Bot 생성 (15분) — 사람이 직접

**목적**: 봇 만들고 토큰 받기. 사용자(나만) 화이트리스트용 chat_id도 확인.

**작업**
- [ ] 텔레그램에서 `@BotFather` 검색 → `/newbot` → 이름 입력 → **Bot Token** 발급받아 메모
- [ ] 만든 봇 검색 → 1:1 대화 시작 → `/start` 한 번 보내기
- [ ] 본인 chat_id 확인:
  - 브라우저에서 `https://api.telegram.org/bot<TOKEN>/getUpdates` 열기
  - 응답 JSON에서 `result[0].message.chat.id` 값(숫자) 메모
- [ ] Vercel 환경변수에 `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALLOWED_CHAT_ID` 추가

**완료 기준**: Bot Token + 본인 chat_id 둘 다 손에 있음

**→ 다음**: Step 23

---

### Step 23. Webhook 엔드포인트 (45분)

**목적**: 텔레그램이 메시지를 보낼 서버 엔드포인트. URL 추출 후 기존 `collectUrl()` 재사용.

**작업**
- [ ] `app/api/telegram/webhook/route.ts` 생성
- [ ] POST 핸들러: 텔레그램 update payload 받기
- [ ] `body.message.chat.id`가 `TELEGRAM_ALLOWED_CHAT_ID`와 다르면 무시 (보안)
- [ ] `body.message.text`에서 URL 정규식으로 추출
- [ ] `collectUrl(url, "TELEGRAM")` 호출
- [ ] 봇이 답신 메시지 보내기: `sendMessage` API로 "🗂 보관 완료: {url}" 또는 "이미 보관됨"

```ts
// app/api/telegram/webhook/route.ts (요약)
import { NextRequest } from "next/server"
import { collectUrl } from "@/lib/collect"

const URL_REGEX = /(https?:\/\/[^\s]+)/g

async function reply(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
}

export async function POST(req: NextRequest) {
  const update = await req.json()
  const msg = update.message
  if (!msg) return new Response("ok")
  if (String(msg.chat.id) !== process.env.TELEGRAM_ALLOWED_CHAT_ID) return new Response("forbidden")

  const urls = (msg.text ?? "").match(URL_REGEX) ?? []
  if (urls.length === 0) {
    await reply(msg.chat.id, "URL이 없어요. 링크를 그대로 보내주세요.")
    return new Response("ok")
  }

  for (const url of urls) {
    const result = await collectUrl(url, "TELEGRAM")
    await reply(
      msg.chat.id,
      result.status === "duplicate" ? `이미 보관된 링크예요: ${url}` : `🗂 보관 시작: ${url}`,
    )
  }
  return new Response("ok")
}
```

**파일**: `app/api/telegram/webhook/route.ts`

**완료 기준**: 로컬에서 curl로 가짜 텔레그램 payload 보내면 DB에 row 생성됨

**→ 다음**: Step 24

---

### Step 24. 봇에 webhook 등록 + 검증 (30분)

**목적**: 텔레그램이 우리 서버로 메시지를 전달하도록 등록.

**작업**
- [ ] Step 20에서 메모한 Vercel 배포 도메인 사용
- [ ] 브라우저에서 한 번만 호출:
  ```
  https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://xxx.vercel.app/api/telegram/webhook
  ```
- [ ] 응답 `{"ok":true}` 확인
- [ ] 봇과 대화창에서 dribbble.com URL 보내기 → "🗂 보관 시작" 답신 받기
- [ ] 웹 메인에서 새 카드가 source=TELEGRAM으로 추가되었는지 확인
- [ ] 1~3초 후 카드에 요약·카테고리·태그 채워졌는지 확인
- [ ] 같은 URL 다시 보내기 → "이미 보관된 링크예요" 답신

**완료 기준**: 봇 대화창에서 URL → 웹사이트에 카드 자동 등록되는 전 흐름 동작 → **전체 완성** 🎉

---

## 🚀 Phase 2 (이후, 본 플랜 범위 밖)

운영하면서 필요해지면 도입:

- **Pro 모델 토글** — "심층 재분석" 카드 메뉴 (Gemini Pro 일일 100건 한도 안에서)
- **호스트네임 사전 분류** — `github.com → DEV` 등 명백한 도메인은 AI 호출 없이
- **MCP 서버** — Claude Code에서 `archive_link`, `search_vibe` 도구
- **PWA Share Target** — 모바일 공유 시트에서 직접 전송
- **pgvector 시맨틱 검색** — "따뜻한 미니멀" 같은 무드 검색
- **이미지 업로드** — Supabase Storage로 Visual Dictionary 예시 이미지 직접 업로드
- **신뢰도 배지·재시도 버튼** — 사용량 늘어 한도 부담 생길 때

---

## ⚠️ 잠재 위험 & 대응

| 위험 | 대응 |
|---|---|
| Supabase Free 7일 무활동 일시정지 | 평소 자주 접속 |
| Vercel Hobby 비상업 제한 | 외부 광고·수익화 시 Pro 전환 ($20/월) |
| OG 추출 느린 사이트 | 5초 타임아웃 (Step 4) |
| Telegram 봇 토큰 노출 | Vercel 환경변수에만, GitHub commit 금지 |
| 텔레그램 webhook 외부 spam | chat_id 화이트리스트로 차단 (Step 23) |
| 인증 없음 → 외부에서 데이터 추가 | 사용자 의도(공개 OK), 우려 시 Phase 2에 토큰 추가 |

---

## 🗂️ 최종 파일 구조

```
vibe-archive/
├─ prisma/schema.prisma
├─ app/
│  ├─ layout.tsx                          (Toaster, 폰트)
│  ├─ page.tsx                            (메인: 검색바 + 탭 + 4섹션)
│  └─ api/
│     ├─ references/route.ts              (POST 수집, GET 목록)
│     ├─ references/[id]/route.ts         (PATCH 변경, DELETE)
│     ├─ search/route.ts                  (통합 검색)
│     ├─ visual-dictionary/route.ts
│     ├─ visual-dictionary/[id]/route.ts
│     ├─ dev-commands/route.ts
│     ├─ dev-commands/[id]/route.ts
│     └─ telegram/webhook/route.ts        (Part B)
├─ lib/
│  ├─ db.ts                               (Prisma client)
│  ├─ og.ts                               (open-graph-scraper, 5s timeout)
│  ├─ collect.ts                          (공통 수집 함수, after()로 분류)
│  └─ ai/classify.ts                      (Gemini Flash, responseSchema)
├─ components/
│  ├─ ui/*                                (shadcn)
│  ├─ url-submit.tsx
│  ├─ search-bar.tsx
│  ├─ tab-nav.tsx
│  ├─ inbox-card.tsx
│  ├─ visual-prompt-card.tsx
│  ├─ visual-dictionary-form.tsx
│  ├─ dev-command-card.tsx
│  └─ dev-command-form.tsx
└─ .env.local                             (DATABASE_URL, GEMINI_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_ALLOWED_CHAT_ID)
```
