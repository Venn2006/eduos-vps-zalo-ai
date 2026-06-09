import { Prisma, prisma } from "@eduos/db";

type InvoiceStatusValue = "UNPAID" | "PAID" | "PARTIALLY_PAID" | "OVERDUE";
type PaymentMethodValue = "CASH" | "BANK_TRANSFER" | "MOMO" | "OTHER";

export async function getFinanceSummaryForTenant(tenantId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Collected today
  const paymentsToday = await prisma.payment.aggregate({
    where: { tenantId, paidAt: { gte: today } },
    _sum: { amount: true }
  });

  // Collected this month
  const paymentsMonth = await prisma.payment.aggregate({
    where: { tenantId, paidAt: { gte: startOfMonth } },
    _sum: { amount: true }
  });

  // Unpaid/Partially Paid
  const unpaidInvoices = await prisma.invoice.aggregate({
    where: { tenantId, status: { in: ["UNPAID", "PARTIALLY_PAID"] } },
    _sum: { remainingAmount: true }
  });

  // Overdue
  const overdueInvoices = await prisma.invoice.aggregate({
    where: { tenantId, status: "OVERDUE" },
    _sum: { remainingAmount: true }
  });

  return {
    collectedToday: paymentsToday._sum.amount || 0,
    collectedThisMonth: paymentsMonth._sum.amount || 0,
    totalUnpaid: unpaidInvoices._sum.remainingAmount || 0,
    totalOverdue: overdueInvoices._sum.remainingAmount || 0
  };
}

export async function getInvoicesForTenant(tenantId: string, filters?: Prisma.InvoiceWhereInput) {
  return prisma.invoice.findMany({
    where: { tenantId, ...filters },
    include: {
      student: true,
      guardian: true,
      enrollment: { include: { class: true } }
    },
    orderBy: { dueDate: 'asc' }
  });
}

export async function recordPayment(params: {
  tenantId: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethodValue;
  paidAt?: Date;
  receivedById?: string;
  referenceCode?: string;
  note?: string;
}) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.invoiceId, tenantId: params.tenantId }
  });
  if (!invoice) throw new Error("Invoice not found");

  const payment = await prisma.payment.create({
    data: {
      tenantId: params.tenantId,
      invoiceId: params.invoiceId,
      amount: params.amount,
      paymentMethod: params.method,
      paidAt: params.paidAt || new Date(),
      receivedById: params.receivedById,
      referenceCode: params.referenceCode,
      note: params.note
    }
  });

  await recalculateInvoiceStatus(invoice.id);
  return payment;
}

export async function recalculateInvoiceStatus(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true }
  });
  if (!invoice) return;

  const totalPaid = invoice.payments.reduce((sum: number, payment: { amount: number }) => sum + payment.amount, 0);
  const remaining = Math.max(0, invoice.totalAmount - totalPaid);

  let newStatus: InvoiceStatusValue = "UNPAID";
  if (remaining === 0) {
    newStatus = "PAID";
  } else if (totalPaid > 0 && remaining > 0) {
    newStatus = "PARTIALLY_PAID";
  }

  // Check if overdue (and not paid)
  if (remaining > 0 && new Date() > invoice.dueDate) {
    newStatus = "OVERDUE";
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      paidAmount: totalPaid,
      remainingAmount: remaining,
      status: newStatus
    }
  });
}

export async function getOverdueInvoices(tenantId: string) {
  return prisma.invoice.findMany({
    where: {
      tenantId,
      status: "OVERDUE",
      remainingAmount: { gt: 0 }
    },
    include: { student: true, guardian: true }
  });
}

export async function getDueSoonInvoices(tenantId: string, days = 7) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  return prisma.invoice.findMany({
    where: {
      tenantId,
      status: { in: ["UNPAID", "PARTIALLY_PAID"] },
      dueDate: {
        gte: today,
        lte: futureDate
      }
    },
    include: { student: true, guardian: true }
  });
}

export async function approveFinancialReminder(messageId: string, userId: string) {
  // Check role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tenantMembers: true }
  });
  if (!user) throw new Error("User not found");

  const message = await prisma.zaloOutboxMessage.findUnique({
    where: { id: messageId }
  });
  if (!message) throw new Error("Message not found");

  // Only allow OWNER, ADMIN, ACCOUNTANT
  const tenantMember = user.tenantMembers.find((tenantMember) => tenantMember.tenantId === message.tenantId);
  if (!tenantMember) throw new Error("Not a tenant user");

  const allowedRoles = ["OWNER", "ADMIN", "ACCOUNTANT"];
  if (!allowedRoles.includes(tenantMember.role)) {
    throw new Error(`Role ${tenantMember.role} cannot approve financial reminders`);
  }

  // Update message
  const updatedMessage = await prisma.zaloOutboxMessage.update({
    where: { id: messageId },
    data: { status: "APPROVED" }
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      tenantId: message.tenantId,
      actorId: userId,
      entityType: "ZaloOutboxMessage",
      entityId: messageId,
      action: "APPROVE_FINANCIAL_REMINDER",
      metadataJson: JSON.stringify({ role: tenantMember.role })
    }
  });

  return updatedMessage;
}
