import { AsyncLocalStorage } from "async_hooks";
import { PrismaClient } from "@prisma/client";

export const tenantContext = new AsyncLocalStorage<{ tenantId: string }>();

// Optional: A helper that wraps prisma with tenant-specific queries
export function getTenantPrisma(prisma: PrismaClient, tenantId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          // Automatic tenant injection would go here for production.
          // For now, we simply require tenantId in the args for all standard queries.
          if ((args as any).where) {
            (args as any).where.tenantId = tenantId;
          } else {
            (args as any).where = { tenantId };
          }
          if ((args as any).data) {
            (args as any).data.tenantId = tenantId;
          }
          return query(args);
        },
      },
    },
  });
}
