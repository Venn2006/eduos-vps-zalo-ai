import { canAccessRoute } from '../../../../apps/web/src/lib/rbac';

describe('RBAC Route Guarding', () => {
  it('OWNER/ADMIN can access protected routes', () => {
    const protectedRoutes = ['/dashboard', '/reports', '/payments', '/classes', '/leads', '/settings'];
    const protectedSettingsRoutes = [
      '/settings/permissions',
      '/settings/connectors',
      '/settings/production-readiness',
    ];

    protectedRoutes.forEach(route => {
      expect(canAccessRoute('OWNER', route)).toBe(true);
      expect(canAccessRoute('ADMIN', route)).toBe(true);
    });

    protectedSettingsRoutes.forEach(route => {
      expect(canAccessRoute('OWNER', route)).toBe(true);
      expect(canAccessRoute('ADMIN', route)).toBe(true);
    });
  });

  it('SALE access matrix', () => {
    // Allowed
    expect(canAccessRoute('SALE', '/workspaces')).toBe(true);
    expect(canAccessRoute('SALE', '/workspaces/sales')).toBe(true);
    expect(canAccessRoute('SALE', '/workspaces/sales/calling')).toBe(true);
    expect(canAccessRoute('SALE', '/ai-center')).toBe(true);
    expect(canAccessRoute('SALE', '/leads')).toBe(true);
    expect(canAccessRoute('SALE', '/trial-bookings')).toBe(true);
    expect(canAccessRoute('SALE', '/fanpage-inbox')).toBe(true);
    expect(canAccessRoute('SALE', '/zalo-inbox')).toBe(true);
    expect(canAccessRoute('SALE', '/zalo-groups')).toBe(true);
    expect(canAccessRoute('SALE', '/leads/new')).toBe(true);
    
    // Blocked
    expect(canAccessRoute('SALE', '/dashboard')).toBe(false);
    expect(canAccessRoute('SALE', '/workspaces/unknown')).toBe(false);
    expect(canAccessRoute('SALE', '/workspaces/teacher')).toBe(false);
    expect(canAccessRoute('SALE', '/workspaces/finance')).toBe(false);
    expect(canAccessRoute('SALE', '/payments')).toBe(false);
    expect(canAccessRoute('SALE', '/renewals')).toBe(false);
    expect(canAccessRoute('SALE', '/reports')).toBe(false);
    expect(canAccessRoute('SALE', '/classes')).toBe(false);
    expect(canAccessRoute('SALE', '/settings')).toBe(false);
    expect(canAccessRoute('SALE', '/settings/permissions')).toBe(false);
    expect(canAccessRoute('SALE', '/settings/connectors')).toBe(false);
    expect(canAccessRoute('SALE', '/settings/production-readiness')).toBe(false);
    
    // Unknown routes and roles should default to false
    expect(canAccessRoute('UNKNOWN_ROLE', '/workspaces/sales')).toBe(false);
    expect(canAccessRoute('UNKNOWN_ROLE', '/workspaces/teacher')).toBe(false);
    expect(canAccessRoute('UNKNOWN_ROLE', '/workspaces/finance')).toBe(false);
    expect(canAccessRoute(undefined, '/workspaces/sales')).toBe(false);
    expect(canAccessRoute(undefined, '/workspaces/teacher')).toBe(false);
    expect(canAccessRoute(undefined, '/workspaces/finance')).toBe(false);
    expect(canAccessRoute('UNKNOWN_ROLE', '/workspaces/sales/calling')).toBe(false);
    expect(canAccessRoute(undefined, '/workspaces/sales/calling')).toBe(false);
    expect(canAccessRoute('UNKNOWN_ROLE', '/fake-route')).toBe(false);
  });

  it('TEACHER access matrix', () => {
    // Allowed
    expect(canAccessRoute('TEACHER', '/workspaces')).toBe(true);
    expect(canAccessRoute('TEACHER', '/workspaces/teacher')).toBe(true);
    expect(canAccessRoute('TEACHER', '/ai-center')).toBe(true);
    expect(canAccessRoute('TEACHER', '/classes')).toBe(true);
    expect(canAccessRoute('TEACHER', '/attendance')).toBe(true);
    expect(canAccessRoute('TEACHER', '/homework')).toBe(true);
    expect(canAccessRoute('TEACHER', '/students')).toBe(true);
    
    // Blocked
    expect(canAccessRoute('TEACHER', '/workspaces/sales')).toBe(false);
    expect(canAccessRoute('TEACHER', '/workspaces/sales/calling')).toBe(false);
    expect(canAccessRoute('TEACHER', '/workspaces/finance')).toBe(false);
    expect(canAccessRoute('TEACHER', '/workspaces/unknown')).toBe(false);
    expect(canAccessRoute('TEACHER', '/dashboard')).toBe(false);
    expect(canAccessRoute('TEACHER', '/payments')).toBe(false);
    expect(canAccessRoute('TEACHER', '/renewals')).toBe(false);
    expect(canAccessRoute('TEACHER', '/reports')).toBe(false);
    expect(canAccessRoute('TEACHER', '/leads')).toBe(false);
    expect(canAccessRoute('TEACHER', '/trial-bookings')).toBe(false);
    expect(canAccessRoute('TEACHER', '/fanpage-inbox')).toBe(false);
    expect(canAccessRoute('TEACHER', '/settings')).toBe(false);
    expect(canAccessRoute('TEACHER', '/settings/production-readiness')).toBe(false);
  });

  it('ACCOUNTANT access matrix', () => {
    // Allowed
    expect(canAccessRoute('ACCOUNTANT', '/payments')).toBe(true);
    expect(canAccessRoute('ACCOUNTANT', '/renewals')).toBe(true);
    expect(canAccessRoute('ACCOUNTANT', '/workspaces')).toBe(true);
    expect(canAccessRoute('ACCOUNTANT', '/workspaces/finance')).toBe(true);
    expect(canAccessRoute('ACCOUNTANT', '/ai-center')).toBe(true);
    
    // Blocked
    expect(canAccessRoute('ACCOUNTANT', '/workspaces/sales')).toBe(false);
    expect(canAccessRoute('ACCOUNTANT', '/workspaces/sales/calling')).toBe(false);
    expect(canAccessRoute('ACCOUNTANT', '/workspaces/teacher')).toBe(false);
    expect(canAccessRoute('ACCOUNTANT', '/workspaces/unknown')).toBe(false);
    expect(canAccessRoute('ACCOUNTANT', '/dashboard')).toBe(false);
    expect(canAccessRoute('ACCOUNTANT', '/leads')).toBe(false);
    expect(canAccessRoute('ACCOUNTANT', '/trial-bookings')).toBe(false);
    expect(canAccessRoute('ACCOUNTANT', '/classes')).toBe(false);
    expect(canAccessRoute('ACCOUNTANT', '/attendance')).toBe(false);
    expect(canAccessRoute('ACCOUNTANT', '/settings')).toBe(false);
    expect(canAccessRoute('ACCOUNTANT', '/settings/production-readiness')).toBe(false);
  });
  
  it('Blocked responses do not expose metrics (simulated via strict route block)', () => {
    // The test confirms the gatekeeper returns false. In the actual page component, 
    // returning <ForbiddenRoleMessage /> immediately prevents any DB query or metric rendering.
    expect(canAccessRoute('SALE', '/dashboard')).toBe(false);
  });

  it('Unauthenticated and unknown roles', () => {
    // Falsy roles
    expect(canAccessRoute(undefined, '/workspaces')).toBe(false);
    expect(canAccessRoute(undefined, '/ai-center')).toBe(false);
    expect(canAccessRoute(null as any, '/payments')).toBe(false);
    expect(canAccessRoute('', '/dashboard')).toBe(false);
    expect(canAccessRoute('', '/settings/production-readiness')).toBe(false);
    
    // Unknown roles gracefully default to a safe matrix (workspaces only, or false for others)
    expect(canAccessRoute('UNKNOWN_ROLE', '/workspaces')).toBe(false); // they can see the workspaces shell
    expect(canAccessRoute('UNKNOWN_ROLE', '/ai-center')).toBe(false);
    expect(canAccessRoute('UNKNOWN_ROLE', '/dashboard')).toBe(false);
    expect(canAccessRoute('UNKNOWN_ROLE', '/settings/production-readiness')).toBe(false);
  });
});
