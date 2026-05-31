import { PrismaClient } from "@prisma/client";

export class ZaloQueries {
  constructor(private prisma: PrismaClient) {}

  async getZaloAccountsForTenant(tenantId: string) {
    const dbAccounts = await this.prisma.zaloPersonalAccount.findMany({
      where: { tenantId },
      include: {
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    return dbAccounts.map(acc => {
      const session = acc.sessions[0];
      return {
        id: acc.id,
        displayName: acc.displayName,
        phoneNumber: acc.phoneNumber,
        status: session?.status || 'OFFLINE',
        lastPing: session?.lastPing || null
      };
    });
  }

  async getZaloGroupsForTenant(tenantId: string) {
    const groups = await this.prisma.zaloGroup.findMany({
      where: { tenantId },
      include: {
        class: {
          include: {
            automationSetting: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const bootstrapCommands = await this.prisma.classBootstrapCommand.findMany({
      where: {
        tenantId,
        externalGroupId: {
          in: groups.map(g => g.externalGroupId)
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const groupIds = groups.map(g => g.id);

    const lastAttendanceMessages = await this.prisma.zaloMessage.groupBy({
      by: ['groupId'],
      where: { tenantId, groupId: { in: groupIds }, parsedIntent: { in: ['ATTENDANCE', 'ABSENCE_REQUEST'] } },
      _max: { createdAt: true }
    });

    const lastReminders = await this.prisma.zaloOutboxMessage.groupBy({
      by: ['targetGroupId'],
      where: { tenantId, targetGroupId: { in: groupIds }, text: { startsWith: '📚 Nhắc lịch' } },
      _max: { createdAt: true }
    });

    return groups.map(g => {
      const cls = g.class;
      const settings = cls?.automationSetting;
      const cmd = bootstrapCommands.find(c => c.externalGroupId === g.externalGroupId);

      return {
        id: g.id,
        name: g.name,
        externalGroupId: g.externalGroupId,
        className: cls?.classCode || null,
        status: cmd ? cmd.status : 'NO_COMMAND',
        lastAttendance: lastAttendanceMessages.find(x => x.groupId === g.id)?._max.createdAt || null,
        lastReminder: lastReminders.find(x => x.targetGroupId === g.id)?._max.createdAt || null,
        automation: settings ? {
          classReminder: settings.classReminderEnabled,
          attendance: settings.attendanceEnabled,
          homework: settings.teacherHomeworkReminderEnabled
        } : null
      };
    });
  }
}
