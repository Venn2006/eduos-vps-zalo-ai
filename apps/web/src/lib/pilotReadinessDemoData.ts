export const readinessScorecard = [
  { id: 'rd-01', item: 'Product approval (Phê duyệt sản phẩm)', status: 'Ready' },
  { id: 'rd-02', item: 'Tenant consent (Đồng ý từ trung tâm)', status: 'Needs work' },
  { id: 'rd-03', item: 'Legal/privacy review (Pháp lý & Quyền riêng tư)', status: 'Blocked' },
  { id: 'rd-04', item: 'Data retention policy (Chính sách lưu trữ)', status: 'Needs work' },
  { id: 'rd-05', item: 'Admin approval workflow tested (Kiểm thử duyệt bởi admin)', status: 'Ready' },
  { id: 'rd-06', item: 'Teacher approval workflow tested (Kiểm thử duyệt bởi giáo viên)', status: 'Ready' },
  { id: 'rd-07', item: 'Mock outbox tested (Kiểm thử Outbox ảo)', status: 'Ready' },
  { id: 'rd-08', item: 'Import preview tested (Kiểm thử xem trước Import)', status: 'Ready' },
  { id: 'rd-09', item: 'Sandbox connector simulator tested (Kiểm thử mô phỏng)', status: 'Ready' },
  { id: 'rd-10', item: 'Monitoring/rollback plan ready (Kế hoạch giám sát/rollback)', status: 'Future phase' },
  { id: 'rd-11', item: 'Staff training completed (Đào tạo nhân sự)', status: 'Future phase' },
  { id: 'rd-12', item: 'Customer sign-off (Khách hàng nghiệm thu)', status: 'Future phase' },
];

export const blockedCapabilities = [
  'Real Zalo/Facebook send (Gửi tin thật qua Zalo/Facebook)',
  'Bank/Open Banking reconciliation (Giao dịch ngân hàng thật)',
  'Zalo personal scraping (Scrape Zalo cá nhân)',
  'Private group scraping (Scrape nhóm kín)',
  'Production worker (Worker chạy thật)',
  'Live LLM on real student data (LLM gọi API ngoài với dữ liệu thật)',
  'Payroll/payment automation (Tự động hóa lương/thanh toán)',
  'AI final grading (AI tự động chấm điểm cuối cùng)'
];

export const pilotScope = [
  'One tenant only (Chỉ áp dụng cho 1 trung tâm)',
  'One data source only (Chỉ 1 nguồn dữ liệu)',
  'Read-only first (Chỉ đọc trước)',
  'No real send (Không gửi tin thật)',
  'Limited date range (Giới hạn thời gian dữ liệu)',
  'PII masked in logs (Ẩn thông tin cá nhân trong log)',
  'Daily audit review (Review log hàng ngày)',
  'Manual rollback plan (Kế hoạch rollback thủ công)'
];
