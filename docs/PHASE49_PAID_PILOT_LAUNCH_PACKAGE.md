# Phase 49: Paid Pilot Launch Package

## Pilot Objective
Tạo ra một bộ tài liệu kinh doanh và kịch bản demo hoàn chỉnh để chào bán giải pháp EduOS cho 1–3 trung tâm ngoại ngữ đầu tiên (Founding Centers). Mục tiêu là chứng minh giá trị của một "AI Operating System" giúp chủ trung tâm quản lý mọi điểm chạm với phụ huynh và học viên qua Zalo/Fanpage, đồng thời đảm bảo an toàn dữ liệu và quy trình kiểm duyệt chặt chẽ.

## Target Customer Profile
- Chủ trung tâm ngoại ngữ / Giám đốc điều hành có độ tuổi từ 35–55.
- Quy mô trung tâm: 200 - 1000 học viên.
- Đang gặp nỗi đau: Khó kiểm soát chất lượng tư vấn, dễ rớt số do nhân viên bỏ quên follow-up, quản lý học phí và báo cáo học tập rời rạc, tốn nhiều thời gian đọc báo cáo hoặc trực tiếp đọc tin nhắn Zalo/Fanpage để phát hiện vấn đề.

## Core Value Proposition
EduOS là "AI Operating System cho trung tâm ngoại ngữ":
- **Nhìn thấu vấn đề:** AI tự động đọc hiểu và báo cáo các rủi ro từ hội thoại Zalo/Fanpage lên thẳng CEO Dashboard.
- **Tối ưu năng suất:** AI tự động nháp tin nhắn chăm sóc, nhắc nhở đóng học phí, gửi báo cáo học tập.
- **Kiểm soát tuyệt đối:** Con người (nhân viên) luôn là người duyệt tin nhắn cuối cùng trước khi gửi đi.
- **Quản lý tập trung:** Quản lý sale, học viên, phụ huynh và công nợ học phí trong một hệ thống duy nhất.

## What is Included (Trong bản Pilot)
- Dashboard quản trị rủi ro hội thoại (AI Conversation Intelligence).
- Inbox Zalo/Fanpage thông minh (đọc và phân tích ý định).
- Hàng đợi duyệt tin nhắn (Approval Queue).
- Môi trường Sandbox (Mock Outbox) để trải nghiệm quy trình duyệt tin.
- Hệ thống quản lý thông tin CRM cơ bản (Học viên, Phụ huynh, Lớp học).

## What is Not Included
- Tự động gửi tin nhắn thật qua Zalo/Fanpage (Real Send bị vô hiệu hóa mặc định).
- Background Worker tự động hóa hoàn toàn (sẽ cập nhật ở Phase sau).
- API tích hợp với các phần mềm kế toán bên thứ 3.

## Demo Story
Giám đốc mở màn hình, thấy ngay 3 phụ huynh đang phàn nàn. Bấm vào chi tiết, AI đã nháp sẵn tin nhắn xin lỗi và giải thích hợp lý. Nhân viên chỉ cần vào Hàng đợi duyệt, chỉnh sửa một chút và bấm "Duyệt". Hệ thống kiểm tra an toàn (Guardrail) và đưa vào Sandbox. Tất cả quy trình chỉ mất 30 giây thay vì 15 phút. Không có rủi ro tin nhắn tự động gửi sai vì tính năng gửi thật đang bị khóa.

## Onboarding Steps & Staff Training Checklist
Xem chi tiết tại file `PILOT_ONBOARDING_CHECKLIST.md`.

## Technical Setup Checklist
- [ ] Khởi tạo Tenant mới cho trung tâm.
- [ ] Cấu hình tài khoản Owner.
- [ ] Import dữ liệu mẫu (Học viên, Phụ huynh).
- [ ] Cài đặt Guardrail Rules riêng biệt cho trung tâm (nếu có).

## Safety Checklist
- Không cấu hình Zalo OA/Fanpage Token thực tế trên môi trường Demo.
- `canSendRealNow` phải luôn bằng `false`.
- Không có bất kỳ Worker nào chạy ẩn để gửi tin.

## Pilot Success Criteria
- Khách hàng hiểu rõ cách AI hỗ trợ con người chứ không thay thế con người.
- Khách hàng đồng ý mua gói Founding Pilot để sử dụng thử nghiệm giới hạn.
- Đội ngũ nhân viên (Sale, Teacher) của khách hàng có thể sử dụng Approval Queue thành thạo sau 1 giờ training.

## Pilot Risks
- Nhân viên của khách hàng có thể cảm thấy hệ thống quá phức tạp. Giải pháp: Tập trung training vào một luồng công việc cụ thể (ví dụ: gửi báo cáo học tập).
- Chủ trung tâm kỳ vọng tự động gửi ngay lập tức. Giải pháp: Nhấn mạnh rủi ro của việc tự động hóa 100% đối với ngành giáo dục và đề cao sự an toàn của mô hình "AI hỗ trợ, con người duyệt".

## Pilot Support Model
- Hỗ trợ trực tiếp qua Zalo Group 24/7 (với gói Managed/Premium).
- Review kết quả sử dụng hàng tuần trực tiếp với Giám đốc trung tâm.

## Recommended Pricing Options
Xem chi tiết tại file `PILOT_PRICING_AND_OFFER.md`.

## Go/No-go Checklist for First Paid Center
- Khách hàng hiểu rõ đây là bản Pilot? [ ]
- Khách hàng hiểu tính năng gửi thật sẽ được bật sau khi kiểm thử thành công? [ ]
- Khách hàng đồng ý với mức giá Pilot? [ ]
- Đã ký thỏa thuận bảo mật dữ liệu (NDA)? [ ]
