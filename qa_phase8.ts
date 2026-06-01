import { prisma } from "./packages/db";
import { generateWeeklyParentReportsForTenant, approveParentReport } from "./apps/api/src/services/report.service";
import { processParentReportDeliveries } from "./apps/api/src/services/parentReportWorker";
import { connectorsRouter } from "./apps/api/src/routes/connectors"; // We'll just test the DB state for connectors

async function runQA() {
  console.log("=== Phase 8 QA Start ===");
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) throw new Error("No tenant found");
  const tenantId = tenant.id;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  const weekEnd = now;

  console.log("Generating Parent Reports...");
  const { generatedCount } = await generateWeeklyParentReportsForTenant({ tenantId, weekStart, weekEnd });
  console.log(`Generated reports: ${generatedCount}`);

  const reports = await prisma.weeklyParentReport.count();
  console.log(`[Database] WeeklyParentReports: ${reports} (Expected > 0)`);

  const deliveries = await prisma.parentReportDelivery.count();
  console.log(`[Database] ParentReportDeliveries: ${deliveries} (Expected > 0)`);

  const highRisk = await prisma.weeklyParentReport.count({
    where: { riskFlagsJson: { contains: "HIGH" } }
  });
  console.log(`[Database] High-risk reports: ${highRisk}`);

  console.log("Processing deliveries (to create Outbox messages)...");
  
  // Set one delivery to PENDING_APPROVAL so the worker creates an outbox message
  const someDelivery = await prisma.parentReportDelivery.findFirst({ where: { status: "DRAFT" } });
  if (someDelivery) {
    await prisma.parentReportDelivery.update({
      where: { id: someDelivery.id },
      data: { status: "PENDING_APPROVAL" }
    });
  }

  await processParentReportDeliveries();

  const outbox = await prisma.zaloOutboxMessage.count({
    where: { text: { contains: "BÁO CÁO PHỤ HUYNH" } }
  });
  console.log(`[Outbox] Parent report messages: ${outbox}`);

  // Test Role Protection
  console.log("Testing Role Protection for Parent Reports...");
  const firstDraft = await prisma.weeklyParentReport.findFirst({ where: { status: "DRAFT" } });
  if (firstDraft) {
    const adminUser = await prisma.user.upsert({ where: { email: "admin2@test.com" }, update: {}, create: { email: "admin2@test.com", passwordHash: "dummy" } });
    const teacherUser = await prisma.user.upsert({ where: { email: "teacher2@test.com" }, update: {}, create: { email: "teacher2@test.com", passwordHash: "dummy" } });
    const saleUser = await prisma.user.upsert({ where: { email: "sale2@test.com" }, update: {}, create: { email: "sale2@test.com", passwordHash: "dummy" } });

    await prisma.tenantMember.upsert({ where: { tenantId_userId: { tenantId, userId: adminUser.id } }, update: { role: "ADMIN" }, create: { tenantId, userId: adminUser.id, role: "ADMIN" } });
    await prisma.tenantMember.upsert({ where: { tenantId_userId: { tenantId, userId: teacherUser.id } }, update: { role: "TEACHER" }, create: { tenantId, userId: teacherUser.id, role: "TEACHER" } });
    await prisma.tenantMember.upsert({ where: { tenantId_userId: { tenantId, userId: saleUser.id } }, update: { role: "SALE" }, create: { tenantId, userId: saleUser.id, role: "SALE" } });

    try {
      await approveParentReport(firstDraft.id, saleUser.id, "Teacher Note!");
      console.error("FAIL: Sale was able to approve report!");
    } catch (e: any) {
      if (e.message.includes("cannot approve")) {
        console.log("PASS: Sale cannot approve report.");
      } else {
        console.error("FAIL: Unexpected error:", e);
      }
    }

    try {
      await approveParentReport(firstDraft.id, teacherUser.id, "Teacher Note!");
      console.log("PASS: Teacher approved academic report.");
    } catch (e: any) {
      console.error("FAIL: Teacher could not approve report:", e);
    }
  }

  // Safety check
  const groupSafeMsg = await prisma.zaloOutboxMessage.findFirst({
    where: { isSensitive: true, targetGroupId: { not: null }, text: { contains: "BÁO CÁO PHỤ HUYNH" } }
  });
  if (groupSafeMsg) {
    console.error("FAIL: Parent report found targeted to a group!", groupSafeMsg);
  } else {
    console.log("PASS: No parent report is targeted to a group.");
  }

  console.log("=== Phase 8 QA Done ===");
}

runQA().catch(e => {
  console.error(e);
  process.exit(1);
});
