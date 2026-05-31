-- CreateEnum
CREATE TYPE "CallOutcome" AS ENUM ('NO_ANSWER', 'BUSY_CALLBACK', 'WRONG_NUMBER', 'INTERESTED', 'NOT_INTERESTED', 'ASKED_PRICE', 'NEEDS_PARENT_APPROVAL', 'BOOKED_TRIAL', 'ATTENDED_TRIAL', 'PAID', 'LOST');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TrialBookingStatus" ADD VALUE 'REMINDED';
ALTER TYPE "TrialBookingStatus" ADD VALUE 'CONVERTED';

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "batchId" TEXT,
ADD COLUMN     "callCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "interestedCourseId" TEXT,
ADD COLUMN     "lastCallAt" TIMESTAMP(3),
ADD COLUMN     "lostReason" TEXT,
ADD COLUMN     "nextFollowUpAt" TIMESTAMP(3),
ADD COLUMN     "parentName" TEXT,
ADD COLUMN     "studentName" TEXT;

-- AlterTable
ALTER TABLE "TrialBooking" ADD COLUMN     "assignedSaleId" TEXT,
ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "parentName" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "studentName" TEXT;

-- CreateTable
CREATE TABLE "LeadBatch" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT,
    "importedBy" TEXT,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalLeads" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "LeadBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallAttempt" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "saleId" TEXT,
    "outcome" "CallOutcome" NOT NULL,
    "notes" TEXT,
    "duration" INTEGER,
    "calledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeadBatch_tenantId_idx" ON "LeadBatch"("tenantId");

-- CreateIndex
CREATE INDEX "CallAttempt_tenantId_leadId_idx" ON "CallAttempt"("tenantId", "leadId");

-- CreateIndex
CREATE INDEX "Lead_tenantId_assignedToId_idx" ON "Lead"("tenantId", "assignedToId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "LeadBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_interestedCourseId_fkey" FOREIGN KEY ("interestedCourseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrialBooking" ADD CONSTRAINT "TrialBooking_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadBatch" ADD CONSTRAINT "LeadBatch_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallAttempt" ADD CONSTRAINT "CallAttempt_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallAttempt" ADD CONSTRAINT "CallAttempt_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
