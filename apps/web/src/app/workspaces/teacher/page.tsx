import React from 'react';
import { getSession, getCurrentTenantOrThrow } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { TeacherWorkspaceClient } from './TeacherWorkspaceClient';
import { prisma } from '@eduos/db';

export default async function TeacherWorkspacePage() {
  const authSession = await getSession();

  // strict RBAC check
  if (!canAccessRoute(authSession?.role, "/workspaces/teacher")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();

  // For Pilot Demo, we fetch all classes/sessions for the tenant.
  // In a real multi-user scenario, we would filter by the linked teacherId.
  const classes = await prisma.class.findMany({
    where: { tenantId },
    include: {
      teacher: true,
      enrollments: { include: { student: true } }
    }
  });

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const todaySessions = await prisma.classSession.findMany({
    where: {
      tenantId,
      startTime: { gte: startOfDay, lte: endOfDay }
    },
    include: {
      class: { include: { teacher: true } },
      attendances: { include: { student: true } }
    },
    orderBy: { startTime: 'asc' }
  });

  // Map to the shape the Client expects
  const mappedClasses = classes.map(c => ({
    id: c.id,
    classCode: c.classCode,
    courseId: c.courseId,
    teacherName: c.teacher?.name || 'N/A',
    studentCount: c.enrollments.length,
    status: c.status
  }));

  const mappedSessions = todaySessions.map(s => ({
    id: s.id,
    className: s.class.classCode,
    teacherName: s.class.teacher?.name || 'N/A',
    roomName: 'P.101', // Mock room
    startTime: s.startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    endTime: s.endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    studentCount: s.attendances.length,
    attendances: s.attendances.map(a => ({
      id: a.id,
      studentId: a.student.id,
      studentName: a.student.name,
      status: a.status
    })),
    attendanceStatus: s.attendances.every(a => a.status === 'PRESENT' || a.status === 'ABSENT' || a.status === 'LATE' || a.status === 'EXCUSED') && s.attendances.length > 0
      ? 'Đủ' 
      : s.attendances.length === 0 ? 'Chưa điểm danh' : 'Thiếu',
    homeworkStatus: 'Chưa giao bài'
  }));

  return <TeacherWorkspaceClient 
    initialClasses={mappedClasses} 
    initialSessions={mappedSessions} 
  />;
}
