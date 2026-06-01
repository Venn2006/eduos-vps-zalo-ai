import { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "@eduos/db";
import { logger } from "@eduos/logger";
import { requireConnectorToken } from "../middlewares/connectorAuth";
import { parseSetupCommand } from "@eduos/shared";
import { bootstrapClassGroupFromCommand } from "../services/bootstrap.service";
import { processAttendanceMessage } from "../services/attendance.service";
import { processHomeworkMessage } from "../services/homework.service";

interface ConnectorContext {
  tenantId: string;
  accountId: string;
  sessionId: string;
}

export default async function connectorRoutes(app: FastifyInstance) {
  // Apply middleware to all routes in this plugin
  app.addHook("preHandler", requireConnectorToken);

  app.post("/zalo/heartbeat", async (request, reply) => {
    const { tenantId, sessionId } = (request as any).connectorContext as ConnectorContext;
    
    await prisma.zaloConnectorSession.update({
      where: { id: sessionId },
      data: { lastPing: new Date(), status: "ONLINE" }
    });

    await prisma.connectorHeartbeat.create({
      data: {
        tenantId,
        status: "ONLINE"
      }
    });

    return reply.send({ success: true });
  });

  app.post("/zalo/inbound/group-message", async (request, reply) => {
    const { tenantId } = (request as any).connectorContext as ConnectorContext;
    const body = request.body as any;

    const externalMessageId = body.messageId || `mock-${Date.now()}`;
    const externalGroupId = body.groupId;
    const text = body.text || "";
    const senderId = body.senderId || "mock-sender";

    if (!externalGroupId) {
      return reply.send({ success: false, reason: "Not a group message" });
    }

    try {
      // 1. Deduplication
      const existing = await prisma.zaloMessage.findUnique({
        where: { tenantId_externalMessageId: { tenantId, externalMessageId } }
      });
      if (existing) {
        return reply.send({ success: true, reason: "Duplicate ignored" });
      }

      // 2. Setup parsing
      const parsed = parseSetupCommand(text);

      let intent = "UNKNOWN";
      if (parsed) {
        intent = "SETUP_COMMAND";
      }

      // 3. Prepare identity
      let sender = await prisma.zaloIdentity.findUnique({
        where: { tenantId_externalUserId: { tenantId, externalUserId: senderId } }
      });

      if (!sender) {
        try {
          sender = await prisma.zaloIdentity.create({
            data: {
              tenantId,
              externalUserId: senderId,
              displayName: "Mock User",
            }
          });
        } catch (e: any) {
          // If another concurrent request just created it, fetch it again
          sender = await prisma.zaloIdentity.findUnique({
            where: { tenantId_externalUserId: { tenantId, externalUserId: senderId } }
          });
        }
      }

      if (!sender) {
        throw new Error("Failed to resolve sender identity.");
      }

      // 4. Try finding group
      const grp = await prisma.zaloGroup.findUnique({
        where: { tenantId_externalGroupId: { tenantId, externalGroupId } }
      });

      // 5. Save message
      const msg = await prisma.zaloMessage.create({
        data: {
          tenantId,
          externalMessageId,
          direction: "INBOUND",
          messageType: "TEXT",
          text,
          senderId: sender.id,
          groupId: grp?.id, // Use internal ID
        }
      });

      // 6. Handle Setup
      if (parsed) {
        await bootstrapClassGroupFromCommand({
          tenantId,
          externalGroupId,
          groupName: "Class Group",
          senderExternalId: senderId,
          messageText: text,
          externalMessageId,
          parsedCommand: parsed,
        });

        // Try linking message to group after bootstrap if it wasn't linked
        if (!grp) {
          const newGrp = await prisma.zaloGroup.findUnique({
            where: { tenantId_externalGroupId: { tenantId, externalGroupId } }
          });
          if (newGrp) {
            await prisma.zaloMessage.update({
              where: { id: msg.id },
              data: { groupId: newGrp.id, parsedIntent: "SETUP_COMMAND" }
            });
          }
        } else {
          await prisma.zaloMessage.update({
            where: { id: msg.id },
            data: { parsedIntent: "SETUP_COMMAND" }
          });
        }
      } else {
        // Pass to attendance service if group exists
        if (grp) {
          // Pass to homework service first to see if it's homework
          const { intent: hwIntent } = await processHomeworkMessage({
            tenantId,
            groupId: externalGroupId,
            senderId,
            text,
            externalMessageId
          });
          
          if (hwIntent !== "UNKNOWN") {
            intent = hwIntent;
          } else {
            // Pass to attendance service
            const { intent: attIntent } = await processAttendanceMessage({
              tenantId,
              groupId: externalGroupId,
              senderId,
              text,
              externalMessageId
            });
            intent = attIntent;
          }
        } else {
           // Reject unknown group if not a setup command
           logger.warn(`Unknown group ${externalGroupId} and not a setup command`);
        }
      }

      return reply.send({ success: true });
    } catch (e: any) {
      logger.error("Error processing group message", { error: e.message });
      return reply.status(500).send({ success: false, error: e.message });
    }
  });

  app.post("/zalo/inbound/direct-message", async (request, reply) => {
    return reply.send({ success: true, reason: "DM ignored for now" });
  });

  app.get("/zalo/outbox", async (request, reply) => {
    const { tenantId } = (request as any).connectorContext as ConnectorContext;
    
    const rawMessages = await prisma.zaloOutboxMessage.findMany({
      where: {
        tenantId,
        status: { in: ["DRAFT", "APPROVED"] }
      },
      take: 50,
    });

    const messages = [];
    for (const msg of rawMessages) {
      const isFinancialCategory = msg.text && (msg.text.toLowerCase().includes("học phí") || msg.text.toLowerCase().includes("tái phí"));
      if ((msg.isSensitive || isFinancialCategory) && msg.targetGroupId) {
        logger.error(`Safety Guard Triggered: Sensitive/Financial message ${msg.id} cannot be sent to group ${msg.targetGroupId}`);
        await prisma.zaloOutboxMessage.update({
          where: { id: msg.id },
          data: { status: "FAILED" }
        });
        continue;
      }
      messages.push(msg);
    }

    return reply.send({ messages });
  });

  app.post("/zalo/outbox/:id/status", async (request, reply) => {
    const { tenantId } = (request as any).connectorContext as ConnectorContext;
    const params = request.params as any;
    const body = request.body as any;
    const { id } = params;
    const { status } = body;

    await prisma.zaloOutboxMessage.updateMany({
      where: { id, tenantId },
      data: { status: status as any, updatedAt: new Date() }
    });

    return reply.send({ success: true });
  });
}
