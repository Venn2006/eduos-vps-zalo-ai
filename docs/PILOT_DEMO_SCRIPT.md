# Kịch bản Demo EduOS (Pilot Readiness)
*Dành cho Giám đốc/Chủ trung tâm tiếng Anh (35–55 tuổi, không cần rành công nghệ)*

---

### Giới thiệu (1 phút)
"Chào anh/chị. Hôm nay em sẽ demo cách EduOS ứng dụng AI để tự động chăm sóc phụ huynh và học viên, nhưng vẫn đảm bảo sự kiểm soát an toàn tuyệt đối 100%. 
Anh/chị sẽ thấy AI giúp tiết kiệm 80% thời gian soạn tin nhắn, nhưng **quyền quyết định gửi tin vẫn luôn nằm trong tay anh/chị.**"

### Bước 1: Phát hiện rủi ro trên CEO Dashboard
**Màn hình:** Mở `/dashboard`
* "Đây là trang quản trị dành riêng cho Giám đốc. Anh/chị có thể thấy ngay lập tức AI đang cảnh báo có 3 phụ huynh đang phàn nàn hoặc có nguy cơ nghỉ học."
* "Thay vì chờ nhân viên báo cáo vào cuối tuần, AI đã tự động đọc tin nhắn Zalo/Fanpage và báo cáo ngay lập tức cho anh/chị."

### Bước 2: AI tự động phân tích và nháp tin nhắn (AI Center & Inbox)
**Màn hình:** Mở `/ai-center` và `/fanpage-inbox`
* "Khi bấm vào cảnh báo, hệ thống chuyển sang giao diện Inbox. Tại đây, AI đã đọc đoạn chat, hiểu vấn đề (ví dụ: phụ huynh thắc mắc điểm thi), và **tự động soạn sẵn một tin nhắn trả lời cực kỳ chuyên nghiệp**."
* "Nhưng hệ thống không bao giờ tự ý gửi. Tin nhắn này được đưa vào 'Hàng đợi duyệt'."

### Bước 3: Nhân viên duyệt tin nhắn an toàn (Approval Queue)
**Màn hình:** Mở `/approval-queue`
* "Nhân viên của anh/chị chỉ cần mở danh sách chờ duyệt. Họ có thể sửa lại câu chữ cho phù hợp."
* "Hệ thống có bộ lọc Guardrail tự động kiểm tra xem tin nhắn có chứa thông tin nhạy cảm (như mật khẩu, OTP, hay mã số cá nhân) không. Nếu an toàn, nhân viên bấm 'Duyệt'."

### Bước 4: Demo giả lập gửi an toàn (Sandbox Outbox)
**Màn hình:** Mở `/settings/mock-outbox`
* "Ở giai đoạn này, vì chúng ta đang chạy Pilot thử nghiệm, hệ thống sẽ **không gửi tin nhắn thật** đến điện thoại của phụ huynh. Tất cả các thao tác đều được chạy trong môi trường Giả lập (Sandbox)."
* "Anh/chị thấy nhãn 'Không gửi tới Zalo/Facebook' và 'Không tạo MESSAGE_SENT' không ạ? Điều này chứng minh hệ thống đang khóa cơ chế gửi thật để đảm bảo không có tin nhắn rác nào bị lọt ra ngoài."
* *(Thực hiện bấm các nút 'Đưa vào hàng đợi giả lập', 'Chạy gửi giả lập')*
* "AI báo là tin nhắn đã gửi thành công trong hệ thống nội bộ. Quy trình rất mượt mà."

### Bước 5: Chăm sóc liên tục (Timeline & Sales)
**Màn hình:** Mở `/workspaces/sales/calling`
* "Sau khi xử lý xong tin nhắn, AI còn tự động cập nhật lịch sử này vào hồ sơ của học viên. Đội ngũ Sales hoặc Giáo viên sẽ luôn biết phụ huynh này vừa được chăm sóc như thế nào để có hướng gọi điện thoại follow-up chính xác nhất."

### Kết luận
"Anh/chị thấy đấy, EduOS giúp tự động hóa toàn bộ việc chăm sóc qua Zalo/Fanpage, nhưng chúng ta hoàn toàn kiểm soát được nội dung trước khi gửi. Trong bản Demo hôm nay, tính năng gửi thật đang được tắt để anh/chị trải nghiệm an toàn. Khi trung tâm mình sẵn sàng áp dụng thực tế, chúng ta mới bật tính năng gửi thật."
