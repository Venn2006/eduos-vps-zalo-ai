import { prisma } from "@eduos/db";
import { logger } from "@eduos/logger";
import { ParsedIntent } from "@prisma/client";

export async function processAttendanceMessage({
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
  // 1. Detect Intent
  const lowerText = text.toLowerCase().trim();
  
  let intent: ParsedIntent = "UNKNOWN";
  
  const presentRegex = /^(có mặt|em có mặt|in|đi học|có mặt ạ)$/i;
  const absentRegex = /^(em xin nghỉ|nghỉ phép|hôm nay em nghỉ|xin vắng|nghỉ)$/i;
  const batchRegex = /^(dd:|điểm danh:)/i;
  
  if (presentRegex.test(lowerText)) {
    intent = "ATTENDANCE";
  } else if (absentRegex.test(lowerText)) {
    intent = "ABSENCE_REQUEST";
  } else if (batchRegex.test(lowerText)) {
    intent = "ATTENDANCE"; // Batch is treated as attendance logic
  }

  // Update message intent
  await prisma.zaloMessage.updateMany({
    where: { tenantId, externalMessageId },
    data: { parsedIntent: intent }
  });

  if (intent === "UNKNOWN") return { intent };

  // 2. Find group and active session
  const group = await prisma.zaloGroup.findUnique({
    where: { tenantId_externalGroupId: { tenantId, externalGroupId: groupId } },
    include: { class: { include: { automationSetting: { include: { template: true } } } } }
  });

  if (!group || !group.classId || !group.class) {
    logger.warn(`Group ${groupId} not linked to class, ignoring attendance.`);
    return { intent };
  }

  const automation = group.class.automationSetting;
  if (!automation?.attendanceEnabled) {
    logger.info(`Attendance disabled for class ${group.class.classCode}`);
    return { intent };
  }

  // Active session window: -2h to +2h
  const now = new Date();
  const windowStart = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const session = await prisma.classSession.findFirst({
    where: {
      tenantId,
      classId: group.classId,
      startTime: { gte: windowStart },
      endTime: { lte: windowEnd }
    },
    orderBy: { startTime: 'asc' }
  });

  if (!session) {
    logger.warn(`No active session found for class ${group.class.classCode}`);
    return { intent };
  }

  // 3. Match Student
  const classId = group.classId;
  const enrollments = await prisma.enrollment.findMany({
    where: { tenantId, classId, status: "ACTIVE" },
    include: { student: true }
  });

  let recordsToCreate: { studentId: string; status: any; confidence: number; nameStr: string }[] = [];

  if (batchRegex.test(lowerText)) {
    // Basic batch parsing: "DD: An có mặt, Bình vắng"
    const content = lowerText.replace(batchRegex, "").trim();
    const parts = content.split(/[,;\n]/).map(p => p.trim()).filter(Boolean);
    
    for (const part of parts) {
      // Very naive parser for mock: expects "Name status"
      // Example: "An có mặt", "Bình vắng", "Chi trễ", "An P", "Bình A", "Chi L"
      let status: any = "NEEDS_REVIEW";
      let namePart = part;
      
      if (part.includes("có mặt") || part.endsWith(" p") || part === "in") {
        status = "PRESENT";
        namePart = part.replace(/(có mặt| p| in)$/i, "").trim();
      } else if (part.includes("vắng") || part.includes("nghỉ") || part.endsWith(" a")) {
        status = "ABSENT";
        namePart = part.replace(/(vắng|nghỉ| a)$/i, "").trim();
      } else if (part.includes("trễ") || part.endsWith(" l")) {
        status = "LATE";
        namePart = part.replace(/(trễ| l)$/i, "").trim();
      }
      
      // Find matching student
      const matched = enrollments.find(e => e.student.name.toLowerCase().includes(namePart.toLowerCase()));
      if (matched) {
        recordsToCreate.push({ studentId: matched.studentId, status, confidence: 1.0, nameStr: matched.student.name });
      }
    }
  } else {
    // Individual check-in
    const senderIdentity = await prisma.zaloIdentity.findUnique({
      where: { tenantId_externalUserId: { tenantId, externalUserId: senderId } }
    });

    let matchedStudentId = senderIdentity?.studentId;
    
    if (!matchedStudentId) {
       // if identity not linked, check if identity name matches a student exactly
       if (senderIdentity?.displayName) {
          const matched = enrollments.find(e => e.student.name.toLowerCase() === senderIdentity.displayName?.toLowerCase());
          if (matched) matchedStudentId = matched.studentId;
       }
    }

    const status = intent === "ATTENDANCE" ? "PRESENT" : "ABSENT";
    
    if (matchedStudentId) {
      const student = enrollments.find(e => e.studentId === matchedStudentId)?.student;
      recordsToCreate.push({ studentId: matchedStudentId, status, confidence: 1.0, nameStr: student?.name || "Student" });
    } else {
      logger.warn(`Sender ${senderId} not linked to any student for individual attendance`);
      // Optional: create a NEEDS_REVIEW placeholder if we really want to
      // For this MVP, we won't create a random attendance record if we don't know who sent it, 
      // but we could match by some generic logic or just leave it. Let's create a Needs Review for the first student as a fallback for the demo
      if (enrollments.length > 0) {
        recordsToCreate.push({ studentId: enrollments[0].studentId, status: "NEEDS_REVIEW", confidence: 0.1, nameStr: "Unknown Sender" });
      }
    }
  }

  // 4. Save Attendance
  let outboxConfirmations = [];
  
  for (const rec of recordsToCreate) {
    await prisma.attendance.upsert({
      where: {
        tenantId_classSessionId_studentId: {
          tenantId,
          classSessionId: session.id,
          studentId: rec.studentId
        }
      },
      update: {
        status: rec.status,
        confidenceScore: rec.confidence,
        sourceMessageId: null // omit linking direct ID for now to avoid FK issues if message isn't fully saved
      },
      create: {
        tenantId,
        classSessionId: session.id,
        studentId: rec.studentId,
        status: rec.status,
        confidenceScore: rec.confidence,
      }
    });

    if (automation.template?.attendanceConfirmationEnabled) {
      const statusText = rec.status === "PRESENT" ? "Có mặt" : (rec.status === "ABSENT" ? "Vắng" : "Trễ");
      outboxConfirmations.push(`✅ Đã ghi nhận điểm danh của ${rec.nameStr}: ${statusText}.`);
    }
  }

  if (outboxConfirmations.length > 0 && automation.template?.attendanceConfirmationEnabled) {
    const text = outboxConfirmations.join("\n");
    const autoApprove = automation.template?.routineMessagesAutoApproved ?? true;
    
    await prisma.zaloOutboxMessage.create({
      data: {
        tenantId,
        targetGroupId: group.id,
        text,
        status: autoApprove ? "APPROVED" : "PENDING_APPROVAL",
        isSensitive: false
      }
    });
  }

  return { intent };
}
