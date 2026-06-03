'use server';

import { prisma } from '@eduos/db';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { validateAndLogCallOutcome } from '@eduos/shared/src/lib/salesCallingHelper';

export async function logCallOutcome(formData: FormData) {
  try {
    const authSession = await getSession();
    const role = authSession?.role;
    const tenantId = await getCurrentTenantOrThrow();
    const userId = authSession?.userId;

    const leadId = formData.get('leadId') as string;
    const outcome = formData.get('outcome') as any;
    const notes = formData.get('notes') as string;
    const trialDate = formData.get('trialDate') as string;
    const studentName = formData.get('studentName') as string;

    await validateAndLogCallOutcome({
      tenantId,
      userId,
      role,
      leadId,
      outcome,
      notes,
      trialDate,
      studentName,
      fetchLead: async ({ id, tenantId }) => {
        return await prisma.lead.findUnique({
          where: { id, tenantId },
          select: { id: true, assignedToId: true },
        });
      },
      executeTransaction: async (data) => {
        await prisma.$transaction(async (tx) => {
          await tx.callAttempt.create({ data: data.callAttemptData });
          await tx.lead.update({ where: { id: leadId }, data: data.leadUpdateData });
          if (data.followUpTaskData) {
            await tx.followUpTask.create({ data: data.followUpTaskData });
          }
          if (data.trialBookingData) {
            await tx.trialBooking.create({ data: data.trialBookingData });
          }
          if (data.auditLogData) {
            await tx.auditLog.create({ data: data.auditLogData });
          }
        });
      }
    });

    revalidatePath('/workspaces/sales/calling');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi hệ thống' };
  }
}
