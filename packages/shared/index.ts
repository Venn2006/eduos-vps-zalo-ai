import { z } from "zod";

// Roles & Enums
export const Roles = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  SALE: "SALE",
  TEACHER: "TEACHER",
  ACCOUNTANT: "ACCOUNTANT",
} as const;

export const QueueNames = {
  ZALO_OUTBOX: "zalo-outbox-queue",
  ZALO_INBOUND: "zalo-inbound-queue",
  FACEBOOK_INBOUND: "facebook-inbound-queue",
  SCHEDULED_TASKS: "scheduled-tasks-queue",
  AI_PROCESSING: "ai-processing-queue",
} as const;

// Zod Schemas
export const TenantIdSchema = z.object({
  tenantId: z.string().cuid("Invalid tenantId"),
});

export const ClassCodeSchema = z.object({
  classCode: z.string().min(1),
});

export const ZaloSetupCommandSchema = z.object({
  tenantId: z.string().cuid(),
  groupId: z.string(),
  classCode: z.string(),
  senderId: z.string(),
});

export const ConnectorHeartbeatSchema = z.object({
  tenantId: z.string().cuid(),
  status: z.string(),
  timestamp: z.string().datetime(),
});

export const InboundZaloMessageSchema = z.object({
  tenantId: z.string().cuid(),
  messageId: z.string(),
  text: z.string().optional(),
  senderId: z.string(),
  groupId: z.string().optional(),
  isGroup: z.boolean(),
  timestamp: z.string().datetime(),
});

export const DashboardSummarySchema = z.object({
  activeClasses: z.number().int().min(0),
  totalStudents: z.number().int().min(0),
  newLeads: z.number().int().min(0),
});
