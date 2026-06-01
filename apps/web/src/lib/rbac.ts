// Helper for Role-Based Access Control

export type Role = "OWNER" | "ADMIN" | "SALE" | "TEACHER" | "ACCOUNTANT" | "UNKNOWN";

export const ROLE_MATRIX: Record<Role, string[]> = {
  OWNER: ["*"],
  ADMIN: ["*"],
  SALE: [
    "/workspaces",
    "/ai-center",
    "/fanpage-inbox",
    "/leads",
    "/trial-bookings",
    "/zalo-inbox", // Implicit for sales/care
    "/zalo-groups", // Implicit for sales/care
  ],
  TEACHER: [
    "/workspaces",
    "/ai-center",
    "/classes",
    "/attendance",
    "/homework",
    "/students",
  ],
  ACCOUNTANT: [
    "/workspaces",
    "/ai-center",
    "/payments",
    "/renewals",
  ],
  UNKNOWN: []
};

export function canAccessRoute(role: string | undefined, currentPath: string): boolean {
  if (!role) return false;
  
  const normalizedRole = role as Role;
  const allowedRoutes = ROLE_MATRIX[normalizedRole] || [];

  if (allowedRoutes.includes("*")) {
    return true;
  }

  // Exact match or base path match (e.g. /leads/123 -> allowed if /leads is allowed)
  return allowedRoutes.some(route => currentPath === route || currentPath.startsWith(route + "/"));
}
