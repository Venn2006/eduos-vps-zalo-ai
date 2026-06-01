import { FastifyInstance } from "fastify";
import { prisma } from "@eduos/db";
// We'll mock the session directly to avoid importing jose which causes ESM errors in jest
import Fastify from "fastify";
import cookie from "@fastify/cookie";
import aiCenterRoutes from "../routes/ai-center";

async function buildTestServer() {
  const server = Fastify();
  server.register(cookie);
  
  server.addHook("preHandler", async (request, reply) => {
    const role = request.headers["x-test-role"];
    const tenantId = request.headers["x-test-tenant"];
    if (role && tenantId) {
      request.session = {
        userId: "user-1",
        email: "test@example.com",
        activeTenantId: tenantId as string,
        role: role as string
      };
    }
  });

  server.register(aiCenterRoutes, { prefix: "/api/ai" });
  await server.ready();
  return server;
}

describe("AI Command Center - CEO Chat API", () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await buildTestServer();
    await prisma.user.upsert({
      where: { email: "test@example.com" },
      update: {},
      create: { id: "user-1", email: "test@example.com", passwordHash: "x" }
    });
    await prisma.tenant.upsert({
      where: { slug: "test-tenant-1" },
      update: {},
      create: { id: "test-tenant-1", name: "Test", slug: "test-tenant-1" }
    });
  });

  afterAll(async () => {
    await server.close();
  });

  it("should block TEACHER from accessing CEO Chat", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/ai/ceo-chat",
      headers: { "x-test-role": "TEACHER", "x-test-tenant": "test-tenant-1" },
      payload: { message: "Hello" }
    });
    
    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.payload).error).toContain("restricted to OWNER/ADMIN");
  });

  it("should block SALE from accessing CEO Chat", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/ai/ceo-chat",
      headers: { "x-test-role": "SALE", "x-test-tenant": "test-tenant-1" },
      payload: { message: "Hello" }
    });
    expect(response.statusCode).toBe(403);
  });

  it("should allow OWNER to access CEO Chat", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/ai/ceo-chat",
      headers: { "x-test-role": "OWNER", "x-test-tenant": "test-tenant-1" },
      payload: { message: "Hôm nay tuyển được bao nhiêu lead?" }
    });
    if (response.statusCode === 500) console.error(response.payload);
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.threadId).toBeDefined();
    expect(body.message.role).toBe("ASSISTANT");
    expect(body.message.content).toContain("tuyển được");
    expect(body.message.sourceModule).toBeUndefined(); // we didn't expose sourceModule in response directly, but it's in DB
  });

  it("should create AiCommandRun and AiAgentFinding in DB for risk queries", async () => {
    const tenantId = "test-tenant-ai-1";
    // Setup a fake tenant
    await prisma.user.upsert({
      where: { email: "test@example.com" },
      update: {},
      create: { id: "user-1", email: "test@example.com", passwordHash: "x" }
    });
    await prisma.tenant.upsert({
      where: { slug: "test-tenant-ai-1" },
      update: {},
      create: { id: tenantId, name: "AI Test", slug: "test-tenant-ai-1" }
    });

    // Send a query that triggers risk logic
    const response = await server.inject({
      method: "POST",
      url: "/api/ai/ceo-chat",
      headers: { "x-test-role": "ADMIN", "x-test-tenant": tenantId },
      payload: { message: "Hôm nay có vấn đề gì nghiêm trọng không?" }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    
    // Check DB
    const runs = await prisma.aiCommandRun.findMany({ where: { tenantId } });
    expect(runs.length).toBeGreaterThan(0);
    expect(runs[0].sourceModule).toBe("SYSTEM");

    const message = await prisma.aiCommandMessage.findUnique({
      where: { id: body.message.id }
    });
    expect(message?.severity).toBeDefined();
  });
});
