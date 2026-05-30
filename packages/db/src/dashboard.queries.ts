import { PrismaClient } from "@prisma/client";

export class DashboardQueries {
  constructor(private prisma: PrismaClient) {}

  async getDashboardSummary(tenantId: string) {
    const activeClasses = await this.prisma.class.count({
      where: { tenantId, status: "ACTIVE" },
    });
    const totalStudents = await this.prisma.student.count({
      where: { tenantId },
    });
    const newLeads = await this.prisma.lead.count({
      where: { tenantId, stage: "NEW" },
    });
    
    return {
      activeClasses,
      totalStudents,
      newLeads,
    };
  }

  async getTodayClasses(tenantId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return this.prisma.classSession.findMany({
      where: {
        tenantId,
        sessionDate: {
          gte: start,
          lte: end,
        },
      },
      include: {
        class: true,
      }
    });
  }

  async getOutstandingDebtSummary(tenantId: string) {
    const outstandingInvoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        status: {
          in: ["UNPAID", "PARTIALLY_PAID", "OVERDUE"]
        }
      }
    });

    return {
      totalDebt: outstandingInvoices.reduce((acc, curr) => acc + curr.remainingAmount, 0),
      invoiceCount: outstandingInvoices.length
    };
  }

  async getConnectorStatusSummary(tenantId: string) {
    return this.prisma.zaloConnectorSession.findMany({
      where: { tenantId },
      include: { account: true }
    });
  }

  async getPendingApprovalsSummary(tenantId: string) {
    return this.prisma.zaloOutboxMessage.count({
      where: {
        tenantId,
        status: "PENDING_APPROVAL"
      }
    });
  }
}
