"use server";

import { prisma } from '@eduos/db';
import { getCurrentTenantOrThrow } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { AttendanceStatus } from '@eduos/db';

export async function markAttendance(
  attendanceId: string,
  status: AttendanceStatus
) {
  const tenantId = await getCurrentTenantOrThrow();

  await prisma.attendance.update({
    where: { 
      id: attendanceId,
      tenantId
    },
    data: { status }
  });

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
  await prisma.$transaction(
    updates.map((update) => 
      prisma.attendance.update({
        where: {
          id: update.id,
          tenantId,
          classSessionId: sessionId
        },
        data: { status: update.status }
      })
    )
  );

  revalidatePath('/workspaces/teacher');
  revalidatePath('/attendance');
}
