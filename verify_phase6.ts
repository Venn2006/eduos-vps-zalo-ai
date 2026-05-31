import { prisma } from "@eduos/db";

async function verify() {
  const hwCount = await prisma.homework.count();
  const subCount = await prisma.homeworkSubmission.count();
  const draftCount = await prisma.aiGradeDraft.count();
  const rewardCount = await prisma.rewardLedger.count();
  const teacherReminders = await prisma.zaloOutboxMessage.count({
    where: {
      text: { contains: "chưa có bài tập về nhà" },
      targetGroupId: { not: null } // The rule was NOT to send to class group.
    }
  });
  
  console.log("--- PHASE 6 VERIFICATION ---");
  console.log(`Homework > 0: ${hwCount > 0} (${hwCount})`);
  console.log(`HomeworkSubmission > 0: ${subCount > 0} (${subCount})`);
  console.log(`AiGradeDraft > 0: ${draftCount > 0} (${draftCount})`);
  console.log(`RewardLedger > 0: ${rewardCount > 0} (${rewardCount})`);
  
  // To check if teacher reminder went to class group, we need to know the group type.
  // Actually, we can check all outbox messages containing the reminder.
  const reminders = await prisma.zaloOutboxMessage.findMany({
    where: { text: { contains: "chưa có bài tập về nhà" } },
    include: { tenant: true }
  });
  
  let failedRule = false;
  for (const r of reminders) {
    if (r.targetGroupId) {
      const group = await prisma.zaloGroup.findUnique({ where: { id: r.targetGroupId }});
      if (group?.groupType === "CLASS") {
        console.log(`[FAIL] Teacher reminder sent to CLASS group: ${group.name}`);
        failedRule = true;
      }
    }
  }
  
  console.log(`No teacher reminder sent to class group: ${!failedRule}`);
  
  console.log("Verification Complete");
  process.exit(0);
}

verify().catch(console.error);
