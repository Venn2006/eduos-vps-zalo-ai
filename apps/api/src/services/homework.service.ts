import { prisma } from "@eduos/db";
import { logger } from "@eduos/logger";
import { ParsedIntent } from "@prisma/client";
import { queueAiGrading } from "./aiGrading.service";

export async function processHomeworkMessage({
  tenantId,
  groupId,
  senderId,
  text,
  externalMessageId
}: {
  tenantId: string;
  groupId: string;
  senderId: string;
  text: string;
  externalMessageId: string;
}): Promise<{ intent: ParsedIntent }> {
  const lowerText = text.toLowerCase().trim();
  let intent: ParsedIntent = "UNKNOWN";

  const assignmentRegex = /^(bt:|bài tập:|hạn:|deadline:)/i;
  const submissionRegex = /^(nộp bài|em nộp bài|bài tập của em)/i;

  if (assignmentRegex.test(lowerText)) {
    intent = "HOMEWORK_ASSIGNMENT";
  } else if (submissionRegex.test(lowerText)) {
    intent = "HOMEWORK_SUBMISSION";
  }

  await prisma.zaloMessage.updateMany({
    where: { tenantId, externalMessageId },
    data: { parsedIntent: intent }
  });

  if (intent === "UNKNOWN") return { intent };

  const group = await prisma.zaloGroup.findUnique({
    where: { tenantId_externalGroupId: { tenantId, externalGroupId: groupId } },
    include: { class: { include: { automationSetting: { include: { template: true } } } } }
  });

  if (!group || !group.classId || !group.class) {
    logger.warn(`Group ${groupId} not linked to class, ignoring homework message.`);
    return { intent };
  }

  const classId = group.classId;

  if (intent === "HOMEWORK_ASSIGNMENT") {
    // Determine Due Date (mock parsing)
    // Ex: "Hạn: 21:00 ngày mai" -> We'll just set it to tomorrow for now
    let dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + 1);
    dueAt.setHours(21, 0, 0, 0);

    const homework = await prisma.homework.create({
      data: {
        tenantId,
        classId,
        title: "Bài tập mới từ Zalo",
        description: text,
        dueAt,
        status: "ASSIGNED"
      }
    });

    const automation = group.class.automationSetting;
    if (automation?.homeworkSubmissionEnabled) {
      const autoApprove = automation.template?.routineMessagesAutoApproved ?? true;
      const status = autoApprove ? "APPROVED" : "PENDING_APPROVAL";
      
      const outboxText = `📚 Bài tập lớp ${group.class.classCode}\n\n${text}\n\n⏰ Hạn nộp: ${dueAt.toLocaleString("vi-VN")}\n\nCác bạn nộp bài bằng cách gửi:\nNộp bài - [Tên của em]`;

      await prisma.zaloOutboxMessage.create({
        data: {
          tenantId,
          targetGroupId: group.id,
          text: outboxText,
          status,
          isSensitive: false
        }
      });
    }
  } else if (intent === "HOMEWORK_SUBMISSION") {
    // Match Student
    const enrollments = await prisma.enrollment.findMany({
      where: { tenantId, classId, status: "ACTIVE" },
      include: { student: true }
    });

    const senderIdentity = await prisma.zaloIdentity.findUnique({
      where: { tenantId_externalUserId: { tenantId, externalUserId: senderId } }
    });

    let matchedStudentId = senderIdentity?.studentId;

    if (!matchedStudentId) {
      // Parse name from "Nộp bài - An"
      const nameMatch = text.match(/nộp bài\s*-\s*(.+)/i);
      if (nameMatch && nameMatch[1]) {
        const namePart = nameMatch[1].trim().toLowerCase();
        const matched = enrollments.find(e => e.student.name.toLowerCase().includes(namePart));
        if (matched) matchedStudentId = matched.studentId;
      }
    }

    if (!matchedStudentId && senderIdentity?.displayName) {
      const matched = enrollments.find(e => e.student.name.toLowerCase() === senderIdentity.displayName?.toLowerCase());
      if (matched) matchedStudentId = matched.studentId;
    }

    // Find active homework
    const activeHomework = await prisma.homework.findFirst({
      where: { tenantId, classId, status: "ASSIGNED" },
      orderBy: { createdAt: 'desc' }
    });

    if (!activeHomework) {
      logger.warn(`No active homework found for class ${group.class.classCode}`);
      return { intent };
    }

    if (matchedStudentId) {
      const submission = await prisma.homeworkSubmission.create({
        data: {
          tenantId,
          homeworkId: activeHomework.id,
          studentId: matchedStudentId,
          status: "SUBMITTED"
        }
      });

      // Reward Ledger
      const now = new Date();
      const eventType = now <= activeHomework.dueAt ? "HOMEWORK_ON_TIME" : "HOMEWORK_LATE";
      const stars = eventType === "HOMEWORK_ON_TIME" ? 5 : 2;
      const coins = eventType === "HOMEWORK_ON_TIME" ? 10 : 5;

      await prisma.rewardLedger.create({
        data: {
          tenantId,
          studentId: matchedStudentId,
          eventType,
          stars,
          coins,
          reason: `Nộp bài tập ${activeHomework.title}`
        }
      });

      // Queue AI Grading
      await queueAiGrading(tenantId, submission.id);

    } else {
      logger.warn(`Sender ${senderId} not linked to any student for homework submission`);
    }
  }

  return { intent };
}
