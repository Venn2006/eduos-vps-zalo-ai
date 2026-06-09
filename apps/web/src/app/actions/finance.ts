"use server";

import { createAuditLog, prisma } from '@eduos/db';
import { getCurrentTenantOrThrow, requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getFinanceMetrics() {
  const tenantId = await getCurrentTenantOrThrow();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Current Month Revenue (Sum of totalAmount of invoices created this month)
  const currentMonthInvoices = await prisma.invoice.findMany({
    where: {
      tenantId,
      createdAt: { gte: startOfMonth }
    }
  });
  const currentMonthRevenue = currentMonthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  // 2. Current Month Collected (Sum of payments made this month)
  const currentMonthPayments = await prisma.payment.findMany({
    where: {
      tenantId,
      paidAt: { gte: startOfMonth }
    }
  });
  const currentMonthCollected = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);

  // 3. Current Month Expenses (Sum of expenses made this month)
  const currentMonthExpensesList = await prisma.expense.findMany({
    where: {
      tenantId,
      expenseDate: { gte: startOfMonth },
      status: 'PAID'
    }
  });
  const currentMonthExpenses = currentMonthExpensesList.reduce((sum, e) => sum + e.amount, 0);

  // 4. Total Debt (Sum of remainingAmount of all invoices that are not paid)
  const unpaidInvoices = await prisma.invoice.findMany({
    where: {
      tenantId,
      remainingAmount: { gt: 0 }
    }
  });
  const totalDebt = unpaidInvoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);

  // 5. Overdue count
  const overdueCount = unpaidInvoices.filter(inv => inv.dueDate < now).length;

  const estimatedProfit = currentMonthCollected - currentMonthExpenses;

  return {
    currentMonthRevenue,
    currentMonthCollected,
    totalDebt,
    overdueCount,
    estimatedProfit,
    totalCost: currentMonthExpenses,
    expiringSessionsCount: 0,
    approvalRequiredCount: unpaidInvoices.length,
    commissionsByStaff: {}
  };
}

export async function getFinanceRecords() {
  const tenantId = await getCurrentTenantOrThrow();

  const invoices = await prisma.invoice.findMany({
    where: { tenantId },
    include: {
      student: {
        include: { guardian: true }
      },
      enrollment: {
        include: { class: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const now = new Date();

  return invoices.map(inv => {
    let statusText = 'Đã thu đủ';
    let overdueDays = 0;

    if (inv.remainingAmount > 0) {
      if (inv.dueDate < now) {
        statusText = 'Quá hạn';
        overdueDays = Math.floor((now.getTime() - inv.dueDate.getTime()) / (1000 * 3600 * 24));
      } else {
        statusText = 'Còn công nợ';
      }
    }

    return {
      id: inv.id,
      studentName: inv.student.name,
      parentName: inv.student.guardian?.name || 'Chưa có',
      phone: inv.student.guardian?.phone || inv.student.phone || 'Chưa có',
      className: inv.enrollment?.class?.classCode || 'Khóa học tự do',
      remainingSessions: null,
      totalSessions: null,
      tuitionAmount: inv.totalAmount,
      paidAmount: inv.paidAmount,
      debtAmount: inv.remainingAmount,
      dueDate: inv.dueDate.toLocaleDateString('vi-VN'),
      overdueDays,
      status: statusText,
      approvalRequired: inv.remainingAmount > 0,
      recommendedAction: statusText === 'Quá hạn' ? 'Tạo nháp nhắc nợ trong chờ duyệt' : 'Tạo nháp nhắc đóng học phí trong chờ duyệt',
      owner: 'Kế toán/Admin'
    };
  });
}

export async function createPaymentReminder(invoiceId: string) {
  const session = await requireRole(['OWNER', 'ADMIN', 'ACCOUNTANT']);
  const tenantId = session.activeTenantId;

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, tenantId },
    include: { student: { include: { guardian: true } }, enrollment: { include: { class: true } } }
  });

  if (!invoice) throw new Error('Invoice not found');

  const guardianPhone = invoice.student.guardian?.phone || invoice.student.phone;
  if (!guardianPhone) throw new Error('No phone number found to send Zalo message');

  const formattedDebt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(invoice.remainingAmount);

  const content = `Dạ em chào anh/chị, em là giáo vụ bên Trung tâm. Hiện tại bé ${invoice.student.name} đang học lớp ${invoice.enrollment?.class?.classCode || ''} và còn khoản phí ${formattedDebt} đang tới hạn. Anh/chị vui lòng kiểm tra và thanh toán giúp trung tâm để hoàn tất hồ sơ cho bé nha. Em cảm ơn anh/chị nhiều ạ!`;

  const idempotencyKey = `payment_reminder_${invoiceId}_${new Date().toISOString().split('T')[0]}`;
  const existing = await prisma.sandboxOutboxItem.findUnique({
    where: {
      tenantId_idempotencyKey: {
        tenantId,
        idempotencyKey,
      },
    },
  });

  if (existing) return existing;

  const item = await prisma.sandboxOutboxItem.create({
    data: {
      tenantId,
      idempotencyKey,
      channel: 'ZALO',
      sourceType: 'FINANCE_REMINDER',
      recipientType: 'GUARDIAN_PHONE',
      recipientId: guardianPhone,
      messageSafeSummary: content,
      status: 'MOCK_READY',
      readinessStatus: 'SANDBOX_READY',
      approvalStatus: 'APPROVED_FOR_MANUAL_USE',
      createdByUserId: session.userId,
    }
  });

  await createAuditLog(prisma, {
    tenantId,
    actorId: session.userId,
    action: 'FINANCE_PAYMENT_REMINDER_DRAFT_CREATED',
    entityType: 'sandboxOutboxItem',
    entityId: item.id,
    afterJson: {
      invoiceId,
      studentId: invoice.studentId,
      remainingAmount: invoice.remainingAmount,
      channel: item.channel,
      status: item.status,
    },
    metadataJson: { source: 'finance_action' },
  });

  revalidatePath('/workspaces/finance');
  revalidatePath('/settings/mock-outbox');
}

export async function getExpenses() {
  const tenantId = await getCurrentTenantOrThrow();
  return prisma.expense.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createExpense(data: {
  category: string;
  recipientName: string;
  amount: number;
  note?: string;
  expenseDate: Date;
}) {
  const session = await requireRole(['OWNER', 'ADMIN', 'ACCOUNTANT']);
  const tenantId = session.activeTenantId;

  const expenseCode = `PC-${Date.now().toString().slice(-6)}`;

  const expense = await prisma.expense.create({
    data: {
      tenantId,
      expenseCode,
      category: data.category,
      recipientName: data.recipientName,
      amount: data.amount,
      note: data.note,
      expenseDate: data.expenseDate,
      status: 'PAID' // Auto paid for simplicity
    }
  });

  await createAuditLog(prisma, {
    tenantId,
    actorId: session.userId,
    action: 'EXPENSE_CREATED',
    entityType: 'Expense',
    entityId: expense.id,
    afterJson: {
      expenseCode: expense.expenseCode,
      category: expense.category,
      amount: expense.amount,
      status: expense.status,
    },
    metadataJson: { source: 'finance_action' },
  });

  revalidatePath('/workspaces/finance');
}
