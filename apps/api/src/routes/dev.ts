import { FastifyInstance } from "fastify";
import { prisma } from "@eduos/db";
import { addMinutes } from "date-fns";
import { logger } from "@eduos/logger";

export default async function devRoutes(app: FastifyInstance) {
  app.post("/dev/create-test-session", async (request, reply) => {
    try {
      // Find a class that has automation enabled and is linked to a group
      const activeClass = await prisma.class.findFirst({
        where: {
          zaloGroup: { isNot: null },
          automationSetting: { classReminderEnabled: true }
        },
        include: { automationSetting: true }
      });

      if (!activeClass) {
        return reply.status(404).send({ success: false, reason: "No suitable class found" });
      }

      const tenantId = activeClass.tenantId;

      // Create a session exactly 60 minutes from now, ending 120 minutes from now
      // Start time exactly 61 minutes from now, zeroing out seconds and milliseconds
      const now = new Date();
      const startTime = addMinutes(now, 61);
      startTime.setSeconds(0, 0);
      const endTime = addMinutes(startTime, 90);

      const session = await prisma.classSession.create({
        data: {
          tenantId,
          classId: activeClass.id,
          sessionDate: now,
          startTime,
          endTime,
          status: "SCHEDULED",
          topic: "Bài test hệ thống"
        }
      });

      logger.info(`[Dev] Created test session ${session.id} starting at ${startTime.toISOString()}`);
      return reply.send({ success: true, session });
    } catch (error: any) {
      return reply.status(500).send({ success: false, error: error.message });
    }
  });
}
