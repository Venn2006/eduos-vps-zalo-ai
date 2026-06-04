export const connectorMatrix = [
  {
    id: "zalo_oa_read",
    name: "Zalo OA read-only import",
    status: "Sandbox-only",
    allowedNow: "mock only",
    futureMode: "official API/webhook",
    risk: "Medium",
    approvalReq: "Tenant consent",
    blockedReason: "Pilot phase not yet active"
  },
  {
    id: "zalo_oa_send",
    name: "Zalo OA reply/send",
    status: "Disabled",
    allowedNow: "docs only",
    futureMode: "tenant opt-in",
    risk: "High",
    approvalReq: "Admin approval",
    blockedReason: "Real send prohibited in demo"
  },
  {
    id: "fb_fanpage_read",
    name: "Facebook Fanpage read-only import",
    status: "Sandbox-only",
    allowedNow: "mock only",
    futureMode: "official API/webhook",
    risk: "Medium",
    approvalReq: "Tenant consent",
    blockedReason: "Pilot phase not yet active"
  },
  {
    id: "fb_fanpage_send",
    name: "Facebook Fanpage reply/send",
    status: "Disabled",
    allowedNow: "docs only",
    futureMode: "tenant opt-in",
    risk: "High",
    approvalReq: "Admin approval",
    blockedReason: "Real send prohibited in demo"
  },
  {
    id: "zalo_group",
    name: "Zalo group/class chat",
    status: "Readiness plan only",
    allowedNow: "docs only",
    futureMode: "N/A",
    risk: "Prohibited until explicit pilot",
    approvalReq: "Legal/privacy review",
    blockedReason: "No scraping allowed"
  },
  {
    id: "zalo_personal",
    name: "Zalo personal account",
    status: "Readiness plan only",
    allowedNow: "docs only",
    futureMode: "N/A",
    risk: "Prohibited until explicit pilot",
    approvalReq: "Legal/privacy review",
    blockedReason: "No scraping allowed"
  },
  {
    id: "landing_form",
    name: "Landing page/form import",
    status: "Sandbox-only",
    allowedNow: "mock only",
    futureMode: "official API/webhook",
    risk: "Low",
    approvalReq: "Tenant consent",
    blockedReason: "Pilot phase not yet active"
  },
  {
    id: "csv_import",
    name: "CSV/XLSX manual import",
    status: "Preview-only",
    allowedNow: "manual preview only",
    futureMode: "customer-provided import",
    risk: "Low",
    approvalReq: "Admin approval",
    blockedReason: "Persistence blocked in demo"
  },
  {
    id: "vietqr",
    name: "VietQR payment intent",
    status: "Sandbox-only",
    allowedNow: "mock only",
    futureMode: "official API/webhook",
    risk: "High",
    approvalReq: "Admin approval",
    blockedReason: "Banking approval pending"
  },
  {
    id: "bank_sync",
    name: "Bank/Open Banking reconciliation",
    status: "Disabled",
    allowedNow: "docs only",
    futureMode: "read-only pilot",
    risk: "High",
    approvalReq: "Admin approval",
    blockedReason: "Banking approval pending"
  },
  {
    id: "email",
    name: "Email import/send",
    status: "Disabled",
    allowedNow: "docs only",
    futureMode: "tenant opt-in",
    risk: "Medium",
    approvalReq: "Admin approval",
    blockedReason: "Real send prohibited in demo"
  },
  {
    id: "lms",
    name: "LMS/homework import",
    status: "Preview-only",
    allowedNow: "manual preview only",
    futureMode: "customer-provided import",
    risk: "Low",
    approvalReq: "Teacher approval",
    blockedReason: "Pilot phase not yet active"
  },
  {
    id: "calendar",
    name: "Calendar/schedule import",
    status: "Preview-only",
    allowedNow: "manual preview only",
    futureMode: "customer-provided import",
    risk: "Low",
    approvalReq: "Admin approval",
    blockedReason: "Pilot phase not yet active"
  }
];

export const checklistItems = [
  { id: 1, text: "Tenant opt-in collected", status: "Needed" },
  { id: 2, text: "Consent scope documented", status: "Needed" },
  { id: 3, text: "Data retention policy approved", status: "Needed" },
  { id: 4, text: "Approval queue ready", status: "Done" },
  { id: 5, text: "Mock outbox tested", status: "Done" },
  { id: 6, text: "Audit log design approved", status: "Done" },
  { id: 7, text: "Dry-run completed", status: "Needed" },
  { id: 8, text: "Rollback plan ready", status: "Needed" },
  { id: 9, text: "Monitoring/alerts ready", status: "Future phase" },
  { id: 10, text: "Staff training complete", status: "Needed" },
  { id: 11, text: "Real send feature flag OFF", status: "Done" },
  { id: 12, text: "Production worker disabled", status: "Done" }
];

export const importTemplates = {
  lead: `leadName,parentName,maskedPhone,source,interestedCourse,assignedStaff,status,consentStatus
Bé Nguyễn Văn A,Anh B,[SĐT đã ẩn],Facebook Fanpage,Tiếng Anh Trẻ Em,Nguyễn Thị NV,Mới,Có
Bé Trần Thị B,Chị C,[SĐT đã ẩn],Zalo OA,IELTS Teen,Trần Văn Sale,Đang tư vấn,Có`,
  student: `studentName,parentName,maskedPhone,className,lifecycleStatus,assignedTeacher,parentConsentStatus
Phạm Văn D,Anh E,[SĐT đã ẩn],KIDS-01,Đang học,Teacher Hằng,Có
Lê Thị F,Chị G,[SĐT đã ẩn],IELTS-02,Đang học,Teacher Minh,Có`,
  finance: `studentName,packageName,totalSessions,usedSessions,remainingSessions,tuitionAmount,paidAmount,debtAmount,dueDate,paymentStatus,approvalRequired
Phạm Văn D,1 Năm,100,50,50,20000000,10000000,10000000,2024-05-01,Nợ,Có
Lê Thị F,6 Tháng,50,45,5,10000000,10000000,0,,Hoàn thành,Không`,
  homework: `studentName,className,sessionDate,attendanceStatus,homeworkStatus,teacherApprovalRequired
Phạm Văn D,KIDS-01,2024-04-10,Có mặt,Đã nộp,Có
Lê Thị F,IELTS-02,2024-04-10,Vắng mặt,Chưa nộp,Có`
};
