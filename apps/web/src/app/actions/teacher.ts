"use server";

import { prisma } from '@eduos/db';
import { getCurrentTenantOrThrow } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { AttendanceStatus } from '@eduos/db';
import { createSandboxOutboxItem } from '../settings/mock-outbox/actions';

export async function markAttendance(
  attendanceId: string,
  status: AttendanceStatus
) {
  const tenantId = await getCurrentTenantOrThrow();

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

  if (status === 'ABSENT' || status === 'LATE') {
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
      idempotencyKey: `attendance_${updatedAttendance.classSessionId}_${updatedAttendance.studentId}`
    });
  }

  revalidatePath('/workspaces/teacher');
  revalidatePath('/attendance');
}

export async function bulkMarkAttendance(
  sessionId: string,
  updates: { id: string; status: AttendanceStatus }[]
) {
  const tenantId = await getCurrentTenantOrThrow();

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

  revalidatePath('/workspaces/teacher');
  revalidatePath('/attendance');
}
