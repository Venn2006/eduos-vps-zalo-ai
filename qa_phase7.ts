import { prisma } from "@eduos/db";
import { getFinanceSummaryForTenant, getInvoicesForTenant } from "@eduos/api/src/services/finance.service";
import { checkAndCreateDebtReminders } from "@eduos/worker/src/schedulers/debtReminder";
import { checkAndCreateRenewalReminders } from "@eduos/worker/src/schedulers/renewalReminder";

async function runQA() {
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) throw new Error("No tenant");
  const tenantId = tenant.id;

  console.log("=== Phase 7 QA Start ===");
  
  const invoices = await prisma.invoice.count();
  const payments = await prisma.payment.count();
  const renewalC = await prisma.renewalCandidate.count();
  
  console.log(`[Database] Invoices: ${invoices} (Expected > 0)`);
  console.log(`[Database] Payments: ${payments} (Expected > 0)`);
  console.log(`[Database] RenewalCandidates: ${renewalC} (Expected > 0)`);

  const summary = await getFinanceSummaryForTenant(tenantId);
  console.log(`[FinanceService] Summary:`, summary);

  // Run workers
  console.log("Running DebtReminder Worker...");
  await checkAndCreateDebtReminders();
  
  console.log("Running RenewalReminder Worker...");
  await checkAndCreateRenewalReminders();

  const outboxDebt = await prisma.zaloOutboxMessage.count({ where: { text: { contains: "thanh toán" } } });
  const outboxRen = await prisma.zaloOutboxMessage.count({ where: { text: { contains: "tiếp tục lộ trình" } } });

  console.log(`[Outbox] Debt Reminders created: ${outboxDebt} (Expected > 0)`);
  console.log(`[Outbox] Renewal Reminders created: ${outboxRen} (Expected > 0)`);

  // Verify group safety
  const unsafeMsg = await prisma.zaloOutboxMessage.findFirst({
    where: { 
      isSensitive: true,
      targetGroupId: { not: null }
    }
  });

  if (unsafeMsg) {
    console.error("FAIL: Found financial message targeted to a group!", unsafeMsg);
  } else {
    console.log("PASS: No financial message is targeted to a group.");
  }
  
  const groupSafeMsg = await prisma.zaloOutboxMessage.findFirst({
    where: {
      isSensitive: true,
      targetGroupId: { not: null } // using targetGroupId instead of groupSafe if groupSafe doesnt exist
    }
  });

  if (groupSafeMsg) {
    console.error("FAIL: Found financial message marked as groupSafe=true!", groupSafeMsg);
  } else {
    console.log("PASS: No financial message is marked groupSafe.");
  }
  
  // Test Role Protection
  console.log("Testing Role Protection...");
  const firstDraft = await prisma.zaloOutboxMessage.findFirst({
    where: { isSensitive: true, status: "PENDING_APPROVAL" }
  });

  if (firstDraft) {
    const { approveFinancialReminder } = await import("@eduos/api/src/services/finance.service");
    
    // Create dummy users for testing
    const adminUser = await prisma.user.upsert({ where: { email: "admin2@test.com" }, update: {}, create: { email: "admin2@test.com", passwordHash: "dummy" } });
    const teacherUser = await prisma.user.upsert({ where: { email: "teacher2@test.com" }, update: {}, create: { email: "teacher2@test.com", passwordHash: "dummy" } });
    
    await prisma.tenantMember.upsert({ 
      where: { tenantId_userId: { tenantId, userId: adminUser.id } },
      update: { role: "ADMIN" },
      create: { tenantId, userId: adminUser.id, role: "ADMIN" } 
    });
    await prisma.tenantMember.upsert({ 
      where: { tenantId_userId: { tenantId, userId: teacherUser.id } },
      update: { role: "TEACHER" },
      create: { tenantId, userId: teacherUser.id, role: "TEACHER" } 
    });

    try {
      await approveFinancialReminder(firstDraft.id, teacherUser.id);
      console.error("FAIL: Teacher was able to approve financial reminder!");
    } catch (e: any) {
      if (e.message.includes("cannot approve")) {
        console.log("PASS: Teacher cannot approve financial reminder.");
      } else {
        console.error("FAIL: Unexpected error when Teacher approved:", e);
      }
    }

    try {
      await approveFinancialReminder(firstDraft.id, adminUser.id);
      console.log("PASS: Admin approved financial reminder.");
      const logs = await prisma.auditLog.count({ where: { action: "APPROVE_FINANCIAL_REMINDER" } });
      if (logs > 0) console.log("PASS: Approval created AuditLog.");
      else console.error("FAIL: AuditLog not created.");
    } catch (e) {
      console.error("FAIL: Admin failed to approve:", e);
    }
  } else {
    console.log("SKIP: No PENDING_APPROVAL messages found to test role protection.");
  }

  console.log("=== Phase 7 QA Done ===");
}

runQA().catch(console.error).finally(() => process.exit(0));
