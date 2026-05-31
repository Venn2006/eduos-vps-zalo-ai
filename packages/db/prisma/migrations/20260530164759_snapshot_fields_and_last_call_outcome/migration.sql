/*
  Warnings:

  - The `lastCallOutcome` column on the `Lead` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "lastCallOutcome",
ADD COLUMN     "lastCallOutcome" "CallOutcome";

-- CreateIndex
CREATE INDEX "TrialBooking_tenantId_trialDate_idx" ON "TrialBooking"("tenantId", "trialDate");
