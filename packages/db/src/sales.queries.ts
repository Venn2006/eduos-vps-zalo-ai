import { PrismaClient } from "@prisma/client";

export class SalesQueries {
  constructor(private prisma: PrismaClient) {}

  async getSalesCallingQueueForTenant(tenantId: string, userId: string, role: string) {
    const where: any = {
      tenantId,
      stage: {
        notIn: ['WON', 'LOST']
      }
    };

    if (role === 'SALE') {
      where.assignedToId = userId;
    }
    // For OWNER or ADMIN, do not filter by assignedToId (they can see all leads)

    return this.prisma.lead.findMany({
      where,
      orderBy: [
        { temperature: 'desc' },
        { nextFollowUpAt: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        course: true,
        batch: true,
        callAttempts: {
          orderBy: { calledAt: 'desc' },
          take: 5
        }
      },
      take: 100
    });
  }

  async getTrialBookingsForTenant(tenantId: string) {
    return this.prisma.trialBooking.findMany({
      where: { tenantId },
      orderBy: { trialDate: 'desc' },
      include: {
        course: true,
        lead: {
          select: { name: true, stage: true, temperature: true, assignedToId: true }
        }
      }
    });
  }

  async getSalesReportsForTenant(tenantId: string) {
    const users = await this.prisma.user.findMany({
      where: { tenantMembers: { some: { tenantId } } }
    });
    const userMap = new Map(users.map(u => [u.id, u.email]));

    const batches = await this.prisma.leadBatch.findMany({ where: { tenantId } });
    const batchMap = new Map(batches.map(b => [b.id, b.name]));

    const totalLeads = await this.prisma.lead.count({ where: { tenantId } });
    const contactedLeads = await this.prisma.lead.count({ 
      where: { tenantId, stage: { notIn: ['NEW'] } }
    });
    const bookedTrials = await this.prisma.trialBooking.count({
      where: { tenantId }
    });
    const attendedTrials = await this.prisma.trialBooking.count({
      where: { tenantId, status: { in: ['ATTENDED', 'CONVERTED'] } }
    });
    const wonLeads = await this.prisma.lead.count({
      where: { tenantId, stage: 'WON' }
    });

    const contactRate = totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 100) : 0;
    const trialRate = contactedLeads > 0 ? Math.round((bookedTrials / contactedLeads) * 100) : 0;
    const showRate = bookedTrials > 0 ? Math.round((attendedTrials / bookedTrials) * 100) : 0;
    const winRate = attendedTrials > 0 ? Math.round((wonLeads / attendedTrials) * 100) : 0;

    const allLeads = await this.prisma.lead.findMany({ where: { tenantId }, include: { trialBookings: true } });
    
    const staffStats: Record<string, any> = {};
    const sourceStats: Record<string, any> = {};

    allLeads.forEach(lead => {
      const staffId = lead.assignedToId || 'unassigned';
      if (!staffStats[staffId]) staffStats[staffId] = { id: staffId, total: 0, contacted: 0, won: 0 };
      staffStats[staffId].total++;
      if (lead.stage !== 'NEW') staffStats[staffId].contacted++;
      if (lead.stage === 'WON') staffStats[staffId].won++;

      const sourceId = lead.batchId || 'organic';
      if (!sourceStats[sourceId]) sourceStats[sourceId] = { id: sourceId, total: 0, won: 0 };
      sourceStats[sourceId].total++;
      if (lead.stage === 'WON') sourceStats[sourceId].won++;
    });

    const staffPerformance = Object.values(staffStats).sort((a, b) => b.total - a.total).map(s => ({
      ...s,
      name: s.id === 'unassigned' ? 'Chưa phân công' : userMap.get(s.id) || s.id
    }));
    
    const sourcePerformance = Object.values(sourceStats).sort((a, b) => b.total - a.total).map(s => ({
      ...s,
      name: s.id === 'organic' ? 'Tự nhiên / Trực tiếp' : batchMap.get(s.id) || s.id,
      rate: s.total > 0 ? Math.round((s.won / s.total) * 100) : 0
    }));

    return {
      totalLeads,
      contactedLeads,
      bookedTrials,
      attendedTrials,
      wonLeads,
      contactRate,
      trialRate,
      showRate,
      winRate,
      staffPerformance,
      sourcePerformance
    };
  }
}
