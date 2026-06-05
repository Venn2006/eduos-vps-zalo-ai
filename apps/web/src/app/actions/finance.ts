"use server";

import { prisma } from '@eduos/db';
import { getCurrentTenantOrThrow } from '@/lib/auth';
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

  // 3. Total Debt (Sum of remainingAmount of all invoices that are not paid)
  const unpaidInvoices = await prisma.invoice.findMany({
    where: {
      tenantId,
      remainingAmount: { gt: 0 }
    }
  });
  const totalDebt = unpaidInvoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);

  // 4. Overdue count
  const overdueCount = unpaidInvoices.filter(inv => inv.dueDate < now).length;

  // Mock costs for estimated profit
  const totalCost = 45000000; 
  const estimatedProfit = currentMonthCollected - totalCost;

  return {
    currentMonthRevenue,
    currentMonthCollected,
    totalDebt,
    overdueCount,
    estimatedProfit,
    totalCost,
    expiringSessionsCount: 5, // mocked
    approvalRequiredCount: unpaidInvoices.length, // we'll flag all unpaid as requiring approval for demo
    commissionsByStaff: {
      "Nguyễn Thu Sale": { wonStudents: 3, collectedTuition: currentMonthCollected * 0.6, commissionAmount: (currentMonthCollected * 0.6) * 0.05 },
      "Trần Thị Tư Vấn": { wonStudents: 2, collectedTuition: currentMonthCollected * 0.4, commissionAmount: (currentMonthCollected * 0.4) * 0.05 }
    }
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
      remainingSessions: 10, // Mock
      totalSessions: 24, // Mock
      tuitionAmount: inv.totalAmount,
      paidAmount: inv.paidAmount,
      debtAmount: inv.remainingAmount,
      dueDate: inv.dueDate.toLocaleDateString('vi-VN'),
      overdueDays,
      status: statusText,
      approvalRequired: inv.remainingAmount > 0, // Mock logic: anything unpaid needs approval for Zalo
      recommendedAction: statusText === 'Quá hạn' ? 'Gửi tin nhắn nhắc nợ Zalo khẩn' : 'Gửi tin nhắn nhắc đóng học phí định kỳ',
      owner: 'Admin'
    };
  });
}

export async function createPaymentReminder(invoiceId: string) {
  const tenantId = await getCurrentTenantOrThrow();

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId, tenantId },
    include: { student: { include: { guardian: true } }, enrollment: { include: { class: true } } }
  });

  if (!invoice) throw new Error('Invoice not found');

  const guardianPhone = invoice.student.guardian?.phone || invoice.student.phone;
  if (!guardianPhone) throw new Error('No phone number found to send Zalo message');

  const formattedDebt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(invoice.remainingAmount);
  
  const content = `Dạ em chào anh/chị, em là giáo vụ bên Trung tâm. Hiện tại bé ${invoice.student.name} đang học lớp ${invoice.enrollment?.class?.classCode || ''} và còn khoản phí ${formattedDebt} đang tới hạn. Anh/chị vui lòng kiểm tra và thanh toán giúp trung tâm để hoàn tất hồ sơ cho bé nha. Em cảm ơn anh/chị nhiều ạ!`;

  await prisma.sandboxOutboxItem.create({
    data: {
      tenantId,
      idempotencyKey: `payment_reminder_${invoiceId}_${new Date().toISOString().split('T')[0]}`, // One per day
      channel: 'ZALO',
      sourceType: 'FINANCE_REMINDER',
      recipientType: 'GUARDIAN_PHONE',
      recipientId: guardianPhone,
      messageSafeSummary: content,
      status: 'MOCK_READY',
      readinessStatus: 'TEST'
    }
  });

  revalidatePath('/workspaces/finance');
  revalidatePath('/settings/mock-outbox');
}
