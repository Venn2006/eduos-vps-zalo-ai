import Fastify from "fastify";
import { logger } from "@eduos/logger";

const server = Fastify();

// Middlewares (placeholders)
server.addHook("onRequest", async (request, reply) => {
  // requestId, tenantContext, auth placeholders
});

server.setErrorHandler(function (error, request, reply) {
  logger.error("API Error", { error });
  reply.status(500).send({ error: "Internal Server Error" });
});

server.get("/health", async () => {
  return { status: "OK", version: "1.0.0" };
});

server.get("/version", async () => {
  return { version: "1.0.0" };
});

// Route groups placeholders
server.register(async function (fastify) {
  fastify.post("/auth/login", async () => ({ token: "mock-token" }));
}, { prefix: "/api" });

server.register(async function (fastify) {
  fastify.post("/connectors/zalo/heartbeat", async () => ({ status: "OK" }));
  fastify.post("/connectors/zalo/inbound", async () => ({ status: "OK" }));
}, { prefix: "/api" });

server.register(async function (fastify) {
  fastify.post("/webhooks/facebook", async () => ({ status: "RECEIVED" }));
}, { prefix: "/api" });

server.register(async function (fastify) {
  fastify.get("/leads", async () => ([]));
  fastify.get("/classes", async () => ([]));
  fastify.get("/payments", async () => ([]));
}, { prefix: "/api" });

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || "3001");
    await server.listen({ port, host: '0.0.0.0' });
    logger.info(`API Server started on port ${port}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();
