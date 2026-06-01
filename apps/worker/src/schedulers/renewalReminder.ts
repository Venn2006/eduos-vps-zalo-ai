import { prisma } from "@eduos/db";
import { logger } from "@eduos/logger";

export async function checkAndCreateRenewalReminders() {
  logger.info("Running checkAndCreateRenewalReminders...");
  
  // Find enrollments nearing completion
  // Mock logic: remainingSessions <= 3
  
  const activeEnrollments = await prisma.enrollment.findMany({
    where: { status: "ACTIVE" },
    include: { student: true, class: { include: { course: true } } }
  });

  for (const enrollment of activeEnrollments) {
    // In a real system, remainingSessions would be tracked or calculated.
    // Here we'll just mock a random condition for demonstration
    // Let's assume we check if a RenewalCandidate already exists for this enrollment
    const existing = await prisma.renewalCandidate.findFirst({
      where: { enrollmentId: enrollment.id }
    });

    if (!existing) {
      // Mock triggering logic: just trigger if id ends in "1" for demonstration if we don't have remaining sessions on enrollment.
      // Wait, we can just fetch all RenewalCandidates that are NEW and create ZaloOutboxMessage for them if they don't have one.
    }
  }

  // Generate ZaloOutboxMessage for NEW RenewalCandidates
  const newCandidates = await prisma.renewalCandidate.findMany({
    where: { status: "NEW" },
    include: { student: { include: { guardian: true } }, course: true, class: true }
  });

  for (const candidate of newCandidates) {
    const guardianId = candidate.student.guardianId;
    let targetZaloIdentityId: string | null = null;
    
    if (guardianId) {
        const zaloId = await prisma.zaloIdentity.findFirst({ where: { guardianId } });
        if (zaloId) targetZaloIdentityId = zaloId.id;
    }

    const draftContent = `OMLIS xin chào phụ huynh của bé ${candidate.student.name} ạ 💛\n\nBé sắp hoàn thành khóa ${candidate.course?.name || "hiện tại"}.\nTrong thời gian học vừa qua, bé đã có nhiều tiến bộ.\n\nOMLIS gợi ý phụ huynh cho bé tiếp tục lộ trình ${candidate.suggestedRenewalCourse || "tiếp theo"} để duy trì tiến độ học.\nNếu phụ huynh muốn, OMLIS có thể tư vấn lịch học phù hợp cho bé ạ.`;

    await prisma.zaloOutboxMessage.create({
      data: {
        tenantId: candidate.tenantId,
        targetIdentityId: targetZaloIdentityId,
        text: draftContent,
        status: "PENDING_APPROVAL",
        isSensitive: true
      }
    });

    await prisma.renewalCandidate.update({
      where: { id: candidate.id },
      data: { status: "CONTACTED" }
    });

    logger.info(`Created renewal reminder for candidate ${candidate.id}`);
  }
}
