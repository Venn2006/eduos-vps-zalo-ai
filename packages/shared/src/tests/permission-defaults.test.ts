import { hasDefaultPermission, Role } from '../lib/permissionDefaults';

describe('Permission Defaults', () => {
  test('OWNER has admin modules', () => {
    expect(hasDefaultPermission('OWNER', 'SETTINGS')).toBe(true);
    expect(hasDefaultPermission('OWNER', 'PERMISSIONS')).toBe(true);
    expect(hasDefaultPermission('OWNER', 'AUDIT_LOG')).toBe(true);
    expect(hasDefaultPermission('OWNER', 'FINANCE_WORKSPACE')).toBe(true);
    expect(hasDefaultPermission('OWNER', 'TEACHER_WORKSPACE')).toBe(true);
    expect(hasDefaultPermission('OWNER', 'SALES_WORKSPACE')).toBe(true);
  });

  test('ADMIN has admin modules', () => {
    expect(hasDefaultPermission('ADMIN', 'SETTINGS')).toBe(true);
    expect(hasDefaultPermission('ADMIN', 'PERMISSIONS')).toBe(true);
    expect(hasDefaultPermission('ADMIN', 'AUDIT_LOG')).toBe(true);
  });

  test('SALE does not have finance or teacher-only modules', () => {
    expect(hasDefaultPermission('SALE', 'SALES_WORKSPACE')).toBe(true);
    expect(hasDefaultPermission('SALE', 'LEADS')).toBe(true);
    
    expect(hasDefaultPermission('SALE', 'FINANCE_WORKSPACE')).toBe(false);
    expect(hasDefaultPermission('SALE', 'TEACHER_WORKSPACE')).toBe(false);
    expect(hasDefaultPermission('SALE', 'SETTINGS')).toBe(false);
  });

  test('TEACHER does not have sales or finance modules', () => {
    expect(hasDefaultPermission('TEACHER', 'TEACHER_WORKSPACE')).toBe(true);
    expect(hasDefaultPermission('TEACHER', 'CLASSES')).toBe(true);

    expect(hasDefaultPermission('TEACHER', 'SALES_WORKSPACE')).toBe(false);
    expect(hasDefaultPermission('TEACHER', 'FINANCE_WORKSPACE')).toBe(false);
  });

  test('ACCOUNTANT does not have sales or teacher modules', () => {
    expect(hasDefaultPermission('ACCOUNTANT', 'FINANCE_WORKSPACE')).toBe(true);
    expect(hasDefaultPermission('ACCOUNTANT', 'PAYMENTS')).toBe(true);

    expect(hasDefaultPermission('ACCOUNTANT', 'SALES_WORKSPACE')).toBe(false);
    expect(hasDefaultPermission('ACCOUNTANT', 'TEACHER_WORKSPACE')).toBe(false);
  });

  test('UNKNOWN has none', () => {
    expect(hasDefaultPermission('UNKNOWN', 'DASHBOARD')).toBe(false);
    expect(hasDefaultPermission('UNKNOWN', 'SETTINGS')).toBe(false);
  });
});
