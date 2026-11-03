-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('RFQ_BUYER_RECEIPT', 'RFQ_VERIFIED_VENDOR_INVITE', 'RFQ_UNCLAIMED_CLAIM_TEASER', 'RFQ_QUOTE_RECEIVED', 'RFQ_QUOTE_AWARDED', 'COMPANY_CLAIM_APPROVED', 'COMPANY_CLAIM_REJECTED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('SENT', 'DRY_RUN_LOGGED', 'FAILED');

-- CreateTable
CREATE TABLE "NotificationDispatch" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'DRY_RUN_LOGGED',
    "recipientEmail" TEXT NOT NULL,
    "recipientPhone" TEXT,
    "subject" TEXT NOT NULL,
    "bodyPreview" TEXT NOT NULL,
    "actionUrl" TEXT NOT NULL,
    "companyId" TEXT,
    "rfqId" TEXT,
    "providerMessageId" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationDispatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationDispatch_type_status_createdAt_idx" ON "NotificationDispatch"("type", "status", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationDispatch_companyId_createdAt_idx" ON "NotificationDispatch"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationDispatch_rfqId_createdAt_idx" ON "NotificationDispatch"("rfqId", "createdAt");

-- AddForeignKey
ALTER TABLE "NotificationDispatch" ADD CONSTRAINT "NotificationDispatch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDispatch" ADD CONSTRAINT "NotificationDispatch_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "Rfq"("id") ON DELETE SET NULL ON UPDATE CASCADE;

