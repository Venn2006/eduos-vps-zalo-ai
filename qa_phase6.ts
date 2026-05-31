import { prisma } from "@eduos/db";
import { processHomeworkMessage } from "./apps/api/src/services/homework.service";

async function runQa() {
  const tenant = await prisma.tenant.findFirst({ where: { name: "Trung Tâm Ngoại Ngữ OMLIS" } });
  if (!tenant) throw new Error("No tenant");

  const classRecord = await prisma.class.findFirst({ where: { tenantId: tenant.id }});
  if (!classRecord) throw new Error("No class");

  const group = await prisma.zaloGroup.findFirst({ where: { classId: classRecord.id }});
  if (!group) throw new Error("No group");

  // Mock assignment
  console.log("Mocking assignment...");
  await processHomeworkMessage({
    tenantId: tenant.id,
    groupId: group.externalGroupId,
    senderId: "teacher-zalo-id",
    text: "BT: Làm bài trang 32\nHạn: 21:00 ngày mai",
    externalMessageId: "msg-1"
  });

  const homework = await prisma.homework.findFirst({ where: { tenantId: tenant.id, classId: classRecord.id } });
  console.log("Created homework:", homework);

  // Mock submission
  console.log("Mocking submission...");
  await processHomeworkMessage({
    tenantId: tenant.id,
    groupId: group.externalGroupId,
    senderId: "student-zalo-id",
    text: "Nộp bài - Student 0",
    externalMessageId: "msg-2"
  });

  const submission = await prisma.homeworkSubmission.findFirst({ where: { homeworkId: homework?.id } });
  console.log("Created submission:", submission);

  console.log("Waiting for AI grading mock to complete (3s)...");
  await new Promise(resolve => setTimeout(resolve, 3000));

  const gradedSubmission = await prisma.homeworkSubmission.findFirst({
    where: { id: submission?.id },
    include: { aiGradeDrafts: true }
  });
  console.log("Graded submission:", gradedSubmission);
}

runQa().catch(console.error).finally(() => process.exit(0));
