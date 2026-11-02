-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'EDITOR', 'ANALYST', 'USER');

-- CreateEnum
CREATE TYPE "VerticalStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StreamPosition" AS ENUM ('UPSTREAM', 'MIDSTREAM', 'DOWNSTREAM', 'CROSS_STREAM');

-- CreateEnum
CREATE TYPE "SpecInputType" AS ENUM ('SELECT', 'MULTI_SELECT', 'NUMBER', 'TEXT', 'BOOLEAN');

-- CreateEnum
CREATE TYPE "ArticleType" AS ENUM ('NEWS', 'MARKET_BRIEF', 'PRICE_ANALYSIS', 'POLICY_REGULATORY', 'EXECUTIVE_INTERVIEW');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BusinessRole" AS ENUM ('MANUFACTURER', 'IMPORTER', 'PROCESSOR_EXTRUDER', 'DISTRIBUTOR', 'FABRICATOR_INSTALLER', 'EQUIPMENT_SUPPLIER', 'SERVICE_PROVIDER');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('UNCLAIMED', 'CLAIM_PENDING', 'CLAIMED');

-- CreateEnum
CREATE TYPE "VerificationTier" AS ENUM ('UNVERIFIED', 'VERIFIED', 'VERIFIED_PRO', 'ENTERPRISE_SPONSOR');

-- CreateEnum
CREATE TYPE "CompanyMemberRole" AS ENUM ('OWNER', 'ADMIN', 'SALES_REP');

-- CreateEnum
CREATE TYPE "ClaimRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RfqVisibility" AS ENUM ('PUBLIC_BOARD', 'VERIFIED_VENDORS_ONLY', 'INVITED_ONLY');

-- CreateEnum
CREATE TYPE "RfqStatus" AS ENUM ('PENDING_REVIEW', 'OPEN', 'QUOTING', 'AWARDED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RfqMatchStatus" AS ENUM ('MATCHED', 'NOTIFIED', 'VIEWED', 'QUOTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "RfqQuoteStatus" AS ENUM ('SUBMITTED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "phone" TEXT,
    "jobTitle" TEXT,
    "companyName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vertical" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "status" "VerticalStatus" NOT NULL DEFAULT 'DRAFT',
    "themeColor" TEXT,
    "iconName" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vertical_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValueChainStage" (
    "id" TEXT NOT NULL,
    "verticalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "streamPosition" "StreamPosition" NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ValueChainStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "verticalId" TEXT NOT NULL,
    "valueChainStageId" TEXT,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "defaultUnit" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecAttributeDefinition" (
    "id" TEXT NOT NULL,
    "verticalId" TEXT NOT NULL,
    "categoryId" TEXT,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "unit" TEXT,
    "inputType" "SpecInputType" NOT NULL DEFAULT 'SELECT',
    "options" TEXT[],
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isFilterable" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecAttributeDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "verticalId" TEXT,
    "valueChainStageId" TEXT,
    "categoryId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "ArticleType" NOT NULL DEFAULT 'NEWS',
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "isMacroFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isVerticalPinned" BOOLEAN NOT NULL DEFAULT false,
    "featuredImageUrl" TEXT,
    "featuredImageAlt" TEXT,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "focusKeyword" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommodityIndicator" (
    "id" TEXT NOT NULL,
    "verticalId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "latestPrice" DECIMAL(18,4) NOT NULL,
    "previousPrice" DECIMAL(18,4),
    "changePercent" DECIMAL(8,4),
    "sourceLabel" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommodityIndicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommodityPricePoint" (
    "id" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "price" DECIMAL(18,4) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "CommodityPricePoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "businessRoles" "BusinessRole"[],
    "claimStatus" "ClaimStatus" NOT NULL DEFAULT 'UNCLAIMED',
    "verificationTier" "VerificationTier" NOT NULL DEFAULT 'UNVERIFIED',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "websiteUrl" TEXT,
    "publicEmail" TEXT,
    "publicPhone" TEXT,
    "whatsappNumber" TEXT,
    "country" TEXT NOT NULL DEFAULT 'NG',
    "headquartersState" TEXT NOT NULL,
    "city" TEXT,
    "address" TEXT,
    "coverageStates" TEXT[],
    "yearEstablished" INTEGER,
    "employeeCountRange" TEXT,
    "productionCapacity" TEXT,
    "minimumOrderSummary" TEXT,
    "rcNumber" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyVertical" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "verticalId" TEXT NOT NULL,
    "streamPositions" "StreamPosition"[],
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyVertical_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyCategory" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "CompanyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyCertification" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT,
    "certificateNumber" TEXT,
    "documentUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyMember" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CompanyMemberRole" NOT NULL DEFAULT 'SALES_REP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyClaimRequest" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "workEmail" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "rcNumber" TEXT,
    "proofDocumentUrl" TEXT,
    "message" TEXT,
    "status" "ClaimRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyClaimRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyProduct" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "verticalId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "specifications" JSONB NOT NULL DEFAULT '{}',
    "unit" TEXT NOT NULL DEFAULT 'MT',
    "minOrderQty" DECIMAL(14,3),
    "indicativeMin" DECIMAL(18,4),
    "indicativeMax" DECIMAL(18,4),
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "imageUrl" TEXT,
    "datasheetUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rfq" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "verticalId" TEXT NOT NULL,
    "valueChainStageId" TEXT,
    "categoryId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "buyerCompanyName" TEXT NOT NULL,
    "buyerContactName" TEXT NOT NULL,
    "buyerContactEmail" TEXT NOT NULL,
    "buyerContactPhone" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "specifications" JSONB NOT NULL DEFAULT '{}',
    "additionalNotes" TEXT,
    "attachmentUrl" TEXT,
    "quantity" DECIMAL(14,3) NOT NULL,
    "unit" TEXT NOT NULL,
    "targetUnitPrice" DECIMAL(18,4),
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "deliveryState" TEXT NOT NULL,
    "deliveryCity" TEXT,
    "requiredByDate" TIMESTAMP(3),
    "paymentTermsPreference" TEXT,
    "visibility" "RfqVisibility" NOT NULL DEFAULT 'VERIFIED_VENDORS_ONLY',
    "status" "RfqStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "preferredRoles" "BusinessRole"[],
    "sourceArticleId" TEXT,
    "targetCompanyId" TEXT,
    "allowPeerQuotes" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rfq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RfqVendorMatch" (
    "id" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" "RfqMatchStatus" NOT NULL DEFAULT 'MATCHED',
    "matchScore" INTEGER NOT NULL DEFAULT 100,
    "matchReason" TEXT,
    "notifiedAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RfqVendorMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RfqQuote" (
    "id" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "unitPrice" DECIMAL(18,4) NOT NULL,
    "totalPrice" DECIMAL(18,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "minimumOrderQty" DECIMAL(14,3),
    "leadTimeDays" INTEGER NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "paymentTerms" TEXT NOT NULL,
    "complianceNotes" TEXT,
    "attachmentUrl" TEXT,
    "status" "RfqQuoteStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RfqQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleCompanyMention" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "contextLabel" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleCompanyMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformStats" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "activeVerticals" INTEGER NOT NULL DEFAULT 1,
    "indexedCompanies" INTEGER NOT NULL DEFAULT 0,
    "verifiedSuppliers" INTEGER NOT NULL DEFAULT 0,
    "openRfqsCount" INTEGER NOT NULL DEFAULT 0,
    "monthlyReaders" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Vertical_name_key" ON "Vertical"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Vertical_slug_key" ON "Vertical"("slug");

-- CreateIndex
CREATE INDEX "Vertical_slug_status_idx" ON "Vertical"("slug", "status");

-- CreateIndex
CREATE INDEX "Vertical_displayOrder_idx" ON "Vertical"("displayOrder");

-- CreateIndex
CREATE INDEX "ValueChainStage_verticalId_streamPosition_idx" ON "ValueChainStage"("verticalId", "streamPosition");

-- CreateIndex
CREATE UNIQUE INDEX "ValueChainStage_verticalId_slug_key" ON "ValueChainStage"("verticalId", "slug");

-- CreateIndex
CREATE INDEX "Category_verticalId_valueChainStageId_idx" ON "Category"("verticalId", "valueChainStageId");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_verticalId_slug_key" ON "Category"("verticalId", "slug");

-- CreateIndex
CREATE INDEX "SpecAttributeDefinition_verticalId_categoryId_idx" ON "SpecAttributeDefinition"("verticalId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "SpecAttributeDefinition_verticalId_categoryId_key_key" ON "SpecAttributeDefinition"("verticalId", "categoryId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_verticalId_status_publishedAt_idx" ON "Article"("verticalId", "status", "publishedAt");

-- CreateIndex
CREATE INDEX "Article_isMacroFeatured_status_publishedAt_idx" ON "Article"("isMacroFeatured", "status", "publishedAt");

-- CreateIndex
CREATE INDEX "Article_valueChainStageId_idx" ON "Article"("valueChainStageId");

-- CreateIndex
CREATE INDEX "Article_categoryId_idx" ON "Article"("categoryId");

-- CreateIndex
CREATE INDEX "Article_type_idx" ON "Article"("type");

-- CreateIndex
CREATE INDEX "Article_authorId_idx" ON "Article"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "CommodityIndicator_code_key" ON "CommodityIndicator"("code");

-- CreateIndex
CREATE INDEX "CommodityIndicator_verticalId_isActive_displayOrder_idx" ON "CommodityIndicator"("verticalId", "isActive", "displayOrder");

-- CreateIndex
CREATE INDEX "CommodityPricePoint_indicatorId_recordedAt_idx" ON "CommodityPricePoint"("indicatorId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Company_claimStatus_idx" ON "Company"("claimStatus");

-- CreateIndex
CREATE INDEX "Company_verificationTier_idx" ON "Company"("verificationTier");

-- CreateIndex
CREATE INDEX "Company_headquartersState_idx" ON "Company"("headquartersState");

-- CreateIndex
CREATE INDEX "Company_isPublished_idx" ON "Company"("isPublished");

-- CreateIndex
CREATE INDEX "CompanyVertical_verticalId_idx" ON "CompanyVertical"("verticalId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyVertical_companyId_verticalId_key" ON "CompanyVertical"("companyId", "verticalId");

-- CreateIndex
CREATE INDEX "CompanyCategory_categoryId_idx" ON "CompanyCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyCategory_companyId_categoryId_key" ON "CompanyCategory"("companyId", "categoryId");

-- CreateIndex
CREATE INDEX "CompanyCertification_companyId_idx" ON "CompanyCertification"("companyId");

-- CreateIndex
CREATE INDEX "CompanyMember_userId_idx" ON "CompanyMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMember_companyId_userId_key" ON "CompanyMember"("companyId", "userId");

-- CreateIndex
CREATE INDEX "CompanyClaimRequest_companyId_status_idx" ON "CompanyClaimRequest"("companyId", "status");

-- CreateIndex
CREATE INDEX "CompanyClaimRequest_requesterId_idx" ON "CompanyClaimRequest"("requesterId");

-- CreateIndex
CREATE INDEX "CompanyClaimRequest_status_createdAt_idx" ON "CompanyClaimRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CompanyProduct_verticalId_categoryId_isActive_idx" ON "CompanyProduct"("verticalId", "categoryId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyProduct_companyId_slug_key" ON "CompanyProduct"("companyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Rfq_referenceNumber_key" ON "Rfq"("referenceNumber");

-- CreateIndex
CREATE INDEX "Rfq_verticalId_status_createdAt_idx" ON "Rfq"("verticalId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Rfq_categoryId_status_idx" ON "Rfq"("categoryId", "status");

-- CreateIndex
CREATE INDEX "Rfq_buyerId_createdAt_idx" ON "Rfq"("buyerId", "createdAt");

-- CreateIndex
CREATE INDEX "Rfq_sourceArticleId_idx" ON "Rfq"("sourceArticleId");

-- CreateIndex
CREATE INDEX "Rfq_targetCompanyId_idx" ON "Rfq"("targetCompanyId");

-- CreateIndex
CREATE INDEX "RfqVendorMatch_companyId_status_createdAt_idx" ON "RfqVendorMatch"("companyId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RfqVendorMatch_rfqId_companyId_key" ON "RfqVendorMatch"("rfqId", "companyId");

-- CreateIndex
CREATE INDEX "RfqQuote_rfqId_status_idx" ON "RfqQuote"("rfqId", "status");

-- CreateIndex
CREATE INDEX "RfqQuote_companyId_createdAt_idx" ON "RfqQuote"("companyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RfqQuote_rfqId_companyId_key" ON "RfqQuote"("rfqId", "companyId");

-- CreateIndex
CREATE INDEX "ArticleCompanyMention_companyId_idx" ON "ArticleCompanyMention"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleCompanyMention_articleId_companyId_key" ON "ArticleCompanyMention"("articleId", "companyId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValueChainStage" ADD CONSTRAINT "ValueChainStage_verticalId_fkey" FOREIGN KEY ("verticalId") REFERENCES "Vertical"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_verticalId_fkey" FOREIGN KEY ("verticalId") REFERENCES "Vertical"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_valueChainStageId_fkey" FOREIGN KEY ("valueChainStageId") REFERENCES "ValueChainStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecAttributeDefinition" ADD CONSTRAINT "SpecAttributeDefinition_verticalId_fkey" FOREIGN KEY ("verticalId") REFERENCES "Vertical"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecAttributeDefinition" ADD CONSTRAINT "SpecAttributeDefinition_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_verticalId_fkey" FOREIGN KEY ("verticalId") REFERENCES "Vertical"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_valueChainStageId_fkey" FOREIGN KEY ("valueChainStageId") REFERENCES "ValueChainStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommodityIndicator" ADD CONSTRAINT "CommodityIndicator_verticalId_fkey" FOREIGN KEY ("verticalId") REFERENCES "Vertical"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommodityPricePoint" ADD CONSTRAINT "CommodityPricePoint_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "CommodityIndicator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyVertical" ADD CONSTRAINT "CompanyVertical_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyVertical" ADD CONSTRAINT "CompanyVertical_verticalId_fkey" FOREIGN KEY ("verticalId") REFERENCES "Vertical"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCategory" ADD CONSTRAINT "CompanyCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCategory" ADD CONSTRAINT "CompanyCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCertification" ADD CONSTRAINT "CompanyCertification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyClaimRequest" ADD CONSTRAINT "CompanyClaimRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyClaimRequest" ADD CONSTRAINT "CompanyClaimRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyClaimRequest" ADD CONSTRAINT "CompanyClaimRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyProduct" ADD CONSTRAINT "CompanyProduct_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyProduct" ADD CONSTRAINT "CompanyProduct_verticalId_fkey" FOREIGN KEY ("verticalId") REFERENCES "Vertical"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyProduct" ADD CONSTRAINT "CompanyProduct_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rfq" ADD CONSTRAINT "Rfq_verticalId_fkey" FOREIGN KEY ("verticalId") REFERENCES "Vertical"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rfq" ADD CONSTRAINT "Rfq_valueChainStageId_fkey" FOREIGN KEY ("valueChainStageId") REFERENCES "ValueChainStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rfq" ADD CONSTRAINT "Rfq_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rfq" ADD CONSTRAINT "Rfq_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rfq" ADD CONSTRAINT "Rfq_sourceArticleId_fkey" FOREIGN KEY ("sourceArticleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rfq" ADD CONSTRAINT "Rfq_targetCompanyId_fkey" FOREIGN KEY ("targetCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RfqVendorMatch" ADD CONSTRAINT "RfqVendorMatch_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "Rfq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RfqVendorMatch" ADD CONSTRAINT "RfqVendorMatch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RfqQuote" ADD CONSTRAINT "RfqQuote_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "Rfq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RfqQuote" ADD CONSTRAINT "RfqQuote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RfqQuote" ADD CONSTRAINT "RfqQuote_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCompanyMention" ADD CONSTRAINT "ArticleCompanyMention_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCompanyMention" ADD CONSTRAINT "ArticleCompanyMention_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

