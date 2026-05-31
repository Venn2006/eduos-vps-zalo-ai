import cron from "node-cron";
import { prisma } from "@eduos/db";
import { logger } from "@eduos/logger";

export function initClassReminderScheduler() {
  logger.info("Initializing Class Reminder Scheduler (runs every minute)");
  
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      // Target time is 60 minutes from now.
      const targetTime = new Date(now.getTime() + 60 * 60 * 1000);
      
      const startWindow = new Date(targetTime.getFullYear(), targetTime.getMonth(), targetTime.getDate(), targetTime.getHours(), targetTime.getMinutes(), 0, 0);
      const endWindow = new Date(targetTime.getFullYear(), targetTime.getMonth(), targetTime.getDate(), targetTime.getHours(), targetTime.getMinutes(), 59, 999);

      const sessions = await prisma.classSession.findMany({
        where: {
          startTime: {
            gte: startWindow,
            lte: endWindow,
          },
          status: "SCHEDULED",
          class: {
            zaloGroup: {
              isNot: null,
            },
            automationSetting: {
              classReminderEnabled: true,
              classReminderMinutesBefore: 60,
            }
          }
        },
        include: {
          class: {
            include: {
              zaloGroup: true,
              automationSetting: {
                include: {
                  template: true
                }
              },
              teacher: true,
            }
          },
        }
      });

      for (const session of sessions) {
        if (!session.class.zaloGroup) continue;
        
        const tenantId = session.tenantId;
        const sessionId = session.id;
        const taskKey = `${tenantId}_${sessionId}_CLASS_REMINDER_60M`;

        // Idempotency check
        const existingTask = await prisma.scheduledTaskRun.findFirst({
          where: {
            tenantId,
            targetId: sessionId,
            taskName: taskKey
          }
        });

        if (existingTask) continue;

        // Create Outbox message
        const startTimeStr = session.startTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
        const endTimeStr = session.endTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
        const teacherName = session.class.teacher?.name || "Giáo viên";
        const className = session.class.classCode;
        const adminPhone = "091 900 23 58";

        let text = `📚 Nhắc lịch lớp ${className}\n\nHôm nay lớp mình học lúc ${startTimeStr} - ${endTimeStr}.\nGiáo viên: ${teacherName}\n\nCác bạn chuẩn bị bài và vào lớp đúng giờ nhé.`;

        const template = await prisma.zaloMessageTemplate.findFirst({
          where: { tenantId, name: "CLASS_REMINDER_60M" }
        });

        if (template) {
          text = template.content
            .replace(/\[className\]/g, className)
            .replace(/\[startTime\]/g, startTimeStr)
            .replace(/\[endTime\]/g, endTimeStr)
            .replace(/\[teacherName\]/g, teacherName)
            .replace(/\[adminPhone\]/g, adminPhone);
        }

        const autoApprove = session.class.automationSetting?.template?.routineMessagesAutoApproved ?? true;
        const status = autoApprove ? "APPROVED" : "PENDING_APPROVAL";

        await prisma.$transaction([
          prisma.zaloOutboxMessage.create({
            data: {
              tenantId,
              targetGroupId: session.class.zaloGroup.id,
              text,
              status,
              isSensitive: false,
            }
          }),
          prisma.scheduledTaskRun.create({
            data: {
              tenantId,
              taskName: taskKey,
              targetId: sessionId,
              status: "COMPLETED"
            }
          })
        ]);

        logger.info(`[Scheduler] Scheduled reminder for session ${sessionId} to group ${session.class.zaloGroup.externalGroupId}`);
      }
    } catch (e: any) {
      logger.error("[Scheduler] Error running class reminder scheduler", { error: e.message });
    }
  });
}
