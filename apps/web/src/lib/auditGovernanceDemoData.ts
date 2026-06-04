export const mockAuditLogs = [
  { id: 'evt-01', time: '2026-06-05 08:30:11', source: 'Facebook', workflow: 'Fanpage lead normalized', automationMode: 'AUTO_WITH_DASHBOARD_REPORT', approvalStatus: 'N/A', actor: 'System', sandboxOnly: true, payloadHash: 'a8f4c2...', result: 'Normalized to Lead draft' },
  { id: 'evt-02', time: '2026-06-05 09:15:22', source: 'Finance', workflow: 'Tuition reminder draft created', automationMode: 'ADMIN_APPROVAL_REQUIRED', approvalStatus: 'Pending', actor: 'Billing Cron', sandboxOnly: true, payloadHash: 'b7x9z1...', result: 'Draft queued in Approval Queue' },
  { id: 'evt-03', time: '2026-06-05 10:05:44', source: 'Teacher', workflow: 'Homework feedback draft generated', automationMode: 'TEACHER_APPROVAL_REQUIRED', approvalStatus: 'Pending', actor: 'AI Assistant', sandboxOnly: true, payloadHash: 'c4n3m8...', result: 'Draft ready for teacher review' },
  { id: 'evt-04', time: '2026-06-05 11:20:05', source: 'Admin', workflow: 'Parent report draft created', automationMode: 'TEACHER_APPROVAL_REQUIRED', approvalStatus: 'Approved', actor: 'Teacher Mai', sandboxOnly: true, payloadHash: 'd9k2p4...', result: 'Sent to Mock Outbox' },
  { id: 'evt-05', time: '2026-06-05 13:45:10', source: 'Import', workflow: 'Import preview warning detected', automationMode: 'STAFF_HANDOFF', approvalStatus: 'N/A', actor: 'Admin User', sandboxOnly: true, payloadHash: 'e1q7r2...', result: 'Import halted - Local preview only' },
  { id: 'evt-06', time: '2026-06-05 14:10:33', source: 'Zalo', workflow: 'Connector scenario blocked', automationMode: 'OFF', approvalStatus: 'Blocked', actor: 'System', sandboxOnly: true, payloadHash: 'f5t8v9...', result: 'Real send blocked by safety policy' },
  { id: 'evt-07', time: '2026-06-05 15:55:01', source: 'System', workflow: 'Mock outbox item queued', automationMode: 'DRAFT_ONLY', approvalStatus: 'N/A', actor: 'System', sandboxOnly: true, payloadHash: 'g2w5y7...', result: 'Queued in sandbox outbox' }
];

export const governanceCounters = {
  realSendBlocked: 142,
  draftOnlyItems: 85,
  adminApprovalRequired: 24,
  teacherApprovalRequired: 56,
  connectorDisabled: 3,
  importPreviewWarnings: 12,
  mockOutboxItems: 215
};
