import { prisma } from "@eduos/db";
import { logger } from "@eduos/logger";

export async function checkAndCreateDebtReminders() {
  logger.info("Running checkAndCreateDebtReminders...");
  
  // Find unpaid or partially paid invoices
  const openInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ["UNPAID", "PARTIALLY_PAID", "OVERDUE"] }
    },
    include: {
      student: { include: { guardian: true } },
      tenant: true
    }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const invoice of openInvoices) {
    const due = new Date(invoice.dueDate);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    let reminderType: any = null;
    let draftContent = "";

    if (diffDays === 7) {
      reminderType = "BEFORE_DUE";
      draftContent = `OMLIS xin chào phụ huynh của bé ${invoice.student.name} ạ 💛\n\nHọc phí khóa/lớp của bé sẽ đến hạn vào ngày ${due.toLocaleDateString('vi-VN')}.\nSố tiền cần thanh toán: ${invoice.remainingAmount.toLocaleString()} VNĐ.\n\nPhụ huynh có thể chuyển khoản hoặc liên hệ OMLIS để được hỗ trợ.\nOMLIS cảm ơn phụ huynh ạ.`;
    } else if (diffDays === 0) {
      reminderType = "DUE_TODAY";
      draftContent = `OMLIS xin phép nhắc nhẹ phụ huynh của bé ${invoice.student.name} ạ 💛\n\nHôm nay là ngày đến hạn học phí.\nSố tiền cần thanh toán: ${invoice.remainingAmount.toLocaleString()} VNĐ.\n\nNếu phụ huynh đã thanh toán rồi, vui lòng bỏ qua tin nhắn này giúp OMLIS ạ.\nOMLIS cảm ơn phụ huynh rất nhiều.`;
    } else if (diffDays === -3) {
      reminderType = "OVERDUE";
      draftContent = `OMLIS xin chào phụ huynh của bé ${invoice.student.name} ạ 💛\n\nHệ thống ghi nhận học phí hiện còn ${invoice.remainingAmount.toLocaleString()} VNĐ và đã quá hạn 3 ngày.\nOMLIS xin phép nhắc lại để phụ huynh tiện sắp xếp.\n\nNếu cần hỗ trợ chia kỳ hoặc xác nhận lại thông tin, phụ huynh inbox OMLIS giúp em ạ.\nOMLIS cảm ơn phụ huynh.`;
    } else if (diffDays === -7) {
      reminderType = "OVERDUE";
      draftContent = `OMLIS xin chào phụ huynh của bé ${invoice.student.name} ạ 💛\n\nHệ thống ghi nhận học phí hiện còn ${invoice.remainingAmount.toLocaleString()} VNĐ và đã quá hạn 7 ngày.\nOMLIS xin phép nhắc lại để phụ huynh tiện sắp xếp.\n\nNếu cần hỗ trợ chia kỳ hoặc xác nhận lại thông tin, phụ huynh inbox OMLIS giúp em ạ.\nOMLIS cảm ơn phụ huynh.`;
    }

    if (reminderType) {
      const existing = await prisma.debtReminder.findFirst({
        where: {
          invoiceId: invoice.id,
          reminderType: reminderType,
          daysOffset: diffDays
        }
      });

      if (!existing) {
        const guardianId = invoice.guardianId || invoice.student.guardianId;
        
        const reminder = await prisma.debtReminder.create({
          data: {
            tenantId: invoice.tenantId,
            invoiceId: invoice.id,
            studentId: invoice.studentId,
            guardianId: guardianId,
            reminderType,
            daysOffset: diffDays,
            draftContent,
            targetChannel: "ZALO_PERSONAL",
            status: "PENDING_APPROVAL"
          }
        });
        
        let targetZaloIdentityId: string | null = null;
        if (guardianId) {
            const zaloId = await prisma.zaloIdentity.findFirst({ where: { guardianId: guardianId }});
            if (zaloId) targetZaloIdentityId = zaloId.id;
        }

        // Also create Outbox message
        await prisma.zaloOutboxMessage.create({
          data: {
            tenantId: invoice.tenantId,
            targetIdentityId: targetZaloIdentityId,
            text: draftContent,
            status: "PENDING_APPROVAL",
            isSensitive: true
          }
        });

        logger.info(`Created DebtReminder ${reminder.id} for invoice ${invoice.id}`);
      }
    }
  }
}
