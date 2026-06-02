// Helper for Role-Based Access Control

export type Role = "OWNER" | "ADMIN" | "SALE" | "TEACHER" | "ACCOUNTANT" | "UNKNOWN";

export const ROLE_MATRIX: Record<Role, string[]> = {
  OWNER: ["*"],
  ADMIN: ["*"],
  SALE: [
    "/workspaces",
    "/workspaces/sales",
    "/ai-center",
    "/fanpage-inbox",
    "/leads",
    "/trial-bookings",
    "/zalo-inbox", // Implicit for sales/care
    "/zalo-groups", // Implicit for sales/care
  ],
  TEACHER: [
    "/workspaces",
    "/workspaces/teacher",
    "/ai-center",
    "/classes",
    "/attendance",
    "/homework",
    "/students"
  ],
  ACCOUNTANT: [
    "/workspaces",
    "/workspaces/finance",
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

  // 1. Exact match
  if (allowedRoutes.includes(currentPath)) {
    return true;
  }

  // 2. Base path match (e.g., /leads/123 -> allowed if /leads is allowed)
  // EXCEPT for /workspaces, which does NOT grant access to /workspaces/*
  return allowedRoutes.some(route => {
    if (currentPath.startsWith(route + "/")) {
      // If the matched allowed route is exactly "/workspaces", do not allow sub-routes automatically
      if (route === "/workspaces") {
        return false;
      }
      return true;
    }
    return false;
  });
}
