-- Add new columns to TrialBooking (snapshot fields)
ALTER TABLE "TrialBooking" ADD COLUMN IF NOT EXISTS "studentNameSnapshot" TEXT;
ALTER TABLE "TrialBooking" ADD COLUMN IF NOT EXISTS "parentNameSnapshot" TEXT;
ALTER TABLE "TrialBooking" ADD COLUMN IF NOT EXISTS "phoneSnapshot" TEXT;
ALTER TABLE "TrialBooking" ADD COLUMN IF NOT EXISTS "interestedCourseSnapshot" TEXT;
ALTER TABLE "TrialBooking" ADD COLUMN IF NOT EXISTS "noteSnapshot" TEXT;
ALTER TABLE "TrialBooking" ADD COLUMN IF NOT EXISTS "reminderSent24h" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TrialBooking" ADD COLUMN IF NOT EXISTS "reminderSent3h" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TrialBooking" ADD COLUMN IF NOT EXISTS "reminderSent1h" BOOLEAN NOT NULL DEFAULT false;

-- Migrate existing snapshot data
UPDATE "TrialBooking" SET "studentNameSnapshot" = "studentName" WHERE "studentName" IS NOT NULL;
UPDATE "TrialBooking" SET "parentNameSnapshot" = "parentName" WHERE "parentName" IS NOT NULL;
UPDATE "TrialBooking" SET "phoneSnapshot" = "phone" WHERE "phone" IS NOT NULL;
UPDATE "TrialBooking" SET "noteSnapshot" = "notes" WHERE "notes" IS NOT NULL;

-- Drop old columns
ALTER TABLE "TrialBooking" DROP COLUMN IF EXISTS "studentName";
ALTER TABLE "TrialBooking" DROP COLUMN IF EXISTS "parentName";
ALTER TABLE "TrialBooking" DROP COLUMN IF EXISTS "phone";
ALTER TABLE "TrialBooking" DROP COLUMN IF EXISTS "notes";

-- Add new columns to Lead
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "lastCallOutcome" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- Add new TrialBookingStatus enum values (PostgreSQL)
ALTER TYPE "TrialBookingStatus" ADD VALUE IF NOT EXISTS 'REMINDED';
ALTER TYPE "TrialBookingStatus" ADD VALUE IF NOT EXISTS 'CONVERTED';
