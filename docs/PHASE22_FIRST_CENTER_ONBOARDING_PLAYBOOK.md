# Phase 22: First Center Onboarding Playbook

## 1. Onboarding Timeline
Triển khai hệ thống cho trung tâm thực tế đầu tiên theo lộ trình 7 ngày an toàn:
* **Day 0:** Khởi tạo Tenant mới trên production database.
* **Day 1:** Import danh sách nhân viên, học viên, và Leads.
* **Day 2:** Thiết lập Zalo VPS Connector và Fanpage Webhook.
* **Day 3:** Đào tạo nhân sự theo từng Role cụ thể (Workspaces).
* **Day 4–7:** Vận hành song song (Shadow Operations) - đối chiếu số liệu với hệ thống cũ.
* **Week 2:** Đánh giá KPI ngày/tuần, tối ưu hóa các kịch bản AI chưa sát thực tế.

## 2. Staff Role Setup
Việc phân quyền nghiêm ngặt là bắt buộc trước khi cấp tài khoản:
* **OWNER:** Chủ trung tâm, toàn quyền truy cập tài chính, cấu hình, và duyệt toàn bộ tin nhắn AI.
* **ADMIN:** Quản lý cơ sở (Branch Manager), tương đương OWNER nhưng có thể bị hạn chế xem dữ liệu của chi nhánh khác trong tương lai.
* **SALE:** Tư vấn viên. Chỉ nhìn thấy Leads được phân công, không truy cập tài chính.
* **TEACHER:** Giáo viên. Chỉ nhìn thấy lớp mình dạy, quản lý điểm danh, bài tập.
* **ACCOUNTANT:** Kế toán. Chỉ làm việc với Hóa đơn, Thanh toán, không truy cập dữ liệu Sale.

## 3. Data Import Checklist
Đảm bảo định dạng chuẩn trước khi đưa dữ liệu vào EduOS:
* [ ] Danh sách Leads (SĐT, Nguồn, Trạng thái, Nhân viên phụ trách).
* [ ] Danh sách Học viên đang học.
* [ ] Danh sách Lớp học và Giáo viên phụ trách.
* [ ] Lịch sử lịch hẹn học thử (Trial Bookings) chưa xử lý.
* [ ] Dữ liệu Hóa đơn (Invoices) / Công nợ (Payments) nếu có.
* [ ] Số điện thoại phụ huynh (ưu tiên SĐT có dùng Zalo).
* [ ] Danh sách URL Zalo Groups của các lớp học.

## 4. Zalo Group Onboarding
Quy trình cấu hình Zalo để gửi thông báo tự động an toàn:
1. Thêm Zalo cá nhân (đã cài EduOS VPS Connector) vào nhóm lớp học.
2. Tại màn hình Zalo, gửi lệnh setup (nếu được hỗ trợ) để liên kết Zalo Group ID với Class ID.
3. Kiểm tra trên hệ thống EduOS để xác nhận nhóm đã được mapping.
4. Xác nhận tính năng "Nhắc nhở học phí" không bao giờ tự động gửi vào nhóm chat chung (chỉ gửi inbox riêng cho phụ huynh).
5. Chỉ cho phép báo cáo điểm danh hoặc bài tập chung vào nhóm lớp.

## 5. Sales Workflow Training
Hướng dẫn cho Sale:
* Truy cập `/workspaces/sales/calling` mỗi sáng để nhận danh sách cuộc gọi cần thiết.
* Bấm gọi, sau đó bắt buộc chọn "Outcome" (Nhấc máy, Không nghe, Sai số...).
* Hệ thống tự động tạo **Follow-up Task** (Lịch gọi lại) nếu cuộc gọi bị lỡ.
* Nếu phụ huynh đồng ý học thử, sử dụng Outcome "Booked Trial" để hệ thống tự động đẩy dữ liệu sang bộ phận học thuật.
* Tham khảo gợi ý (Suggestion Copy) do hệ thống tạo ra sau mỗi cuộc gọi. **Tuyệt đối không có tin nhắn tự động gửi đi mà không có sự kiểm duyệt.**

## 6. Teacher Workflow Training
Hướng dẫn cho Giáo viên:
* Chỉ sử dụng `/workspaces/teacher`.
* Điểm danh học viên nhanh bằng điện thoại/máy tính sau mỗi buổi học.
* Giao bài tập về nhà và nhận xét nhanh.
* Xem các bản nháp (AI Drafts) do AI viết dựa trên điểm danh/bài tập, duyệt hoặc sửa trước khi gửi cho phụ huynh.

## 7. Finance Workflow Training
Hướng dẫn cho Kế toán:
* Truy cập `/workspaces/finance` để theo dõi Dòng tiền và Công nợ.
* Xem báo cáo Debt Aging (Nợ hiện tại, nợ 1-7 ngày, 8-14 ngày, 15+ ngày).
* Cập nhật trạng thái Invoices khi nhận được chuyển khoản.
* Duyệt các tin nhắn "Nhắc nợ" do AI tạo ra. **Tuyệt đối không để tự động gửi thông báo nợ.**

## 8. CEO Workflow Training
Hướng dẫn cho CEO/Owner:
* Giám sát hệ thống từ `/dashboard` (Tổng quan thu chi, Leads, Trial Bookings).
* Dùng "AI Command Center" để truy vấn nhanh số liệu (ví dụ: "Hôm nay doanh thu bao nhiêu?").
* Theo dõi "Connector Center" để đảm bảo máy chủ Zalo VPS không bị rớt kết nối.
* Sử dụng "Production Readiness" để audit hệ thống định kỳ.

## 9. Risks & Mitigation
* **Nhân viên quên log kết quả:** Sale không nhập call outcome khiến báo cáo sai. Hướng dẫn quản lý kiểm tra KPI hằng ngày.
* **Rớt kết nối Zalo:** Phiên đăng nhập Zalo hết hạn hoặc VPS bị khởi động lại. Hướng dẫn CEO check Connector Center mỗi sáng.
* **Gán sai Role:** Nhầm lẫn cấp quyền Kế toán cho Sale. Hướng dẫn phân quyền cẩn thận ở bước tạo User.
* **Data Rác:** SĐT phụ huynh sai hoặc bị trùng lặp. Đề nghị trung tâm làm sạch file Excel trước khi import.

## 10. Success Criteria
Trong tuần vận hành đầu tiên, trung tâm đạt:
* [x] Đội Sale xử lý và log thành công tối thiểu 100 cuộc gọi/ngày trên hệ thống.
* [x] Không bỏ lỡ bất kỳ Follow-up task nào.
* [x] Quy trình chuyển giao từ Sale (Booked) sang Teacher (Trial Booking) trơn tru, không nhập tay hai lần.
* [x] CEO nhìn thấy số liệu KPI thời gian thực.
* [x] Không xảy ra tình trạng lộ dữ liệu chéo (Cross-role data leakage).
