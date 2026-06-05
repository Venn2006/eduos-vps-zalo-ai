export interface RolePermissionDemo {
  roleName: string;
  shortDescription: string;
  canView: string[];
  canAct: string[];
  cannotDo: string[];
  approvalResponsibilities: string[];
  demoUserName: string;
  demoEmail: string;
  safetyNotes: string;
}

export const rolePermissionDemoData: RolePermissionDemo[] = [
  {
    roleName: 'CEO/Admin',
    shortDescription: 'Quyền cao nhất, giám sát toàn bộ hoạt động, tài chính và cấu hình hệ thống.',
    canView: [
      'CEO Dashboard',
      'Tin nhắn & Zalo',
      'Giao việc',
      'CRM',
      'Học vụ',
      'Bài tập',
      'Tài chính',
      'Safety Center',
      'AI Draft Review'
    ],
    canAct: [
      'viewAll',
      'assignTask',
      'reassignConversation',
      'approveDraft',
      'viewFinance',
      'viewStudentAcademic',
      'manageSafetySettings',
    ],
    cannotDo: [
      'Gửi tin nhắn thật (Demo Only)',
      'Sử dụng Connector Live (Demo Only)'
    ],
    approvalResponsibilities: [
      'Khiếu nại nghiêm trọng',
      'Chi phí lớn',
      'Thay đổi cấu hình an toàn'
    ],
    demoUserName: 'CEO Founder',
    demoEmail: 'ceo@eduos.demo',
    safetyNotes: 'Toàn quyền nhưng không tự gửi tin thật. Giao diện Safety Center chỉ dành cho quyền này.'
  },
  {
    roleName: 'Quản lý (Manager)',
    shortDescription: 'Quản lý đội ngũ, phân bổ công việc và xử lý các ca tư vấn khó.',
    canView: [
      'Tin nhắn & Zalo',
      'Giao việc',
      'CRM',
      'Học vụ'
    ],
    canAct: [
      'assignTask',
      'reassignConversation',
      'approveDraft'
    ],
    cannotDo: [
      'viewFinance (trừ khi cấp quyền)',
      'manageSafetySettings',
      'Gửi tin nhắn thật (Demo Only)',
      'Sử dụng Connector Live (Demo Only)'
    ],
    approvalResponsibilities: [
      'Xử lý khách hàng nóng (Hot Leads)',
      'Duyệt tin nhắn CSKH từ Sale'
    ],
    demoUserName: 'Nguyen Quan Ly',
    demoEmail: 'manager@eduos.demo',
    safetyNotes: 'Chỉ được xem các luồng công việc được phân quyền quản lý.'
  },
  {
    roleName: 'Sale (Tư vấn viên)',
    shortDescription: 'Theo dõi leads, tư vấn khách hàng và follow up trên CRM.',
    canView: [
      'Tin nhắn & Zalo (Chỉ khách của mình)',
      'Giao việc (Công việc của mình)',
      'CRM'
    ],
    canAct: [
      'Tạo nháp tin nhắn',
      'Cập nhật trạng thái CRM'
    ],
    cannotDo: [
      'viewAll',
      'assignTask',
      'approveDraft (Tự duyệt tin nhắn chính mình)',
      'viewFinance',
      'manageSafetySettings',
      'Gửi tin nhắn thật (Demo Only)',
      'Sử dụng Connector Live (Demo Only)'
    ],
    approvalResponsibilities: [],
    demoUserName: 'Tran Sale',
    demoEmail: 'sale@eduos.demo',
    safetyNotes: 'Chỉ chat nội bộ và soạn nháp tin nhắn Zalo. Phải được quản lý duyệt.'
  },
  {
    roleName: 'Giáo viên',
    shortDescription: 'Điểm danh, cập nhật lộ trình học và báo cáo phụ huynh.',
    canView: [
      'Học vụ',
      'Bài tập',
      'Giao việc (Lớp của mình)'
    ],
    canAct: [
      'viewStudentAcademic',
      'Tạo nháp báo cáo học tập'
    ],
    cannotDo: [
      'viewAll',
      'CRM',
      'viewFinance',
      'manageSafetySettings',
      'Gửi tin nhắn thật (Demo Only)',
      'Sử dụng Connector Live (Demo Only)'
    ],
    approvalResponsibilities: [
      'Duyệt báo cáo học tập do AI viết nháp trước khi gửi lên Quản lý'
    ],
    demoUserName: 'Le Giao Vien',
    demoEmail: 'teacher@eduos.demo',
    safetyNotes: 'Chỉ truy cập thông tin học viên trong lớp mình phụ trách.'
  },
  {
    roleName: 'Kế toán (Finance)',
    shortDescription: 'Theo dõi học phí, nhắc nợ và xuất hóa đơn.',
    canView: [
      'Tài chính',
      'Giao việc (Việc liên quan học phí)',
      'Tin nhắn & Zalo (Nhóm liên quan học phí)'
    ],
    canAct: [
      'viewFinance',
      'Tạo nháp tin nhắc phí'
    ],
    cannotDo: [
      'viewAll',
      'Học vụ',
      'manageSafetySettings',
      'Gửi tin nhắn thật (Demo Only)',
      'Sử dụng Connector Live (Demo Only)'
    ],
    approvalResponsibilities: [
      'Duyệt các thông báo nhắc phí do AI nháp'
    ],
    demoUserName: 'Pham Ke Toan',
    demoEmail: 'finance@eduos.demo',
    safetyNotes: 'Tài chính tách biệt với Sale, chỉ xử lý thông báo công nợ.'
  }
];
