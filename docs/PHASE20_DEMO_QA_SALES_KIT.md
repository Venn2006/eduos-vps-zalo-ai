# Phase 20: Final Demo QA & Sales Kit

## 1. Demo Story
This story illustrates the core value proposition to a prospective language center owner:
* **CEO opens dashboard:** Instantly sees urgent issues (overdue tuition, pending AI approvals, total revenue).
* **Sales opens `/workspaces/sales/calling`:** The salesperson sees exactly who they need to call today.
* **Sale calls lead & logs outcome:** The salesperson logs "Quan tâm, hẹn gọi lại".
* **Follow-up task appears:** A follow-up task is automatically scheduled.
* **Booked trial creates TrialBooking:** A subsequent call results in a booked trial, auto-generating a `TrialBooking` record for the academic team.
* **CEO sees sales KPI:** The CEO views real-time conversion rates on the dashboard.
* **AI Center answers scoped questions:** The CEO asks the AI "Doanh thu hôm nay" and gets a precise answer. A Sale asks the same and gets "Bạn không có quyền truy cập".
* **Connector Center shows health:** The CEO verifies Zalo and Fanpage connections are stable.
* **Permission Center shows role access foundation:** The CEO is reassured that data is strictly segregated by role.

## 2. Demo Script in Vietnamese
### Talk Track: "AI độc quyền"
"EduOS không chỉ là phần mềm quản lý, mà là một trợ lý AI. Thay vì nhân viên phải tự soạn hàng trăm tin nhắc phí hay tư vấn, AI sẽ tự động phân tích tình huống và soạn sẵn bản nháp. Tuy nhiên, quyền quyết định luôn nằm trong tay anh/chị: AI chỉ gửi khi có sự phê duyệt."

### Talk Track: "Zalo cá nhân VPS"
"Khác với Zalo OA tốn kém, EduOS tích hợp giải pháp VPS giả lập thiết bị, cho phép anh/chị đồng bộ Zalo cá nhân của trung tâm trực tiếp vào phần mềm. Điều này giúp tối ưu chi phí và tăng tỷ lệ phản hồi của phụ huynh."

### Talk Track: "Không cần học phần mềm"
"Với các phần mềm cũ, nhân viên phải học cách dùng menu phức tạp. Với EduOS, mọi thứ được tổ chức theo luồng công việc (Workspaces). Nhân viên sale chỉ thấy việc của sale, giáo viên chỉ thấy việc của giáo viên. Mọi thao tác đều được AI 'chỉ việc' rõ ràng."

## 3. Seed Data Checklist
To run a convincing demo, ensure the database is seeded with:
* [x] At least 20 Leads in various stages (NEW, IN_PROGRESS).
* [x] 5 "Hot" Leads ready for closing.
* [x] 3 FollowUpTask records assigned to specific sales reps.
* [x] 2 TrialBooking records.
* [x] Sample Students, Classes, and Courses.
* [x] Sample Payments and Invoices to populate the Finance Dashboard.
* [x] Zalo and Facebook Connector mock statuses.
* [x] 1-2 AI Action Drafts pending CEO approval.

## 4. Manual QA Checklist
Verify access segregation before the demo:
* **OWNER:** Can access all spaces, approve AI drafts, view CEO Dashboard.
* **ADMIN:** Same as OWNER.
* **SALE:** Can access `/workspaces/sales`, cannot access `/workspaces/finance`.
* **TEACHER:** Can access `/workspaces/teacher`, cannot access sales or finance.
* **ACCOUNTANT:** Can access `/workspaces/finance`, cannot access sales.
* **Anonymous:** Redirected to `/login`.
* **No auto-send:** Verify `ZaloOutboxMessage` remains empty until explicitly approved.
* **No data leakage:** Verify `tenantId` is strictly enforced in all database queries.

## 5. Onboarding Checklist for First Real Center
1. [ ] Tạo Tenant mới trong cơ sở dữ liệu.
2. [ ] Tạo tài khoản User (CEO).
3. [ ] Phân quyền OWNER cho CEO.
4. [ ] Hướng dẫn CEO tạo tài khoản cho nhân viên (SALE, TEACHER, ACCOUNTANT).
5. [ ] Import danh sách Leads ban đầu (từ file Excel/CSV).
6. [ ] Thiết lập danh sách Lớp học và Khóa học.
7. [ ] Quét mã QR để kết nối Zalo cá nhân qua VPS Connector.
8. [ ] Cấu hình Webhook kết nối Fanpage Facebook.
9. [ ] Cấu hình quy tắc tài chính (Ngày đến hạn, ngưỡng học phí).
10. [ ] Đào tạo nhân viên sử dụng Workspaces tương ứng.

## 6. Known Limitations for Honest Sales
Be transparent with early adopters:
* EduOS currently queues messages but the physical Zalo outbox sending (via VPS appium) requires a separate hardened worker node (Phase 17 pending).
* AI Draft generation uses a simulated local model for now; live LLM integration requires OpenAI API keys.
* VietQR automated reconciliation is in planning; current payments are manually logged.
* Permission overrides (per-user custom roles) are planned but currently use strict role-based defaults.
* Parent Portal app is on the roadmap but not yet available.
