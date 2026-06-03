# Phase 23: Master System QA Checklist

## 1. Authentication and RBAC
- [ ] **Anonymous Blocked:** Truy cập `/dashboard` khi chưa đăng nhập sẽ bị đẩy về `/login`.
- [ ] **UNKNOWN Blocked:** User có role không hợp lệ không thể xem các phân hệ nhạy cảm.
- [ ] **OWNER Access:** Vào được mọi workspace, cài đặt hệ thống, và duyệt lệnh AI.
- [ ] **ADMIN Access:** Quyền hạn tương đương OWNER (trong thiết kế hiện tại).
- [ ] **SALE Access:** Vào được `/workspaces/sales`, `/workspaces/sales/calling`, `/leads`. Bị chặn khi vào tài chính hoặc cài đặt hệ thống.
- [ ] **TEACHER Access:** Vào được `/workspaces/teacher`, `/classes`, `/attendance`. Bị chặn khi vào báo cáo doanh thu hoặc sale.
- [ ] **ACCOUNTANT Access:** Vào được `/workspaces/finance`, `/payments`. Bị chặn khi vào kịch bản chăm sóc sale hoặc điểm danh giáo viên.
- [ ] **Cross-role Denied Routes:** Hệ thống hiển thị `ForbiddenRoleMessage` thay vì crash hay load data ẩn.

## 2. Dashboard and AI Center
- [ ] **CEO Dashboard:** Biểu đồ, lưới hiển thị và các thẻ KPI load bình thường.
- [ ] **CEO Snapshot:** Module tổng hợp nhanh các chỉ số (Leads mới, Trial Bookings, Dòng tiền) load thành công.
- [ ] **AI Prompt Prefill:** Bấm vào các nút lệnh gợi ý ("Doanh thu hôm nay", "Viết thư cảm ơn") sẽ tự động điền vào khung chat.
- [ ] **AI Role-scoped API:** AI từ chối trả lời các câu hỏi vượt quá thẩm quyền của user (ví dụ: Sale hỏi về doanh thu toàn trung tâm).
- [ ] **Denied Prompts:** Không làm rò rỉ dữ liệu hoặc mã lỗi nội bộ ra ngoài giao diện.

## 3. Sales Workflow
- [ ] **Sales Workspace (`/workspaces/sales`):** Bảng Kanban quản lý trạng thái Leads kéo thả/load bình thường.
- [ ] **Calling Page (`/workspaces/sales/calling`):** Danh sách cuộc gọi hiển thị đúng danh sách Leads cần chăm sóc.
- [ ] **Manual Call:** Giao diện bấm gọi và thời gian gọi chạy đúng.
- [ ] **Call Outcome:** Form log kết quả (Answered, No Answer, Booked Trial) lưu thành công xuống DB.
- [ ] **Follow-up Task:** Hệ thống tự tạo lịch gọi lại nếu cuộc gọi không thành công.
- [ ] **Booked Trial:** Tạo bản ghi học thử và chuyển Lead sang trạng thái phù hợp.
- [ ] **KPI:** Số lượng cuộc gọi được đếm và hiển thị ngay cho Sale/Quản lý.
- [ ] **Suggestion Copy:** AI tạo gợi ý kịch bản Follow-up an toàn, đọc được (chỉ đọc, không auto-send).

## 4. Academic Workflow
- [ ] **Classes:** Danh sách lớp học hiển thị đầy đủ thông tin.
- [ ] **Attendance:** Điểm danh học viên, lưu trạng thái (Có mặt, Vắng, Đi trễ).
- [ ] **Homework:** Giáo viên giao bài và chấm điểm.
- [ ] **Teacher Workspace (`/workspaces/teacher`):** Tổng hợp lịch dạy và tác vụ cần làm của giáo viên trong ngày.
- [ ] **Teacher RBAC:** Giáo viên chỉ thao tác trên các lớp được phân công.

## 5. Finance Workflow
- [ ] **Finance Workspace (`/workspaces/finance`):** Tổng quan tài chính (Thu, Chi, Công nợ).
- [ ] **Payments:** Ghi nhận thanh toán thủ công.
- [ ] **Renewals:** Quản lý danh sách học viên sắp hết hạn học phí.
- [ ] **Debt Aging:** Hiển thị chính xác khoản nợ phân loại theo thời gian (1-7 ngày, 8-14 ngày...).
- [ ] **Accountant RBAC:** Phân quyền Kế toán đảm bảo Sale/Teacher bị chặn hoàn toàn.

## 6. Messaging
- [ ] **Fanpage Inbox:** Danh sách tin nhắn Facebook load đúng. Có nhãn AI.
- [ ] **Zalo Inbox/Groups/Accounts:** Quản lý Zalo hiển thị bình thường.
- [ ] **Connector Center:** Giao diện giám sát Zalo VPS và Fanpage hiển thị rõ trạng thái kết nối.
- [ ] **No Live Send:** Hệ thống chỉ tạo "Nháp" (Drafts). Không gửi tin nhắn ra ngoài Zalo/Fanpage trừ khi user bấm "Duyệt".
- [ ] **Webhook Safety:** API từ chối các request từ bên ngoài nếu thiếu mã hash hợp lệ của Facebook.

## 7. Production Readiness
- [ ] **Env Vars:** Mọi cấu hình biến môi trường đã có sẵn.
- [ ] **Database Backup:** Quy trình sao lưu đã thiết lập.
- [ ] **Connector Heartbeat:** Kiểm tra trạng thái ping VPS.
- [ ] **Logs:** Các thư mục logs hoặc dịch vụ log được kích hoạt.
- [ ] **No Temp Files:** Đã xóa bỏ các file test/scratch (update_dashboard.js...).
- [ ] **No Secrets Committed:** Không có API key thật nằm trong source code.

## 8. Browser QA
- [ ] **Desktop:** Bố cục hiển thị tốt trên màn hình >1024px.
- [ ] **Tablet:** Giao diện điều chỉnh linh hoạt.
- [ ] **Mobile:** Ẩn bớt sidebar, ưu tiên các card nội dung dạng dọc.
- [ ] **Vietnamese Labels:** Mọi ngôn ngữ hiển thị bằng tiếng Việt chuẩn.
- [ ] **No Dense Tables:** Sử dụng thẻ (Card UI) thay vì bảng Excel dày đặc ở những nơi có thể.
- [ ] **Loading/Empty States:** Hiển thị rõ trạng thái "Đang tải" và "Không có dữ liệu".
- [ ] **Forbidden State Screens:** Trang báo lỗi 403 (Không có quyền) rõ ràng, đẹp mắt.

## 9. Data Safety
- [ ] **Tenant Scoping:** Mọi truy vấn Prisma đều gắn kèm `{ where: { tenantId } }`.
- [ ] **Assigned Lead Scoping:** Sale không xem được khách hàng của người khác (nếu cấu hình cấm).
- [ ] **No Finance Leakage:** Giấu sạch dữ liệu tiền nong đối với người không có phận sự.
- [ ] **No Teacher Data Leakage:** Giấu sạch điểm số, nhận xét đối với người không liên quan.
- [ ] **No Parent Report Accidental Send:** Phiếu bé ngoan không tự động gửi đi mà phải qua kiểm duyệt.

## 10. Commands
- [ ] `git status` sạch sẽ.
- [ ] `npm run typecheck` chạy không lỗi.
- [ ] `npm run build` chạy thành công.
- [ ] `npm run test` báo pass 100%.
- [ ] Dữ liệu demo seed thành công trên môi trường staging.
- [ ] Kiểm thử Smoke Test trực tiếp trên production thành công.
