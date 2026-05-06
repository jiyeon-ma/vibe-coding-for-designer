# [PRD] Vibe Archive: 디자이너를 위한 AI 지식 외장하드

## 1. 개요 (Overview)

- **서비스명**: Vibe Archive
- **한 줄 정의**: 디자이너의 영감과 지식을 AI가 자동으로 정리해주는 제2의 뇌(Second Brain).
- **배경**: 디자이너가 매일 접하는 수많은 레퍼런스 링크, 개발 용어, 프롬프트를 체계적으로 정리할 시간 부족 문제를 해결하고자 함.
- **핵심 가치**: "무지성 수집, AI 자동 분류, 유기적 탐색". 사용자가 링크만 던지면 AI가 지식의 체계를 세워줌.
- **타겟**: AI 네이티브 디자이너 (1인 사용 환경, 별도 인증 없음).

## 2. 정보 구조 (Information Architecture)

단일 페이지(`/`) 내에서 2단 탭 구조를 통해 4개의 핵심 섹션을 필터링합니다. 페이지 이동 없이 URL 쿼리 파라미터(`?tab=...&sub=...`)를 통해 상태를 보존합니다.

```
[All]
[Vibe Dictionary]
    ├ Visual Dictionary  (감성 키워드 & AI 프롬프트)
    └ Dev Dictionary     (개발 용어 & 코드 스니펫)
[Vibe Reference]
    ├ Vibe Fresh         (미분류/최신 수집본 - Inbox)
    └ Vibe Archived      (분류 완료된 아카이브 - List view)
```

## 3. 핵심 기능 (Core Features)

### 3.1 Vibe Collector (자동 수집 및 분류)

- **동작**: 메인 히어로 섹션의 입력창에 URL을 붙여넣으면 즉시 카드 생성.
- **AI 프로세싱 (Back-end)**:
  - OG 메타데이터 추출: 제목, 대표 이미지, 설명 추출.
  - AI 생성 산출물: 한국어 한 줄 요약, 카테고리 분류, 태그(5개 이내) 자동 생성.
- **카테고리 엔진**: `visual`, `dev`, `reference`, `unclassified` 중 하나로 자동 배정.
- **예외 처리**: 중복 URL 입력 시 409 Conflict 에러와 함께 차단.

### 3.2 Vibe Reference — Vibe Fresh (Inbox)

- **UI**: 16:9 OG 이미지 중심의 카드 그리드 레이아웃.
- **표시 항목**: 제목, 카테고리 뱃지, AI 한 줄 요약, 태그.
- **액션**: 카테고리 변경, 보관(Archive), 삭제 기능 제공.

### 3.3 Vibe Reference — Vibe Archived

- **UI**: 대량의 정보를 효율적으로 보기 위한 리스트 뷰(List View).
- **특징**: 상단 태그 필터링 및 사용자 정의 카테고리 추가 기능.
- **액션**: 카테고리 수정, Fresh 상태로 복원, 삭제.

### 3.4 Vibe Dictionary — Dev Dictionary

- **목적**: 디자이너가 협업 시 자주 접하는 개발 용어 및 명령어 보관.
- **구성**: 키워드, 한 줄 설명, 예시 코드 블록.
- **편의 기능**: 코드 블록 원클릭 복사 버튼, 등록/수정/삭제 다이얼로그.

### 3.5 Vibe Dictionary — Visual Dictionary

- **목적**: 특정 감성 키워드와 그에 대응하는 AI 생성 프롬프트(Midjourney, three.js 등) 쌍 보관.
- **구성**: 키워드, 무드 설명, 프롬프트, 예시 이미지.
- **편의 기능**: 프롬프트 원클릭 복사.

### 3.6 카테고리 및 검색

- **시스템 카테고리**: 4종(삭제 불가). 사용자 정의 카테고리 추가 가능(삭제 시 해당 데이터는 `unclassified`로 이동).
- **통합 검색**: 상단 스티키(Sticky) 검색바를 통해 모든 섹션의 콘텐츠를 통합 검색하고, 결과 클릭 시 해당 탭으로 자동 이동.

## 4. 디자인 방향성 (Design Language)

- **스타일**: Linear-style 다크 모노크롬.
- **컬러**: 다크모드 단일 사용
- **레이아웃**: 굵고 큰 타이틀, 넉넉한 여백을 활용한 세련된 톤앤매너.
- **모션**: out-expo 기반의 부드러운 애니메이션. 모든 컴포넌트의 등장/퇴장은 Fade-in 효과 동반.

## 5. 기술 스택 (Tech Stack)

| 영역 | 기술 스택 |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| UI | Tailwind CSS 4 + shadcn/ui + Framer Motion |
| Database / ORM | Supabase (Postgres) + Prisma 7 |
| AI Engine | Google Gemini 2.5 Flash (Free Tier) |
| Hosting | Vercel Hobby |
| Channel | Web URL Input + Telegram Bot (Phase B) |

## 6. 범위 외 항목 (Out of Scope)

- **인증 시스템**: 1인 사용을 전제로 하므로 로그인/회원가입 기능을 구현하지 않음.
- **라우팅**: 단일 페이지 구조를 유지하며 별도의 물리적 페이지 분리 없음.
- **인터랙션**: 카드 드래그 앤 드롭 기능 제외.
- **외부 채널**: 카카오톡 연동은 제외하고 텔레그램 봇으로 대체.
- **안정성**: AI API 호출 실패 시 자동 재시도 로직은 구현하지 않음 (한도 보호).
