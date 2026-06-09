"use server";

import { createAuditLog, prisma } from '@eduos/db';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { AttendanceStatus } from '@eduos/db';
import { createSandboxOutboxItem } from '../settings/mock-outbox/actions';

export async function markAttendance(
  attendanceId: string,
  status: AttendanceStatus
) {
  const session = await requireRole(['OWNER', 'ADMIN', 'TEACHER']);
  const tenantId = session.activeTenantId;

  const before = await prisma.attendance.findFirst({
    where: { id: attendanceId, tenantId },
    select: { id: true, status: true, studentId: true, classSessionId: true },
  });
  if (!before) throw new Error('Attendance not found');

  const updatedAttendance = await prisma.attendance.update({
    where: { 
      id: attendanceId,
      tenantId
    },
    data: { status },
    include: {
      student: true,
      session: {
        include: { class: true }
      }
    }
  });

  if (before.status !== status && (status === 'ABSENT' || status === 'LATE')) {
    const studentName = updatedAttendance.student.name;
    const className = updatedAttendance.session.class.classCode;
    const time = new Date(updatedAttendance.session.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const date = new Date(updatedAttendance.session.startTime).toLocaleDateString('vi-VN');
    const statusText = status === 'ABSENT' ? 'vắng mặt' : 'đi trễ';
    
    const messageContent = `EduOS thông báo: Học viên ${studentName} đã ${statusText} tại lớp ${className} vào lúc ${time} ngày ${date}.`;
    
    await createSandboxOutboxItem({
      content: messageContent,
      channel: 'ZALO',
      messageSafeSummary: `Báo vắng/trễ: ${studentName}`,
      idempotencyKey: `attendance_${updatedAttendance.classSessionId}_${updatedAttendance.studentId}_${status}`
    });
  }

  await createAuditLog(prisma, {
    tenantId,
    actorId: session.userId,
    action: 'ATTENDANCE_MARKED',
    entityType: 'Attendance',
    entityId: updatedAttendance.id,
    beforeJson: before,
    afterJson: {
      status: updatedAttendance.status,
      studentId: updatedAttendance.studentId,
      classSessionId: updatedAttendance.classSessionId,
    },
    metadataJson: { source: 'teacher_action' },
  });

  revalidatePath('/workspaces/teacher');
  revalidatePath('/attendance');
}

export async function bulkMarkAttendance(
  sessionId: string,
  updates: { id: string; status: AttendanceStatus }[]
) {
  const session = await requireRole(['OWNER', 'ADMIN', 'TEACHER']);
  const tenantId = session.activeTenantId;

  // Validate that all attendances belong to the tenant and session
  // For safety and performance, we'll do a transaction
  await prisma.$transaction(async (tx) => {
    for (const update of updates) {
      const updatedAttendance = await tx.attendance.update({
        where: {
          id: update.id,
          tenantId,
          classSessionId: sessionId
        },
        data: { status: update.status },
        include: {
          student: true,
          session: {
            include: { class: true }
          }
        }
      });

      if (update.status === 'ABSENT' || update.status === 'LATE') {
        const studentName = updatedAttendance.student.name;
        const className = updatedAttendance.session.class.classCode;
        const time = new Date(updatedAttendance.session.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const date = new Date(updatedAttendance.session.startTime).toLocaleDateString('vi-VN');
        const statusText = update.status === 'ABSENT' ? 'vắng mặt' : 'đi trễ';
        
        const messageContent = `EduOS thông báo: Học viên ${studentName} đã ${statusText} tại lớp ${className} vào lúc ${time} ngày ${date}.`;
        
        await createSandboxOutboxItem({
          content: messageContent,
          channel: 'ZALO',
          messageSafeSummary: `Báo vắng/trễ: ${studentName}`,
          idempotencyKey: `attendance_${updatedAttendance.classSessionId}_${updatedAttendance.studentId}`
        });
      }
    }
  });

  await createAuditLog(prisma, {
    tenantId,
    actorId: session.userId,
    action: 'ATTENDANCE_BULK_MARKED',
    entityType: 'ClassSession',
    entityId: sessionId,
    afterJson: {
      updateCount: updates.length,
      statuses: updates.reduce<Record<string, number>>((acc, update) => {
        acc[update.status] = (acc[update.status] || 0) + 1;
        return acc;
      }, {}),
    },
    metadataJson: { source: 'teacher_action' },
  });

  revalidatePath('/workspaces/teacher');
  revalidatePath('/attendance');
}
