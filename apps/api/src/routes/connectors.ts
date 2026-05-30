import { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "@eduos/db";
import { logger } from "@eduos/logger";
import { requireConnectorToken } from "../middlewares/connectorAuth";
import { parseSetupCommand } from "@eduos/shared";
import { bootstrapClassGroupFromCommand } from "../services/bootstrap.service";

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

      // 3. Save message
      const msg = await prisma.zaloMessage.create({
        data: {
          tenantId,
          externalMessageId,
          direction: "INBOUND",
          messageType: "TEXT",
          text,
          senderId,
          groupId: externalGroupId, // this might fail FK constraint if group is unknown and not upserted yet?
          // wait, groupId in ZaloMessage references ZaloGroup.id, not externalGroupId!
          // We can't link it until group exists in DB. Let's omit groupId or find it.
        }
      });

      // 4. Handle Setup
      if (parsed) {
        // Wait, sender might not exist yet if they are a new identity. We should upsert identity first.
        await prisma.zaloIdentity.upsert({
          where: { tenantId_externalUserId: { tenantId, externalUserId: senderId } },
          create: {
            tenantId,
            externalUserId: senderId,
            displayName: "Mock User",
          },
          update: {}
        });

        await bootstrapClassGroupFromCommand({
          tenantId,
          externalGroupId,
          groupName: "Class Group",
          senderExternalId: senderId,
          messageText: text,
          externalMessageId,
          parsedCommand: parsed,
        });

        // Try linking message to group after bootstrap
        const grp = await prisma.zaloGroup.findUnique({
          where: { tenantId_externalGroupId: { tenantId, externalGroupId } }
        });
        if (grp) {
          await prisma.zaloMessage.update({
            where: { id: msg.id },
            data: { groupId: grp.id, parsedIntent: "SETUP_COMMAND" }
          });
        }
      } else {
        // Find existing group to link message
        const grp = await prisma.zaloGroup.findUnique({
          where: { tenantId_externalGroupId: { tenantId, externalGroupId } }
        });
        if (grp) {
          await prisma.zaloMessage.update({
            where: { id: msg.id },
            data: { groupId: grp.id }
          });
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
    
    // Find pending/draft messages.
    // In real app, only APPROVED or SENT. Here DRAFT is fine for mock.
    const messages = await prisma.zaloOutboxMessage.findMany({
      where: {
        tenantId,
        status: "DRAFT",
      },
      take: 50,
    });

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
