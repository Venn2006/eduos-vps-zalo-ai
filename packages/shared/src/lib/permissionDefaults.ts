export type Role = "OWNER" | "ADMIN" | "SALE" | "TEACHER" | "ACCOUNTANT" | "UNKNOWN";

export type PermissionModule = 
  | "DASHBOARD"
  | "AI_CENTER"
  | "REPORTS"
  | "SETTINGS"
  | "PERMISSIONS"
  | "AUDIT_LOG"
  | "CONNECTORS"
  | "PRODUCTION_READINESS"
  | "SALES_WORKSPACE"
  | "SALES_CALLING"
  | "LEADS"
  | "TRIAL_BOOKINGS"
  | "FANPAGE_INBOX"
  | "ZALO_INBOX"
  | "ZALO_GROUPS"
  | "TEACHER_WORKSPACE"
  | "CLASSES"
  | "ATTENDANCE"
  | "HOMEWORK"
  | "STUDENTS"
  | "FINANCE_WORKSPACE"
  | "PAYMENTS"
  | "RENEWALS";

export const DEFAULT_PERMISSION_MATRIX: Record<Role, PermissionModule[]> = {
  OWNER: [
    "DASHBOARD", "AI_CENTER", "REPORTS", "SETTINGS", "PERMISSIONS", "AUDIT_LOG",
    "CONNECTORS", "PRODUCTION_READINESS", "SALES_WORKSPACE", "SALES_CALLING",
    "LEADS", "TRIAL_BOOKINGS", "FANPAGE_INBOX", "ZALO_INBOX", "ZALO_GROUPS",
    "TEACHER_WORKSPACE", "CLASSES", "ATTENDANCE", "HOMEWORK", "STUDENTS",
    "FINANCE_WORKSPACE", "PAYMENTS", "RENEWALS"
  ],
  ADMIN: [
    "DASHBOARD", "AI_CENTER", "REPORTS", "SETTINGS", "PERMISSIONS", "AUDIT_LOG",
    "CONNECTORS", "PRODUCTION_READINESS", "SALES_WORKSPACE", "SALES_CALLING",
    "LEADS", "TRIAL_BOOKINGS", "FANPAGE_INBOX", "ZALO_INBOX", "ZALO_GROUPS",
    "TEACHER_WORKSPACE", "CLASSES", "ATTENDANCE", "HOMEWORK", "STUDENTS",
    "FINANCE_WORKSPACE", "PAYMENTS", "RENEWALS"
  ],
  SALE: [
    "AI_CENTER",
    "SALES_WORKSPACE", "SALES_CALLING", "LEADS", "TRIAL_BOOKINGS",
    "FANPAGE_INBOX", "ZALO_INBOX", "ZALO_GROUPS"
  ],
  TEACHER: [
    "AI_CENTER",
    "TEACHER_WORKSPACE", "CLASSES", "ATTENDANCE", "HOMEWORK", "STUDENTS"
  ],
  ACCOUNTANT: [
    "AI_CENTER",
    "FINANCE_WORKSPACE", "PAYMENTS", "RENEWALS"
  ],
  UNKNOWN: []
};

/**
 * Validates whether a specific role has default access to a given module.
 * Note: This is part of the dynamic permission foundation and DOES NOT replace
 * the hardcoded global `canAccessRoute` RBAC logic currently in use.
 */
export function hasDefaultPermission(role: Role | undefined, module: PermissionModule): boolean {
  if (!role) return false;
  const modules = DEFAULT_PERMISSION_MATRIX[role] || [];
  return modules.includes(module);
}
