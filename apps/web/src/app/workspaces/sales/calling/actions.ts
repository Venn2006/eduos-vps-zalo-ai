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

    const leadId = formData.get('leadId')?.toString() || '';
    const outcome = formData.get('outcome')?.toString() || '';
    const notes = formData.get('notes')?.toString();

    await validateAndLogCallOutcome({
      tenantId,
      userId,
      role,
      leadId,
      outcome,
      notes,
      fetchLead: async (lId, tId) => {
        const lead = await prisma.lead.findUnique({ where: { id: lId, tenantId: tId } });
        return lead ? { id: lead.id, assignedToId: lead.assignedToId } : null;
      },
      executeTransaction: async (data) => {
        await prisma.$transaction(async (tx) => {
          await tx.callAttempt.create({ data: data.callAttemptData });
          await tx.lead.update({ where: { id: leadId }, data: data.leadUpdateData });
        });
      }
    });

    revalidatePath('/workspaces/sales/calling');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to log call outcome:', error);
    return { success: false, error: error.message || 'Internal server error' };
  }
}
