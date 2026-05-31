import { PrismaClient } from '@prisma/client';
import { parseAttendanceIntents } from './apps/api/src/services/attendance.service';

const prisma = new PrismaClient();

async function runQA() {
  console.log("=== PHASE 5 QA PASS ===");
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) throw new Error("No tenant found");
    console.log(`[PASS] Tenant found: ${tenant.name}`);

    const students = await prisma.student.count();
    const classes = await prisma.class.count();
    const sessions = await prisma.classSession.count();
    const groups = await prisma.zaloGroup.count();
    const templates = await prisma.zaloMessageTemplate.count({ where: { name: 'CLASS_REMINDER_60M' } });

    console.log(`[PASS] Students: ${students}`);
    console.log(`[PASS] Classes: ${classes}`);
    console.log(`[PASS] Sessions: ${sessions}`);
    console.log(`[PASS] ZaloGroups: ${groups}`);
    console.log(`[PASS] Templates: ${templates}`);

    if (students === 0 || classes === 0 || sessions === 0 || groups === 0 || templates === 0) {
      throw new Error("Missing seed data");
    }

    // Check attendance regex parsing directly
    console.log("Testing attendance parsing...");
    const testCases = [
      { text: "Có mặt", expected: "PRESENT" },
      { text: "Em xin nghỉ", expected: "ABSENT" },
      { text: "IN", expected: "PRESENT" },
      { text: "Đi học", expected: "PRESENT" },
      { text: "Nghỉ phép", expected: "ABSENT" },
      { text: "Hôm nay em nghỉ", expected: "ABSENT" },
      { text: "Xin vắng", expected: "ABSENT" },
    ];

    for (const tc of testCases) {
      const intent = parseAttendanceIntents(tc.text);
      if (
        (tc.expected === "PRESENT" && intent.status !== "PRESENT") ||
        (tc.expected === "ABSENT" && intent.status !== "ABSENT")
      ) {
        throw new Error(`Parsing failed for '${tc.text}'. Expected ${tc.expected}, got ${intent.status}`);
      }
      console.log(`[PASS] Parsed '${tc.text}' -> ${intent.status}`);
    }

    // Verify template content
    const template = await prisma.zaloMessageTemplate.findFirst({ where: { name: 'CLASS_REMINDER_60M' } });
    if (!template?.content.includes("Sắp đến giờ học rồi")) {
       throw new Error("Template content mismatch");
    }
    console.log("[PASS] Template content verified");

    console.log("=== PHASE 5 QA PASSED ===");
    process.exit(0);
  } catch (err: any) {
    console.error("QA FAILED:", err.message);
    process.exit(1);
  }
}

runQA();
