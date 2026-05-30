import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@eduos/db";
import { logger } from "@eduos/logger";

export async function requireConnectorToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn("Missing or invalid connector token");
    return reply.status(401).send({ error: "Unauthorized" });
  }

  const token = authHeader.substring(7);

  try {
    const session = await prisma.zaloConnectorSession.findUnique({
      where: { tokenHash: token },
      include: {
        account: true,
      },
    });

    if (!session || session.status === "OFFLINE" || !session.account.isActive) {
      logger.warn("Connector session invalid or offline");
      return reply.status(401).send({ error: "Invalid connector token" });
    }

    // Attach to request
    (request as any).connectorContext = {
      tenantId: session.tenantId,
      accountId: session.accountId,
      sessionId: session.id,
    };
  } catch (error) {
    logger.error("Error validating connector token", { error });
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}
