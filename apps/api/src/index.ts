import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import { logger } from "@eduos/logger";
import { prisma, createAuditLog } from "@eduos/db";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import cookie from "@fastify/cookie";

const server = Fastify();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_super_secret_for_development");

// Register fastify-cookie
server.register(cookie, {
  secret: "cookie-secret", // for signed cookies
  parseOptions: {}
});

// Decorate request
declare module "fastify" {
  interface FastifyRequest {
    session?: {
      userId: string;
      email: string;
      activeTenantId: string;
      role: string;
    };
    connector?: {
      tenantId: string;
      accountId: string;
    }
  }
}

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

// --- AUTH ROUTES ---
server.register(async function (fastify) {
  fastify.post("/auth/login", async (request, reply) => {
    try {
      const { email, password } = request.body as any;
      
      if (!email || !password) {
        return reply.status(400).send({ error: "Email and password required" });
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { tenantMembers: true }
      });

      if (!user) {
        return reply.status(401).send({ error: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return reply.status(401).send({ error: "Invalid credentials" });
      }

      let activeTenantId = "";
      let role = "";
      
      if (user.tenantMembers.length > 0) {
        const member = user.tenantMembers[0];
        activeTenantId = member.tenantId;
        role = member.role;
      }

      const token = await new SignJWT({
        userId: user.id,
        email: user.email,
        activeTenantId,
        role
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(JWT_SECRET);

      if (activeTenantId) {
        await createAuditLog(prisma, {
          tenantId: activeTenantId,
          actorId: user.id,
          action: "USER_LOGIN_SUCCESS",
          entityType: "USER",
          entityId: user.id
        });
      }

      reply.setCookie("session_token", token, {
        path: "/",
        httpOnly: true,
        secure: false, // FORCE FALSE FOR LOCAL DEMO OVER HTTP
        sameSite: "lax",
        maxAge: 24 * 60 * 60
      });

      return { success: true };
    } catch (e: any) {
      console.error("Login failed internally", e);
      return reply.status(500).send({ error: "Internal Auth Error: " + e.message });
    }
  });

  fastify.post("/auth/logout", async (request, reply) => {
    reply.clearCookie("session_token", { path: "/" });
    return { success: true };
  });

  fastify.get("/auth/logout", async (request, reply) => {
    reply.clearCookie("session_token", { path: "/" });
    return reply.redirect("http://localhost:3000/login");
  });

  fastify.get("/dev/diagnostic", async (request, reply) => {
    const tenants = await prisma.tenant.findMany();
    const students = await prisma.student.count();
    const leads = await prisma.lead.count();
    const trialBookings = await prisma.trialBooking.count();
    const invoices = await prisma.invoice.count();
    const zaloAccounts = await prisma.zaloPersonalAccount.count();
    const zaloGroups = await prisma.zaloGroup.count();

    return {
      tenants,
      counts: {
        students,
        leads,
        trialBookings,
        invoices,
        zaloAccounts,
        zaloGroups
      }
    };
  });
}, { prefix: "/api" });

import connectorRoutes from "./routes/connectors";
import devRoutes from "./routes/dev";

// --- CONNECTOR ROUTES ---
server.register(connectorRoutes, { prefix: "/api/connectors" });

// --- DEV ROUTES ---
server.register(devRoutes, { prefix: "/api" });

// --- FACEBOOK WEBHOOK ---
server.register(async function (fastify) {
  fastify.post("/webhooks/facebook", async () => ({ status: "RECEIVED" }));
}, { prefix: "/api" });

// --- PROTECTED BUSINESS ROUTES ---
server.register(async function (fastify) {
  fastify.addHook("preHandler", async (request, reply) => {
    const token = request.cookies.session_token;
    if (!token) {
      return reply.status(401).send({ error: "Unauthorized" });
    }
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      request.session = payload as any;
    } catch (err) {
      return reply.status(401).send({ error: "Invalid token" });
    }
  });

  fastify.get("/leads", async (request) => {
    return [];
  });
  fastify.get("/classes", async (request) => {
    return [];
  });
  fastify.get("/payments", async (request) => {
    return [];
  });
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
