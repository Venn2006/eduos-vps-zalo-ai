import { PrismaClient, Role } from "@prisma/client";

export function getCurrentUserOrThrow(session: any) {
  if (!session || !session.userId) {
    throw new Error("Unauthorized: No active user session.");
  }
  return session;
}

export function getCurrentTenantOrThrow(session: any) {
  if (!session || !session.activeTenantId) {
    throw new Error("Unauthorized: No active tenant context.");
  }
  return session.activeTenantId;
}

export function requireRole(session: any, requiredRole: Role) {
  if (!session || !session.role) {
    throw new Error("Forbidden: Missing role in session.");
  }
  if (session.role !== requiredRole && session.role !== "OWNER") {
    throw new Error(`Forbidden: Requires ${requiredRole} role.`);
  }
}

export function requireAnyRole(session: any, roles: Role[]) {
  if (!session || !session.role) {
    throw new Error("Forbidden: Missing role in session.");
  }
  if (session.role === "OWNER") return;
  if (!roles.includes(session.role as Role)) {
    throw new Error(`Forbidden: Requires one of ${roles.join(", ")} roles.`);
  }
}

// Tenant-scoped database access methods
export async function getDashboardSummaryForTenant(prisma: PrismaClient, tenantId: string) {
  const [
    totalStudents,
    totalClasses,
    totalLeads,
    totalTrialBookings,
    totalUnpaidInvoices,
    recentAiTasks
  ] = await Promise.all([
    prisma.student.count({ where: { tenantId } }),
    prisma.class.count({ where: { tenantId, status: "ACTIVE" } }),
    prisma.lead.count({ where: { tenantId, stage: { not: "WON" } } }),
    prisma.trialBooking.count({ where: { tenantId, status: "BOOKED" } }),
    prisma.invoice.count({ where: { tenantId, status: "UNPAID" } }),
    prisma.aiSuggestion.count({ where: { tenantId } }) // Placeholder
  ]);

  return {
    totalStudents,
    totalClasses,
    totalLeads,
    totalTrialBookings,
    totalUnpaidInvoices,
    recentAiTasks
  };
}

export async function getLeadsForTenant(prisma: PrismaClient, tenantId: string) {
  return prisma.lead.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getClassesForTenant(prisma: PrismaClient, tenantId: string) {
  return prisma.class.findMany({
    where: { tenantId },
    include: { teacher: true, course: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getStudentsForTenant(prisma: PrismaClient, tenantId: string) {
  return prisma.student.findMany({
    where: { tenantId },
    include: { guardian: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getInvoicesForTenant(prisma: PrismaClient, tenantId: string) {
  return prisma.invoice.findMany({
    where: { tenantId },
    orderBy: { dueDate: 'asc' }
  });
}

export async function getZaloGroupsForTenant(prisma: PrismaClient, tenantId: string) {
  return prisma.zaloGroup.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getAiTasksForTenant(prisma: PrismaClient, tenantId: string) {
  return prisma.aiSuggestion.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' }
  });
}
