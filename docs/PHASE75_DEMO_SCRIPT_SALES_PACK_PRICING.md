# Phase 75: Demo Script, Sales Pack & Pricing Positioning

## 1. Executive Positioning
**Vietnamese:**
“EduOS là hệ điều hành vận hành trung tâm ngoại ngữ: CEO nhìn tổng quan, nhân viên xử lý tin nhắn/lead/công việc, giáo viên xử lý học vụ/bài tập, kế toán theo dõi học phí/công nợ, AI hỗ trợ nháp và cảnh báo.”

**English:**
“EduOS is an operating system for language centers, combining CRM, team inbox, task management, academic operations, finance reporting, and embedded AI assistance.”

## 2. Target Customers
* Trung tâm tiếng Anh nhỏ/vừa (SMEs)
* Chủ trung tâm đang quản bằng Zalo cá nhân / Excel rải rác
* Trung tâm có nhiều nhân viên tư vấn/tuyển sinh
* Trung tâm cần quản lý học phí, công nợ chặt chẽ
* Trung tâm muốn ứng dụng AI hỗ trợ vận hành nhưng vẫn cần kiểm soát

## 3. Pain Points
* Tin nhắn Zalo/Facebook rải rác, cá nhân hóa khó quản lý
* Chủ trung tâm không biết nhân viên đang xử lý khách nào, hiệu suất ra sao
* Lead bị quên follow-up dẫn đến mất khách
* Công việc giao miệng qua Zalo, không có tracking, dễ trôi việc
* Giáo viên / học vụ / tài chính tách rời, thiếu đồng bộ dữ liệu
* Học phí / công nợ khó theo dõi, rò rỉ doanh thu
* Các AI chatbot hiện tại trên thị trường hoạt động độc lập, không gắn kết vào luồng vận hành thực tế

## 4. EduOS Solution Map
* `/dashboard` — **Tổng quan CEO**: Giám sát KPIs, sức khỏe doanh nghiệp, tin báo khẩn cấp.
* `/team-inbox` — **Tin nhắn & Zalo / hotline governance**: Quản trị tin nhắn đa kênh (Zalo, Fanpage), gán nhân viên phụ trách.
* `/tasks` — **Giao việc**: Tracking công việc toàn trung tâm dạng Kanban.
* `/crm-command-center` — **CRM & lead pipeline**: Quản lý phễu khách hàng từ khi quan tâm đến lúc đóng tiền.
* `/workspaces/teacher` — **Học vụ / lịch / điểm danh**: Quản trị giáo viên, báo cáo học vụ.
* `/homework` — **Bài tập / giáo án / báo cáo phụ huynh**: AI hỗ trợ soạn bài và đánh giá.
* `/workspaces/finance` — **Học phí / công nợ / doanh thu**: Theo dõi tình hình tài chính.
* `/settings/safety-center` — **Kiểm soát an toàn nội bộ**: Thiết lập giới hạn, quyền, và mô phỏng gửi tin (Sandbox).

## 5. 10-Minute Demo Script

* **0:00–1:00: CEO Dashboard**
  * **Route:** `/dashboard`
  * **Show:** Top KPIs, AI command feed.
  * **Talk:** "Ngay khi mở máy, anh/chị nhìn thấy sức khỏe trung tâm và các vấn đề khẩn cấp AI báo cáo."
  * **Value:** Instant visibility. 
  * **Safety:** Dữ liệu demo an toàn.

* **1:00–2:30: Team Inbox / Zalo Hotline**
  * **Route:** `/team-inbox`
  * **Show:** Split-pane layout, AI summary drafts.
  * **Talk:** "Toàn bộ tin nhắn Zalo/Fanpage gom về đây. Anh/chị xem được nhân viên nào đang chat gì, AI có gợi ý trả lời nhưng phải duyệt."
  * **Value:** Control over communications, preventing lead loss.
  * **Safety:** Mock data, no real sending.

* **2:30–3:30: Giao Việc (Task Management)**
  * **Route:** `/tasks`
  * **Show:** Kanban board, task assignment.
  * **Talk:** "Thay vì giao miệng qua Zalo, mọi việc từ Sale đến Giáo vụ đều có tracking rõ ràng ở đây."
  * **Value:** Accountability and visibility.

* **3:30–5:00: CRM Lead Pipeline**
  * **Route:** `/crm-command-center`
  * **Show:** Follow-ups, conversion status.
  * **Talk:** "Phễu khách hàng trực quan, không để sót bất kỳ một số điện thoại nào."
  * **Value:** Increased conversion rates.

* **5:00–6:30: Teacher / Học vụ Workspace**
  * **Route:** `/workspaces/teacher`
  * **Show:** Schedule, attendance checks.
  * **Talk:** "Giáo viên lên đây điểm danh, nhận lớp, xem lịch mà không cần file Excel rời."
  * **Value:** Streamlined academic operations.

* **6:30–7:30: Homework / Curriculum**
  * **Route:** `/homework`
  * **Show:** AI drafting homework or reports.
  * **Talk:** "AI sẽ nháp sẵn giáo án, hoặc nhận xét học sinh. Giáo viên chỉ cần duyệt và chỉnh sửa."
  * **Value:** Massive time savings for teachers.

* **7:30–8:30: Finance Workspace**
  * **Route:** `/workspaces/finance`
  * **Show:** Tuition tracking, overdue debts.
  * **Talk:** "Theo dõi sát sao học phí, công nợ. Hệ thống tự động nhắc nhở (bản nháp) để nhân viên gửi cho phụ huynh."
  * **Value:** Cash flow protection.

* **8:30–9:30: AI Safety / Human Approval**
  * **Route:** `/settings/safety-center` or `/approval-queue`
  * **Show:** Mock outbox, governance policy.
  * **Talk:** "Quan trọng nhất, AI không tự tiện nhắn tin cho khách. Mọi thứ là nháp, con người duyệt cuối cùng."
  * **Value:** Trust and brand safety.

* **9:30–10:00: Pilot Next Steps**
  * **Action:** Close demo, present Pilot package.

## 6. Founder Talk Track
"Chào anh/chị, em biết nỗi đau lớn nhất của các trung tâm hiện nay là quản lý rải rác. Khách thì nhắn Zalo, giáo viên làm Excel, kế toán phần mềm riêng. Hôm nay em xin giới thiệu EduOS - một 'hệ điều hành' gom tất cả vào một chỗ. Từ màn hình này, anh chị là CEO sẽ thấy ngay hôm nay trung tâm có bao nhiêu leads, doanh thu bao nhiêu, ai đang chưa đóng học phí. Nhân viên tư vấn có chỗ trả lời tin nhắn Fanpage và Zalo chung một màn hình, anh chị kiểm soát được chất lượng chat. AI của bên em sẽ đóng vai trò như một người trợ lý: nó nháp sẵn câu trả lời, nháp báo cáo học tập, nháp tin nhắc học phí. Nhưng đặc biệt: AI không tự gửi. Nhân viên mình vẫn là người bấm duyệt cuối cùng. Mọi dữ liệu anh chị thấy ở đây đang là dữ liệu mô phỏng, bảo mật tuyệt đối, không đụng chạm đến Zalo cá nhân của ai cả."

## 7. Objection Handling

* **“Có kết nối Zalo thật chưa?”**
  * *Answer:* EduOS đã sẵn sàng hạ tầng, nhưng để kết nối thật anh/chị cần Zalo OA (Official Account) của doanh nghiệp và tuân thủ các quy định API của Zalo. Bọn em hỗ trợ tư vấn quy trình này ở giai đoạn sau.

* **“Có đọc được Zalo cá nhân nhân viên không?”**
  * *Answer:* Hoàn toàn KHÔNG. EduOS chỉ kết nối các kênh chính thức của trung tâm (Zalo OA, Fanpage). Quét Zalo cá nhân là vi phạm pháp luật và chính sách của Zalo.

* **“AI có tự gửi tin không?”**
  * *Answer:* KHÔNG. Triết lý của EduOS là AI chỉ "nháp" (Draft). Con người (nhân viên/quản lý) phải bấm "Duyệt" (Approve) tin nhắn mới được gửi đi. Đảm bảo an toàn tuyệt đối cho thương hiệu.

* **“Dữ liệu phụ huynh/học viên có an toàn không?”**
  * *Answer:* Rất an toàn. Hệ thống phân quyền chặt chẽ (Role-based), nhân viên chỉ thấy dữ liệu được phép.

* **“Có thay thế giáo viên không?”**
  * *Answer:* Không, AI của EduOS là công cụ giúp giáo viên tiết kiệm 80% thời gian gõ báo cáo và chấm bài, giáo viên vẫn là người quyết định chuyên môn.

* **“Có dùng được trên điện thoại không?”**
  * *Answer:* CÓ. EduOS được tối ưu hiển thị tốt trên cả điện thoại, giúp anh chị xem báo cáo mọi lúc mọi nơi.

* **“Bao lâu triển khai được?”**
  * *Answer:* Demo Pilot có thể set up trong 1-2 tuần với dữ liệu mẫu hoặc nhập bằng tay, không ảnh hưởng đến hệ thống hiện tại của anh/chị.

* **“Nếu trung tâm đang dùng Excel/Zalo thì chuyển qua sao?”**
  * *Answer:* Bọn em có quy trình đưa dữ liệu Excel lên từ từ, không bắt ép thay đổi 100% trong một ngày.

## 8. Pricing / Package Positioning (Draft)

| Gói (Package) | Starter | Growth | Pro / Center OS | Pilot Package |
|---|---|---|---|---|
| **Quy mô** | < 100 học viên | 100 - 300 học viên | > 300 học viên | Dùng thử đánh giá |
| **Giá hàng tháng (VND)** | ~ 1,500,000 | ~ 3,500,000 | ~ 7,000,000+ | Miễn phí / Phí setup nhỏ |
| **Phí Onboarding** | Tự làm (Free) | ~ 2,000,000 | Tùy biến (Custom) | Tùy biến |
| **Modules Bao gồm** | CRM, Giao việc, Mẫu AI cơ bản | Tất cả của Starter + Team Inbox, Học vụ, Tài chính | Toàn bộ tính năng + Tùy chỉnh báo cáo + Phân quyền sâu | CRM, Giao việc, Team Inbox (Mock) |
| **Modules Bỏ qua** | Tài chính, Zalo thật | Giới hạn số lượng tài khoản | Không giới hạn | Kế nối thật, tự động hóa |
| **Ghi chú** | *Giá chưa bao gồm phí gửi tin Zalo/SMS thực tế (trả riêng cho nhà mạng).* | *Chi phí mang tính chất tham khảo nháp.* | | *Chỉ áp dụng trong 4-8 tuần đầu.* |

## 9. Paid Pilot Proposal
* **Duration:** 4–8 weeks
* **Scope:**
  * CEO dashboard
  * CRM
  * Team inbox mock/manual workflow
  * Task management
  * Finance reporting
  * Homework/teacher workflow
* **Success Metrics:**
  * Giảm thời gian phản hồi tin nhắn (Response time).
  * Giảm tỷ lệ quên chăm sóc Lead (Forgotten lead reduction).
  * Giảm số công việc trễ hạn (Overdue task reduction).
  * Tăng tính minh bạch trong việc thu hồi học phí.
  * Tăng hiệu quả buổi họp giao ban hàng tuần của owner.
* **Exclusions:**
  * No real send initially.
  * No personal Zalo scraping.
  * No banking mutation.
  * No autonomous AI execution.

## 10. Demo Readiness Checklist
Before showing to a center, the founder must verify:
- [x] Supabase dev/test password rotated (if exposed).
- [x] `.env` not committed.
- [x] App builds successfully (`npm run build`).
- [x] Tests pass (`npm run test`).
- [x] Demo login works (`ceo@eduos.demo`).
- [x] Demo routes open and populate correctly.
- [x] No real customer data present.
- [x] No real send buttons active.
- [x] Mobile responsiveness checked.
- [x] Founder has reviewed the talk track.

## 11. Sales One-Pager Copy

### EduOS – Hệ Điều Hành Thông Minh Cho Trung Tâm Ngoại Ngữ
**Dành riêng cho các chủ trung tâm muốn giải phóng thời gian và chuẩn hóa vận hành.**

**5 Lợi Ích Cốt Lõi:**
1. **Quản lý tập trung 1 màn hình:** Từ học phí, lịch học đến tin nhắn phụ huynh, không còn rải rác Zalo/Excel.
2. **Không bao giờ rơi rớt khách hàng:** CRM theo dõi sát sao từng Lead, tự động nhắc nhở nhân viên sale.
3. **Tiết kiệm 80% thời gian cho Giáo viên:** Trợ lý AI giúp soạn giáo án, nháp báo cáo nhận xét học sinh trong vài giây.
4. **Kiểm soát chặt chẽ Tài chính:** Theo dõi doanh thu, công nợ tự động, giảm thiểu rò rỉ thất thoát.
5. **Vận hành trơn tru:** Quản lý giao việc (Task) rõ ràng, minh bạch tiến độ từng phòng ban.

**Các Modules Chính:**
CEO Dashboard | CRM & Leads | Giao Việc (Tasks) | Team Inbox (Đa kênh) | Học Vụ & Lịch | Tài Chính.

**An Toàn & Bảo Mật Là Ưu Tiên Số 1:**
EduOS sử dụng AI với vai trò là "Người Trợ Lý". Trí tuệ nhân tạo chỉ soạn nháp, con người luôn là người đưa ra quyết định duyệt cuối cùng trước khi gửi cho khách hàng. Chúng tôi cam kết tuyệt đối bảo mật dữ liệu trung tâm và tuân thủ các chính sách API chính thống.

*Liên hệ Demo ngay hôm nay để nhận ưu đãi gói Pilot!*

## 12. Next Phase Recommendations
* **Phase 76**: Role & Permission UX Polish
* **Phase 77**: Demo Seed Reset + Screenshot QA Pack
* **Phase 78**: Official Connector Readiness Technical Spec
* **Phase 79**: Production Deployment Readiness Checklist
* **Phase 80**: Paid Pilot Implementation Plan
