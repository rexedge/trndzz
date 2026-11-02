-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('WHITEPAPER', 'SECTOR_REPORT', 'REGULATORY_GUIDE', 'TRADE_MAGAZINE', 'WEBINAR');

-- CreateTable
CREATE TABLE "KnowledgeResource" (
    "id" TEXT NOT NULL,
    "verticalId" TEXT,
    "categoryId" TEXT,
    "sponsorCompanyId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "contentPreview" TEXT NOT NULL,
    "fullContentMarkdown" TEXT NOT NULL,
    "fileUrl" TEXT,
    "coverImageUrl" TEXT,
    "type" "ResourceType" NOT NULL DEFAULT 'WHITEPAPER',
    "isGated" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "pageCount" INTEGER,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceLead" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "workEmail" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "businessRole" "BusinessRole",
    "procurementTimeline" TEXT,
    "estimatedBudgetBand" TEXT,
    "deliveryState" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeResource_slug_key" ON "KnowledgeResource"("slug");

-- CreateIndex
CREATE INDEX "KnowledgeResource_verticalId_isPublished_publishedAt_idx" ON "KnowledgeResource"("verticalId", "isPublished", "publishedAt");

-- CreateIndex
CREATE INDEX "KnowledgeResource_type_isPublished_idx" ON "KnowledgeResource"("type", "isPublished");

-- CreateIndex
CREATE INDEX "KnowledgeResource_categoryId_idx" ON "KnowledgeResource"("categoryId");

-- CreateIndex
CREATE INDEX "ResourceLead_resourceId_createdAt_idx" ON "ResourceLead"("resourceId", "createdAt");

-- CreateIndex
CREATE INDEX "ResourceLead_workEmail_idx" ON "ResourceLead"("workEmail");

-- CreateIndex
CREATE INDEX "ResourceLead_userId_idx" ON "ResourceLead"("userId");

-- AddForeignKey
ALTER TABLE "KnowledgeResource" ADD CONSTRAINT "KnowledgeResource_verticalId_fkey" FOREIGN KEY ("verticalId") REFERENCES "Vertical"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeResource" ADD CONSTRAINT "KnowledgeResource_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeResource" ADD CONSTRAINT "KnowledgeResource_sponsorCompanyId_fkey" FOREIGN KEY ("sponsorCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceLead" ADD CONSTRAINT "ResourceLead_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "KnowledgeResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceLead" ADD CONSTRAINT "ResourceLead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

