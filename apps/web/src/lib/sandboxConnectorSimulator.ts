export type SimulatorScenarioId = 
  | 'new_lead_fanpage' 
  | 'new_zalo_message' 
  | 'tuition_question' 
  | 'homework_missed' 
  | 'teacher_report' 
  | 'finance_reminder' 
  | 'complaint_message' 
  | 'csv_import' 
  | 'bank_mock';

export interface SandboxScenarioResult {
  source: string;
  mockRawInput: string;
  normalizedEvent: string;
  workflowClassification: string;
  automationMode: string;
  approvalRequirement: string;
  sandboxOutput: string;
  pipelineSteps: {
    name: string;
    status: 'pass' | 'blocked' | 'requires_approval' | 'sandbox_only';
    explanation: string;
  }[];
  auditMock: {
    eventId: string;
    tenant: string;
    source: string;
    eventType: string;
    automationMode: string;
    approvalStatus: string;
    createdBy: string;
    timestamp: string;
    payloadHash: string;
    sandboxOnly: boolean;
  };
}

export function runSandboxSimulation(scenarioId: SimulatorScenarioId): SandboxScenarioResult {
  const baseSteps = [
    { name: "1. Source Adapter", status: "pass" as const, explanation: "Nhận webhook/dữ liệu giả lập thành công" },
    { name: "2. Consent Check", status: "pass" as const, explanation: "Trung tâm đã bật tính năng này trong cài đặt" },
    { name: "3. Normalize", status: "pass" as const, explanation: "Định dạng lại dữ liệu chuẩn EduOS" },
    { name: "4. PII Masking", status: "pass" as const, explanation: "Ẩn số điện thoại ([SĐT đã ẩn])" },
    { name: "5. Context Builder", status: "pass" as const, explanation: "Ghép lịch sử hội thoại an toàn" },
  ];

  const now = new Date().toISOString();

  switch (scenarioId) {
    case 'new_lead_fanpage':
      return {
        source: "Facebook Fanpage",
        mockRawInput: '{ "sender": "user123", "message": "Cho mình xin thông tin khóa học" }',
        normalizedEvent: "Inbound Message - Khóa học query",
        workflowClassification: "Lead Follow-up",
        automationMode: "AUTO_LOW_RISK",
        approvalRequirement: "None (Sandbox)",
        sandboxOutput: "Follow-up task created in CRM. Mock outbox item generated for auto-reply.",
        pipelineSteps: [
          ...baseSteps,
          { name: "6. Policy Decision", status: "pass", explanation: "Phân loại AUTO_LOW_RISK (Hỏi thông tin cơ bản)" },
          { name: "7. Approval Gate", status: "pass", explanation: "Không cần duyệt cho câu hỏi cơ bản" },
          { name: "8. Sandbox Outbox", status: "sandbox_only", explanation: "Lưu vào Mock Outbox, KHÔNG gửi thật ra FB" },
          { name: "9. Audit Log", status: "sandbox_only", explanation: "Lưu lịch sử tác động vào DB" }
        ],
        auditMock: { eventId: "evt_101", tenant: "omlis", source: "fb_page", eventType: "msg_in", automationMode: "AUTO_LOW_RISK", approvalStatus: "approved", createdBy: "system", timestamp: now, payloadHash: "hash_xyz", sandboxOnly: true }
      };

    case 'tuition_question':
      return {
        source: "Zalo OA",
        mockRawInput: '{ "sender": "parent456", "message": "Bé nhà mình còn nợ bao nhiêu tiền học phí vậy?" }',
        normalizedEvent: "Inbound Message - Finance query",
        workflowClassification: "Finance / Debt",
        automationMode: "ADMIN_APPROVAL_REQUIRED",
        approvalRequirement: "Admin/Finance Staff",
        sandboxOutput: "Task added to CRM. AI draft response sent to Approval Queue.",
        pipelineSteps: [
          ...baseSteps,
          { name: "6. Policy Decision", status: "requires_approval", explanation: "Phân loại ADMIN_APPROVAL_REQUIRED (Hỏi về tiền bạc)" },
          { name: "7. Approval Gate", status: "blocked", explanation: "Chặn gửi đi, chờ Admin duyệt" },
          { name: "8. Sandbox Outbox", status: "sandbox_only", explanation: "Bản nháp được lưu, KHÔNG gửi thật ra Zalo" },
          { name: "9. Audit Log", status: "sandbox_only", explanation: "Lưu lịch sử chặn vào DB" }
        ],
        auditMock: { eventId: "evt_102", tenant: "omlis", source: "zalo_oa", eventType: "msg_in", automationMode: "ADMIN_APPROVAL_REQUIRED", approvalStatus: "pending", createdBy: "system", timestamp: now, payloadHash: "hash_abc", sandboxOnly: true }
      };

    case 'teacher_report':
      return {
        source: "Teacher Workspace",
        mockRawInput: '{ "student": "Bé A", "action": "generate_report" }',
        normalizedEvent: "Teacher AI Report Generation",
        workflowClassification: "Parent Report",
        automationMode: "TEACHER_APPROVAL_REQUIRED",
        approvalRequirement: "Teacher",
        sandboxOutput: "Draft report generated with DRAFT_ONLY label.",
        pipelineSteps: [
          ...baseSteps,
          { name: "6. Policy Decision", status: "requires_approval", explanation: "Phân loại TEACHER_APPROVAL_REQUIRED (Đánh giá học sinh)" },
          { name: "7. Approval Gate", status: "blocked", explanation: "Giáo viên phải ấn nút Lưu/Duyệt" },
          { name: "8. Sandbox Outbox", status: "sandbox_only", explanation: "Chỉ là bản xem trước trên UI" },
          { name: "9. Audit Log", status: "sandbox_only", explanation: "Lưu lịch sử tạo nháp" }
        ],
        auditMock: { eventId: "evt_103", tenant: "omlis", source: "teacher_app", eventType: "ai_draft", automationMode: "TEACHER_APPROVAL_REQUIRED", approvalStatus: "pending", createdBy: "teacher1", timestamp: now, payloadHash: "hash_def", sandboxOnly: true }
      };
      
    case 'finance_reminder':
      return {
        source: "Finance Workspace",
        mockRawInput: '{ "student": "Bé B", "action": "send_reminder" }',
        normalizedEvent: "Finance Tuition Reminder Draft",
        workflowClassification: "Tuition Collection",
        automationMode: "DRAFT_ONLY",
        approvalRequirement: "Finance Admin",
        sandboxOutput: "Draft reminder created. Send button disabled in demo.",
        pipelineSteps: [
          ...baseSteps,
          { name: "6. Policy Decision", status: "blocked", explanation: "Phân loại DRAFT_ONLY (Nhắc nợ)" },
          { name: "7. Approval Gate", status: "blocked", explanation: "Không cho phép gửi trong bản demo" },
          { name: "8. Sandbox Outbox", status: "sandbox_only", explanation: "Chỉ lưu nháp" },
          { name: "9. Audit Log", status: "sandbox_only", explanation: "Lưu lịch sử tạo nháp" }
        ],
        auditMock: { eventId: "evt_104", tenant: "omlis", source: "finance_app", eventType: "draft_gen", automationMode: "DRAFT_ONLY", approvalStatus: "draft", createdBy: "admin1", timestamp: now, payloadHash: "hash_fin", sandboxOnly: true }
      };

    case 'bank_mock':
      return {
        source: "Bank/Open Banking",
        mockRawInput: '{ "amount": 10000000, "content": "PHU HUYNH BE B CHUYEN TIEN" }',
        normalizedEvent: "Payment Intent Mock",
        workflowClassification: "Bank Reconciliation",
        automationMode: "OFF",
        approvalRequirement: "N/A (Disabled)",
        sandboxOutput: "Event dropped. Bank sync is disabled.",
        pipelineSteps: [
          { name: "1. Source Adapter", status: "blocked", explanation: "Kết nối ngân hàng chưa được bật" },
          { name: "2. Consent Check", status: "blocked", explanation: "Không có consent" },
          { name: "3-9", status: "blocked", explanation: "Bỏ qua" }
        ],
        auditMock: { eventId: "evt_105", tenant: "omlis", source: "bank_api", eventType: "webhook", automationMode: "OFF", approvalStatus: "rejected", createdBy: "system", timestamp: now, payloadHash: "hash_bnk", sandboxOnly: true }
      };

    default:
      return {
        source: "Unknown",
        mockRawInput: "...",
        normalizedEvent: "Generic Demo Event",
        workflowClassification: "Demo",
        automationMode: "OFF",
        approvalRequirement: "N/A",
        sandboxOutput: "Processed in sandbox.",
        pipelineSteps: baseSteps,
        auditMock: { eventId: "evt_000", tenant: "omlis", source: "demo", eventType: "demo", automationMode: "OFF", approvalStatus: "pending", createdBy: "demo", timestamp: now, payloadHash: "xxx", sandboxOnly: true }
      };
  }
}
