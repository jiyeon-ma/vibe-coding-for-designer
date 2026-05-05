-- Vibe Archive — Restructure Categories Migration
-- 1) Category 모델 신설 (기본 4개 시드 포함)
-- 2) Reference.aiCategory enum -> categoryId FK + aiSlug 디버그 컬럼
-- 3) DevCommand 폐기 -> DevDictionary 신설
-- 데이터 손실 없음: aiCategory 값을 categoryId로 backfill 후 컬럼 drop.

BEGIN;

-- 0. enum "Category"는 새 table "Category"와 이름 충돌하므로 임시 rename
ALTER TYPE "Category" RENAME TO "Category__legacy";

-- 1. Category 테이블 생성
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- 2. 기본 4개 시스템 카테고리 시드
INSERT INTO "Category" ("id", "slug", "label", "isSystem", "order") VALUES
  (gen_random_uuid(), 'visual',       'Visual',       true, 0),
  (gen_random_uuid(), 'dev',          'Dev',          true, 1),
  (gen_random_uuid(), 'reference',    'Reference',    true, 2),
  (gen_random_uuid(), 'unclassified', 'Unclassified', true, 99);

-- 3. Reference에 categoryId, aiSlug 컬럼 추가 (둘 다 nullable)
ALTER TABLE "Reference" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "Reference" ADD COLUMN "aiSlug" TEXT;

-- 4. backfill: 기존 aiCategory 값으로 categoryId·aiSlug 채우기
UPDATE "Reference" SET
  "aiSlug"     = LOWER("aiCategory"::text),
  "categoryId" = (SELECT "id" FROM "Category" WHERE "slug" = LOWER("aiCategory"::text));

-- 5. FK 제약
ALTER TABLE "Reference"
  ADD CONSTRAINT "Reference_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 6. 인덱스 교체
DROP INDEX "Reference_status_createdAt_idx";
CREATE INDEX "Reference_status_categoryId_createdAt_idx"
  ON "Reference"("status", "categoryId", "createdAt");

-- 7. 옛 aiCategory 컬럼 drop (데이터는 categoryId·aiSlug로 이미 이전됨)
ALTER TABLE "Reference" DROP COLUMN "aiCategory";

-- 8. 임시 rename된 enum drop (이제 사용처 없음)
DROP TYPE "Category__legacy";

-- 9. DevCommand 테이블 + DevCategory enum drop (미구현 상태라 데이터 없음)
DROP TABLE IF EXISTS "DevCommand";
DROP TYPE IF EXISTS "DevCategory";

-- 10. DevDictionary 테이블 신설
CREATE TABLE "DevDictionary" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "example" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DevDictionary_pkey" PRIMARY KEY ("id")
);

COMMIT;
