import React from 'react';
import { prisma } from '@eduos/db';

import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';
import { TaskManagementClient, TaskListItem } from './TaskManagementClient';

export const metadata = {
  title: 'Giao việc - EduOS',
  description: 'Giao việc, đặt deadline và theo dõi tiến độ nhân sự',
};

export default async function TasksPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, '/tasks')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();
  const [tasks, members, leads] = await Promise.all([
    prisma.followUpTask.findMany({
      where: { tenantId },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            parentName: true,
            phone: true,
            stage: true,
            temperature: true
          }
        }
      },
      orderBy: [{ isCompleted: 'asc' }, { dueDate: 'asc' }]
    }),
    prisma.tenantMember.findMany({
      where: { tenantId, status: 'ACTIVE' },
      include: { user: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.lead.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      take: 100,
      select: {
        id: true,
        name: true,
        parentName: true,
        phone: true,
        stage: true,
        assignedToId: true
      }
    })
  ]);

  const roleTotals = members.reduce<Record<string, number>>((acc, member) => {
    const label = roleLabel(member.role);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
  const roleCounts: Record<string, number> = {};
  const assignees = members.map((member) => {
    const label = roleLabel(member.role);
    roleCounts[label] = (roleCounts[label] || 0) + 1;
    const displayName = roleTotals[label] > 1 ? `${label} ${roleCounts[label]}` : label;

    return {
      id: member.userId,
      label: member.userId === authSession?.userId ? `${displayName} (bạn)` : displayName,
      role: member.role
    };
  });
  const assigneeById = new Map(assignees.map((member) => [member.id, member.label]));

  const taskItems: TaskListItem[] = tasks.map((task) => ({
    id: task.id,
    leadId: task.leadId,
    leadName: task.lead.name,
    parentName: task.lead.parentName,
    phone: task.lead.phone,
    leadStage: task.lead.stage,
    leadTemperature: task.lead.temperature,
    assignedTo: task.assignedTo,
    assignedName: task.assignedTo ? assigneeById.get(task.assignedTo) || 'Chưa rõ người phụ trách' : 'Chưa giao',
    dueDate: task.dueDate.toISOString(),
    description: task.description,
    isCompleted: task.isCompleted,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString()
  }));

  const leadItems = leads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    parentName: lead.parentName,
    phone: lead.phone,
    stage: lead.stage,
    assignedToId: lead.assignedToId
  }));

  return <TaskManagementClient initialTasks={taskItems} assignees={assignees} leads={leadItems} currentUserId={authSession?.userId || ''} />;
}

function roleLabel(role: string) {
  const labels: Record<string, string> = {
    OWNER: 'Chủ trung tâm',
    ADMIN: 'Quản lý vận hành',
    SALE: 'Tư vấn tuyển sinh',
    TEACHER: 'Giáo viên',
    ACCOUNTANT: 'Kế toán'
  };

  return labels[role] || 'Nhân sự';
}
