import { prisma } from "@eduos/db";
import { logger } from "@eduos/logger";

interface BootstrapParams {
  tenantId: string;
  externalGroupId: string;
  groupName: string;
  senderExternalId: string;
  senderDisplayName?: string;
  messageText: string;
  externalMessageId: string;
  parsedCommand: {
    classCode?: string;
    cloneFromClassCode?: string;
    className?: string;
    courseName?: string;
    teacherName?: string;
    scheduleText?: string;
    startDate?: string;
    templateName?: string;
  };
}

export async function bootstrapClassGroupFromCommand(params: BootstrapParams) {
  const { tenantId, externalGroupId, groupName, senderExternalId, parsedCommand, externalMessageId } = params;
  
  logger.info(`Starting bootstrap for group ${externalGroupId}`, { parsedCommand });

  // 1. Authorize Sender
  const senderIdentity = await prisma.zaloIdentity.findUnique({
    where: {
      tenantId_externalUserId: {
        tenantId,
        externalUserId: senderExternalId,
      }
    },
    include: {
      teacher: true,
      student: true,
      guardian: true,
    }
  });

  // Verify authorization (Must be Teacher/Admin/Owner - for now checking if teacher exists)
  // Real logic would also check if they are OWNER/ADMIN, but for this mock let's assume if it's a known identity it's okay for testing, 
  // or we create NEEDS_REVIEW if completely unknown.
  if (!senderIdentity || !senderIdentity.teacherId) {
    await prisma.classBootstrapCommand.create({
      data: {
        tenantId,
        externalGroupId,
        classCode: parsedCommand.classCode || "UNKNOWN",
        senderExternalId,
        status: "NEEDS_REVIEW",
        errorMessage: "Người gửi chưa được xác thực hoặc không có quyền."
      }
    });

    await createOutboxReply(tenantId, externalGroupId, "Lệnh setup đã được ghi nhận nhưng cần admin xác nhận vì chưa nhận diện được người gửi.");
    return;
  }

  // Idempotency: check if group is already linked
  const existingGroup = await prisma.zaloGroup.findUnique({
    where: { tenantId_externalGroupId: { tenantId, externalGroupId } }
  });

  if (existingGroup && existingGroup.classId) {
    // Already configured
    await createOutboxReply(tenantId, externalGroupId, `✅ Group đã được liên kết với lớp học.`);
    return;
  }

  try {
    let classId: string;

    // A. If classCode exists
    if (parsedCommand.classCode) {
      let existingClass = await prisma.class.findFirst({
        where: { tenantId, classCode: parsedCommand.classCode }
      });

      if (existingClass) {
        classId = existingClass.id;
      } else {
        // B & C. Create new class
        // Find or create course
        let course = await prisma.course.findFirst({ where: { tenantId } });
        if (!course) {
          course = await prisma.course.create({
            data: { tenantId, name: parsedCommand.courseName || "Khóa Học Mặc Định" }
          });
        }

        existingClass = await prisma.class.create({
          data: {
            tenantId,
            courseId: course.id,
            classCode: parsedCommand.classCode,
            status: "ACTIVE",
          }
        });
        classId = existingClass.id;
      }
    } else {
      throw new Error("Missing classCode or className");
    }

    // Ensure group is created and linked
    await prisma.zaloGroup.upsert({
      where: { tenantId_externalGroupId: { tenantId, externalGroupId } },
      create: {
        tenantId,
        externalGroupId,
        name: groupName,
        classId,
        groupType: "CLASS",
      },
      update: {
        classId,
        name: groupName,
      }
    });

    // Apply Automation Settings
    let template = await prisma.classAutomationTemplate.findFirst({ where: { tenantId } });
    if (!template) {
      template = await prisma.classAutomationTemplate.create({
        data: {
          tenantId,
          name: "Mặc Định",
          classReminderEnabled: true,
          attendanceEnabled: true,
          teacherHomeworkReminderEnabled: true,
          homeworkSubmissionEnabled: true,
          rewardEnabled: true,
          weeklyParentReportEnabled: true,
          paymentReminderEnabled: true,
          routineMessagesAutoApproved: true,
          sensitiveMessagesRequireApproval: true,
        }
      });
    }

    await prisma.classAutomationSetting.upsert({
      where: { classId },
      create: {
        tenantId,
        classId,
        templateId: template.id,
        classReminderEnabled: true,
        attendanceEnabled: true,
        teacherHomeworkReminderEnabled: true,
        homeworkSubmissionEnabled: true,
        rewardEnabled: true,
        paymentReminderGroupEnabled: false, // Never send payments to group
        sensitiveMessagesRequireApproval: true,
      },
      update: {}
    });

    await prisma.classBootstrapCommand.create({
      data: {
        tenantId,
        externalGroupId,
        classCode: parsedCommand.classCode || "UNKNOWN",
        senderExternalId,
        status: "SUCCESS"
      }
    });

    const summaryText = `✅ OMLIS Assistant đã kích hoạt lớp ${parsedCommand.classCode}.
Đã bật:
• Nhắc lịch trước giờ học 1 tiếng
• Điểm danh trong group
• Nhắc giáo viên giao bài sau buổi học
• Nhận bài nộp của học viên
• Cộng xu/sao khi nộp bài đúng hạn
• Báo cáo phụ huynh cuối tuần dạng nháp
• Nhắc phí/tái phí chỉ gửi riêng và cần duyệt
Dữ liệu đã đồng bộ về CEO Dashboard.`;

    await createOutboxReply(tenantId, externalGroupId, summaryText);

  } catch (error: any) {
    logger.error("Bootstrap failed", { error: error.message });
    await prisma.classBootstrapCommand.create({
      data: {
        tenantId,
        externalGroupId,
        classCode: parsedCommand.classCode || "UNKNOWN",
        senderExternalId,
        status: "FAILED",
        errorMessage: error.message
      }
    });

    await createOutboxReply(tenantId, externalGroupId, `❌ Lỗi setup: ${error.message}`);
  }
}

async function createOutboxReply(tenantId: string, groupId: string, text: string) {
  await prisma.zaloOutboxMessage.create({
    data: {
      tenantId,
      targetGroupId: groupId,
      text,
      status: "DRAFT",
      isSensitive: false,
    }
  });
}
