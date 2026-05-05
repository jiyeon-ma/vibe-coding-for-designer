-- CreateEnum
CREATE TYPE "Category" AS ENUM ('VISUAL', 'DEV', 'REFERENCE', 'UNCLASSIFIED');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('UNREAD', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Source" AS ENUM ('MANUAL', 'TELEGRAM');

-- CreateEnum
CREATE TYPE "Tool" AS ENUM ('MIDJOURNEY', 'THREEJS', 'DALLE', 'STABLE_DIFFUSION', 'OTHER');

-- CreateEnum
CREATE TYPE "DevCategory" AS ENUM ('GIT', 'CLAUDE_CODE', 'SHELL', 'TERM');

-- CreateTable
CREATE TABLE "Reference" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "ogImage" TEXT,
    "ogDescription" TEXT,
    "aiSummary" TEXT,
    "aiCategory" "Category" NOT NULL DEFAULT 'UNCLASSIFIED',
    "aiConfidence" DOUBLE PRECISION,
    "status" "Status" NOT NULL DEFAULT 'UNREAD',
    "source" "Source" NOT NULL DEFAULT 'MANUAL',
    "rawAiResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceTag" (
    "referenceId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ReferenceTag_pkey" PRIMARY KEY ("referenceId","tagId")
);

-- CreateTable
CREATE TABLE "VisualDictionary" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "vibeDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisualDictionary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prompt" (
    "id" TEXT NOT NULL,
    "dictionaryId" TEXT NOT NULL,
    "tool" "Tool" NOT NULL,
    "body" TEXT NOT NULL,
    "exampleImageUrl" TEXT,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevCommand" (
    "id" TEXT NOT NULL,
    "category" "DevCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DevCommand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reference_url_key" ON "Reference"("url");

-- CreateIndex
CREATE INDEX "Reference_status_createdAt_idx" ON "Reference"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- AddForeignKey
ALTER TABLE "ReferenceTag" ADD CONSTRAINT "ReferenceTag_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES "Reference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceTag" ADD CONSTRAINT "ReferenceTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_dictionaryId_fkey" FOREIGN KEY ("dictionaryId") REFERENCES "VisualDictionary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
