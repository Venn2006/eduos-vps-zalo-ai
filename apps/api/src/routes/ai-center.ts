import { FastifyInstance } from "fastify";
import { prisma } from "@eduos/db";
import { MockAiProvider } from "@eduos/ai";

export default async function aiCenterRoutes(fastify: FastifyInstance) {
  // Pre-handler for RBAC: Allow all authenticated app roles (except UNKNOWN)
  fastify.addHook("preHandler", async (request, reply) => {
    const session = request.session;
    if (!session || !session.activeTenantId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    if (session.role === "UNKNOWN" || !session.role) {
      return reply.status(403).send({ error: "Forbidden: Role not authorized for CEO Chat" });
    }
  });

  fastify.post("/ceo-chat", async (request, reply) => {
    const session = request.session!;
    const { message, threadId } = request.body as { message: string, threadId?: string };

    if (!message) {
      return reply.status(400).send({ error: "Message is required" });
    }

    try {
      // 1. Resolve Thread
      let activeThreadId = threadId;
      if (!activeThreadId) {
        const thread = await prisma.aiCommandThread.create({
          data: {
            tenantId: session.activeTenantId,
            userId: session.userId,
            title: message.substring(0, 50)
          }
        });
        activeThreadId = thread.id;
      }

      // 2. Save User Message
      await prisma.aiCommandMessage.create({
        data: {
          tenantId: session.activeTenantId,
          threadId: activeThreadId,
          role: "USER",
          content: message
        }
      });

      // 3. Process with MockAiProvider (Role-scope is enforced BEFORE data fetching)
      const aiProvider = new MockAiProvider();
      const response = await aiProvider.answerCeoQuery(message, session.activeTenantId, session.role);

      // 4. Save AI Response Message
      const aiMessage = await prisma.aiCommandMessage.create({
        data: {
          tenantId: session.activeTenantId,
          threadId: activeThreadId,
          role: "ASSISTANT",
          content: response.answer,
          evidenceJson: response.evidenceJson ? JSON.stringify(response.evidenceJson) : null,
          suggestedActionsJson: response.suggestedActionsJson ? JSON.stringify(response.suggestedActionsJson) : null,
          severity: response.severity
        }
      });

      // 5. Save Run Info
      const run = await prisma.aiCommandRun.create({
        data: {
          tenantId: session.activeTenantId,
          messageId: aiMessage.id,
          sourceModule: response.sourceModule,
          rawResultJson: response.rawResultJson ? JSON.stringify(response.rawResultJson) : null,
        }
      });

      // 6. Save Findings
      if (response.severity !== "LOW") {
        await prisma.aiAgentFinding.create({
          data: {
            tenantId: session.activeTenantId,
            runId: run.id,
            findingType: "RISK",
            description: response.answer,
            severity: response.severity
          }
        });
      }

      // 7. Save Pending Action Drafts
      const suggestedActions = response.suggestedActionsJson as Array<{actionType: string, payload: any}>;
      if (suggestedActions && suggestedActions.length > 0) {
        for (const action of suggestedActions) {
          await prisma.aiActionDraft.create({
            data: {
              tenantId: session.activeTenantId,
              messageId: aiMessage.id,
              actionType: action.actionType,
              payloadJson: JSON.stringify(action.payload),
              status: "PENDING_APPROVAL"
            }
          });
        }
      }

      return reply.status(200).send({
        threadId: activeThreadId,
        message: {
          id: aiMessage.id,
          role: aiMessage.role,
          content: aiMessage.content,
          evidence: response.evidenceJson,
          suggestedActions: response.suggestedActionsJson,
          severity: response.severity
        }
      });
    } catch (e: any) {
      request.log.error(e);
      return reply.status(500).send({ error: "Internal AI Error: " + e.message });
    }
  });

  fastify.get("/ceo-chat/threads", async (request, reply) => {
    const session = request.session!;
    const threads = await prisma.aiCommandThread.findMany({
      where: { tenantId: session.activeTenantId, userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    return reply.send({ threads });
  });

  fastify.get("/ceo-chat/threads/:threadId/messages", async (request, reply) => {
    const session = request.session!;
    const { threadId } = request.params as { threadId: string };
    
    const messages = await prisma.aiCommandMessage.findMany({
      where: { tenantId: session.activeTenantId, threadId },
      orderBy: { createdAt: "asc" }
    });

    return reply.send({ messages });
  });
}
