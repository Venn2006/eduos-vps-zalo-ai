export const pilotConsentChecklist = [
  { id: 'optin', text: 'Tenant Opt-in (Xác nhận tham gia)', status: 'Pending' },
  { id: 'scope', text: 'Consent Scope (Phạm vi dữ liệu)', status: 'Pending' },
  { id: 'retention', text: 'Data Retention (Chính sách lưu trữ)', status: 'Done' },
  { id: 'norealsend', text: 'No Real Send (Không gửi thật)', status: 'Done' },
  { id: 'readonly', text: 'Read-only First (Chỉ đọc lúc đầu)', status: 'Done' },
  { id: 'rollback', text: 'Rollback Plan (Kế hoạch hoàn tác)', status: 'Pending' },
  { id: 'training', text: 'Staff Training (Đào tạo nhân sự)', status: 'Pending' },
  { id: 'signoff', text: 'Owner Sign-off (Chủ trung tâm ký duyệt)', status: 'Pending' }
];

export const featureFlags = [
  { id: 'REAL_SEND_ENABLED', label: 'Real Zalo/FB Send', value: false, type: 'boolean' },
  { id: 'CONNECTORS_ENABLED', label: 'Live Connectors', value: false, type: 'boolean' },
  { id: 'LIVE_LLM_ENABLED', label: 'Live LLM Access', value: false, type: 'boolean' },
  { id: 'BANK_RECONCILIATION_ENABLED', label: 'Bank Sync/VietQR', value: false, type: 'boolean' },
  { id: 'SANDBOX_OUTBOX_ONLY', label: 'Sandbox Outbox Only', value: true, type: 'boolean' },
  { id: 'REQUIRE_ADMIN_APPROVAL_FOR_MONEY', label: 'Admin Approval (Money)', value: true, type: 'boolean' },
  { id: 'REQUIRE_TEACHER_APPROVAL_FOR_GRADES', label: 'Teacher Approval (Grades)', value: true, type: 'boolean' }
];

export const importSimulatorWarnings = {
  lead: [
    { type: 'consent', msg: '12 leads thiếu consent marketing' },
    { type: 'phone', msg: '3 số điện thoại bị unmasked' }
  ],
  student: [
    { type: 'consent', msg: '2 phụ huynh chưa đồng ý nhận tin tự động' }
  ],
  finance: [
    { type: 'debt', msg: '1 giao dịch lệch số tiền công nợ' },
    { type: 'approval', msg: 'Require Admin Approval (Tiền bạc)' }
  ],
  homework: [
    { type: 'approval', msg: 'Require Teacher Approval (Điểm số)' }
  ]
};
