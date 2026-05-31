import { prisma } from "@eduos/db";
import { logger } from "@eduos/logger";

export async function queueAiGrading(tenantId: string, submissionId: string) {
  // In a real app, this would push to bullmq
  // For MVP, we'll execute the mock AI grading inline or simulate delay
  
  logger.info(`[AI Grading] Queued grading for submission ${submissionId}`);

  setTimeout(async () => {
    try {
      const submission = await prisma.homeworkSubmission.findUnique({
        where: { id: submissionId },
        include: { homework: true, student: true }
      });

      if (!submission) return;

      const score = Math.floor(Math.random() * 3) + 7; // Random score 7-9
      const comment = "Bài làm khá tốt, cần chú ý ngữ pháp câu 2.";

      await prisma.$transaction([
        prisma.aiGradeDraft.create({
          data: {
            tenantId,
            submissionId,
            score,
            comment,
          }
        }),
        prisma.homeworkSubmission.update({
          where: { id: submissionId },
          data: { status: "AI_GRADED" }
        })
      ]);

      logger.info(`[AI Grading] Completed grading for submission ${submissionId}`);
    } catch (e: any) {
      logger.error("[AI Grading] Failed to mock AI grading", { error: e.message });
    }
  }, 2000); // 2 second mock delay
}
