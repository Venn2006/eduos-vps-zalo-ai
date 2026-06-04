export const consentScopes = [
  { id: 'zalo_read', name: 'Zalo OA read-only import', status: 'Chưa bật đồng bộ thật', futureMode: 'Cần consent của trung tâm', risk: 'Medium', blockedReason: 'Chỉ mô phỏng' },
  { id: 'fb_read', name: 'Facebook Fanpage read-only import', status: 'Chưa bật đồng bộ thật', futureMode: 'Cần consent của trung tâm', risk: 'Medium', blockedReason: 'Chỉ mô phỏng' },
  { id: 'csv_import', name: 'CSV/XLSX import', status: 'Preview-only', futureMode: 'Cần admin duyệt', risk: 'Medium', blockedReason: 'Chỉ xem trước, không lưu' },
  { id: 'finance_import', name: 'Finance/payment import', status: 'Disabled', futureMode: 'Cần admin duyệt', risk: 'High', blockedReason: 'Vô hiệu hóa trong demo' },
  { id: 'homework_report', name: 'Homework/parent report', status: 'Draft-only', futureMode: 'Cần giáo viên duyệt', risk: 'Low', blockedReason: 'Không tự động gửi' },
  { id: 'live_llm', name: 'Live LLM processing', status: 'OFF', futureMode: 'Cần consent', risk: 'High', blockedReason: 'Không xử lý dữ liệu thật trong demo' },
  { id: 'zalo_scrape', name: 'Zalo personal / private chat scraping', status: 'Prohibited', futureMode: 'Cấm hoàn toàn', risk: 'High', blockedReason: 'Không scrape tài khoản cá nhân' },
  { id: 'banking', name: 'Banking/Open Banking', status: 'OFF', futureMode: 'Cần admin duyệt', risk: 'High', blockedReason: 'Không kết nối thật' },
];

export const privacyChecklist = [
  { id: 1, text: 'Mask phone numbers (Che số điện thoại)', status: 'Done' },
  { id: 2, text: 'No raw credentials (Không lưu mật khẩu raw)', status: 'Done' },
  { id: 3, text: 'No personal Zalo scraping (Không scrape Zalo cá nhân)', status: 'Done' },
  { id: 4, text: 'Tenant opt-in required (Bắt buộc đồng ý từ trung tâm)', status: 'Pending' },
  { id: 5, text: 'Data retention policy required (Cần chính sách lưu trữ)', status: 'Pending' },
  { id: 6, text: 'Deletion request process required (Quy trình yêu cầu xóa)', status: 'Pending' },
  { id: 7, text: 'Audit trail required (Bắt buộc lưu vết)', status: 'Pending' },
  { id: 8, text: 'Dry-run required before live (Phải chạy thử trước khi live)', status: 'Done' }
];
