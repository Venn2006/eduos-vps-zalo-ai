-- AlterTable
ALTER TABLE "ClassAutomationSetting" ADD COLUMN     "attendanceEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "classReminderEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "classReminderMinutesBefore" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "homeworkSubmissionEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "paymentReminderGroupEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rewardEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sensitiveMessagesRequireApproval" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "teacherHomeworkReminderEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "teacherHomeworkReminderMinutesAfterClass" INTEGER NOT NULL DEFAULT 15;

-- AlterTable
ALTER TABLE "ZaloGroupMember" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "ZaloMessageTemplate" ADD COLUMN     "category" TEXT,
ADD COLUMN     "channel" "Channel",
ADD COLUMN     "groupSafe" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSensitive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requiresApproval" BOOLEAN NOT NULL DEFAULT false;
