import { prisma } from '@eduos/db';

export interface CeoSnapshot {
  newLeads: { value: number | null; label: string };
  callsToday: { value: number | null; label: string };
  bookedTrialsToday: { value: number | null; label: string };
  followUpsCreatedToday: { value: number | null; label: string };
  trialsToday: { value: number | null; label: string };
  paidAmountToday: { value: number | null; label: string };
  pendingAiDrafts: { value: number | null; label: string };
}

export async function buildComputedCeoSnapshot(tenantId: string): Promise<CeoSnapshot> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  try {
    // 1. New Leads
    const newLeads = await prisma.lead.count({
      where: {
        tenantId,
        createdAt: { gte: startOfDay, lte: endOfDay }
      }
    });

    // 2. Calls Today
    const callsToday = await prisma.callAttempt.count({
      where: {
        tenantId,
        calledAt: { gte: startOfDay, lte: endOfDay }
      }
    });

    // 3. Booked Trials Today (trials that were BOOKED today)
    const bookedTrialsToday = await prisma.trialBooking.count({
      where: {
        tenantId,
        createdAt: { gte: startOfDay, lte: endOfDay }
      }
    });

    // 4. Follow-ups created today
    const followUpsCreatedToday = await prisma.followUpTask.count({
      where: {
        tenantId,
        createdAt: { gte: startOfDay, lte: endOfDay }
      }
    });

    // 5. Trials happening today
    const trialsToday = await prisma.trialBooking.count({
      where: {
        tenantId,
        trialDate: { gte: startOfDay, lte: endOfDay }
      }
    });

    // For payments and AI Drafts, we might not have a reliable schema yet across all branches, 
    // so we return safe fallbacks "Chưa đủ dữ liệu".
    
    return {
      newLeads: { value: newLeads, label: 'Tuyển sinh hôm nay' },
      callsToday: { value: callsToday, label: 'Cuộc gọi hôm nay' },
      bookedTrialsToday: { value: bookedTrialsToday, label: 'Chốt lịch học thử mới' },
      followUpsCreatedToday: { value: followUpsCreatedToday, label: 'Follow-up mới tạo' },
      trialsToday: { value: trialsToday, label: 'Học thử diễn ra hôm nay' },
      paidAmountToday: { value: null, label: 'Chưa đủ dữ liệu' }, // Safe fallback
      pendingAiDrafts: { value: null, label: 'Chưa đủ dữ liệu' }  // Safe fallback
    };
  } catch (err) {
    console.error("Error building CEO snapshot:", err);
    return {
      newLeads: { value: null, label: 'Lỗi tải dữ liệu' },
      callsToday: { value: null, label: 'Lỗi tải dữ liệu' },
      bookedTrialsToday: { value: null, label: 'Lỗi tải dữ liệu' },
      followUpsCreatedToday: { value: null, label: 'Lỗi tải dữ liệu' },
      trialsToday: { value: null, label: 'Lỗi tải dữ liệu' },
      paidAmountToday: { value: null, label: 'Chưa đủ dữ liệu' },
      pendingAiDrafts: { value: null, label: 'Chưa đủ dữ liệu' }
    };
  }
}
