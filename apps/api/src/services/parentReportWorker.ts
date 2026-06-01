import { prisma } from "@eduos/db";

export async function processParentReportDeliveries() {
  console.log("Running processParentReportDeliveries...");

  // Find deliveries that are APPROVED or PENDING_APPROVAL but don't have an outboxMessageId
  const deliveries = await prisma.parentReportDelivery.findMany({
    where: {
      status: { in: ["PENDING_APPROVAL", "APPROVED"] },
      outboxMessageId: null
    },
    include: {
      report: true,
      guardian: { include: { zaloIdentities: true } }
    }
  });

  for (const delivery of deliveries) {
    if (delivery.targetChannel === "ZALO_PERSONAL") {
      const identities = delivery.guardian.zaloIdentities;
      let identityToUse = delivery.targetZaloIdentityId ? identities.find((i: any) => i.id === delivery.targetZaloIdentityId) : identities[0];

      if (!identityToUse) {
        await prisma.parentReportDelivery.update({
          where: { id: delivery.id },
          data: { status: "MANUAL_REQUIRED", errorMessage: "No ZaloIdentity found for guardian" }
        });
        continue;
      }

      // Create outbox message
      const text = delivery.report.finalContent || delivery.report.aiDraftContent;
      
      const outboxMsg = await prisma.zaloOutboxMessage.create({
        data: {
          tenantId: delivery.tenantId,
          targetIdentityId: identityToUse.id,
          text: `[BÁO CÁO PHỤ HUYNH]\n${text}`,
          isSensitive: true, // IMPORTANT: Marks as sensitive to prevent group sending
          status: delivery.status === "APPROVED" ? "APPROVED" : "PENDING_APPROVAL",
        }
      });

      await prisma.parentReportDelivery.update({
        where: { id: delivery.id },
        data: { outboxMessageId: outboxMsg.id, targetZaloIdentityId: identityToUse.id }
      });
    } else {
      // Manual required if not Zalo Personal
      await prisma.parentReportDelivery.update({
        where: { id: delivery.id },
        data: { status: "MANUAL_REQUIRED" }
      });
    }
  }
}
