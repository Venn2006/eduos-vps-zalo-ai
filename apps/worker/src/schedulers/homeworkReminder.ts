import cron from "node-cron";
import { prisma } from "@eduos/db";
import { logger } from "@eduos/logger";

export function initHomeworkReminderScheduler() {
  logger.info("Initializing Homework Reminder Scheduler (runs every minute)");
  
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      
      const sessions = await prisma.classSession.findMany({
        where: {
          endTime: {
            lte: now
          },
          status: "SCHEDULED",
          class: {
            zaloGroup: {
              isNot: null,
            },
            automationSetting: {
              teacherHomeworkReminderEnabled: true,
            }
          }
        },
        include: {
          class: {
            include: {
              zaloGroup: true,
              teacher: {
                include: {
                  zaloIdentities: true
                }
              },
              automationSetting: {
                include: {
                  template: true
                }
              },
            }
          },
          homeworks: true,
        }
      });

      for (const session of sessions) {
        if (!session.class.zaloGroup && !session.class.teacher) continue;
        if (session.homeworks.length > 0) continue; // Already has homework assigned
        
        const reminderMinutes = session.class.automationSetting?.teacherHomeworkReminderMinutesAfterClass ?? 15;
        
        // Target time is exact end time + reminder minutes
        const targetTime = new Date(session.endTime.getTime() + reminderMinutes * 60 * 1000);
        
        // Check if now is within the 1-minute window after target time
        // E.g., if target time is 10:15:00, and now is 10:15:30, it triggers.
        if (now < targetTime || now > new Date(targetTime.getTime() + 2 * 60 * 1000)) {
          continue; // Not the exact time to remind yet, or too late
        }

        const tenantId = session.tenantId;
        const sessionId = session.id;
        const taskKey = `${tenantId}_${sessionId}_TEACHER_HOMEWORK_REMINDER`;

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
        const className = session.class.classCode;
        
        let text = `Thầy/cô ơi, lớp ${className} vừa kết thúc nhưng chưa có bài tập về nhà.\n\nThầy/cô có thể gửi bài tập theo mẫu:\nBT: [nội dung bài tập]\nHạn: [ngày/giờ nộp]`;

        const template = await prisma.zaloMessageTemplate.findFirst({
          where: { tenantId, name: "TEACHER_HOMEWORK_REMINDER" }
        });

        if (template) {
          text = template.content.replace(/\[className\]/g, className);
        }

        let targetGroupId: string | null = null;
        let targetIdentityId: string | null = null;

        // Preferred channel: Private/direct to the assigned teacher's ZaloIdentity
        const teacher = session.class.teacher;
        if (teacher && teacher.zaloIdentities.length > 0) {
          targetIdentityId = teacher.zaloIdentities[0].id; // Use first linked identity
        } else {
          // Secondary channel: Internal teacher/admin Zalo group
          const internalGroup = await prisma.zaloGroup.findFirst({
            where: {
              tenantId,
              groupType: { in: ["TEACHER", "ADMIN"] },
              isActive: true
            }
          });
          if (internalGroup) {
            targetGroupId = internalGroup.id;
          }
        }

        const autoApprove = session.class.automationSetting?.template?.routineMessagesAutoApproved ?? true;
        
        // Fallback: Create ZaloOutboxMessage with status PENDING_APPROVAL
        const hasTarget = targetGroupId || targetIdentityId;
        const status = (hasTarget && autoApprove) ? "APPROVED" : "PENDING_APPROVAL";

        await prisma.$transaction([
          prisma.zaloOutboxMessage.create({
            data: {
              tenantId,
              targetGroupId,
              targetIdentityId,
              text,
              status,
              isSensitive: true, 
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

        if (hasTarget) {
          logger.info(`[Scheduler] Scheduled homework reminder for session ${sessionId} to teacher/internal group`);
        } else {
          logger.info(`[Scheduler] Created fallback pending homework reminder for session ${sessionId} (no teacher identity or internal group)`);
        }
      }
    } catch (e: any) {
      logger.error("[Scheduler] Error running homework reminder scheduler", { error: e.message });
    }
  });
}
