# Hướng Dẫn Trải Nghiệm EduOS Dành Cho Founder (Local Demo Walkthrough - Phase 50)

Tài liệu này hướng dẫn anh/chị cách chạy hệ thống EduOS trên máy tính cá nhân để trải nghiệm luồng tính năng trước khi mang đi demo cho khách hàng Pilot. Ở Phase 50, giao diện đã được thiết kế lại tối ưu cho Founder, định tuyến rõ ràng và cam kết an toàn tuyệt đối.

---

## 1. Cần chuẩn bị gì trước khi chạy?
Ở các Phase trước, chúng ta đã thêm tính năng **Sandbox Outbox** (Hộp thư nháp giả lập) để cô lập chức năng gửi thật.
Đảm bảo bạn đã chạy các lệnh sau để có dữ liệu mẫu:

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

Truy cập: 👉 **http://localhost:3000**

---

## 2. Tài khoản Đăng nhập (Demo Accounts)
Hệ thống đã tạo sẵn tài khoản cho Trung tâm ngoại ngữ OMLIS. Mật khẩu chung: **`ChangeMe123!`**

*   **Tài khoản Giám đốc (CEO/Owner):** `owner@omlis.test` (Nên dùng tài khoản này để demo)
*   **Tài khoản Sale:** `sale1@omlis.test`
*   **Tài khoản Giáo viên:** `teacher1@omlis.test`

---

## 3. Kịch bản Demo (Bấm vào đâu và nói gì?)

### Bước 1: Màn hình chính (Dashboard)
*   **Đường dẫn:** `/dashboard`
*   **Mục đích:** Chỉ ra vấn đề ngay lập tức và cho thấy hệ thống bảo mật dữ liệu.
*   **Thao tác:** Chỉ vào dòng "Lưu ý bảo mật" màu vàng trên cùng. Sau đó xem mục Việc cần xử lý gấp.
*   **Kịch bản nói:** "Sáng anh/chị mở máy lên, hệ thống tự động tổng hợp: Hôm nay có bao nhiêu cảnh báo, bao nhiêu AI Draft chờ duyệt. Lưu ý, EduOS tự động ẩn số điện thoại thật của phụ huynh ở màn hình tổng hợp để chống rò rỉ dữ liệu (SĐT đã ẩn). Nhân viên phải click vào tận nơi để xử lý."

### Bước 2: Bấm vào cảnh báo "Phụ huynh phàn nàn" 
*   **Mục đích:** Khẳng định CTA (Call-to-Action) điều hướng chính xác.
*   **Thao tác:** Bấm nút **"Mở hội thoại"** trên thẻ cảnh báo Phụ huynh phàn nàn. Hệ thống sẽ tự động điều hướng sang Zalo Inbox hoặc Fanpage Inbox tương ứng.
*   **Kịch bản nói:** "Khi có phàn nàn, hệ thống không trỏ bừa vào báo cáo chung chung nữa, mà đưa nhân viên thẳng tới ngay đoạn chat để giải quyết tức thì."

### Bước 3: Hàng đợi duyệt tin (Approval Queue) & Sandbox
*   **Đường dẫn:** `/approval-queue` và sau đó là `/settings/mock-outbox`
*   **Mục đích:** Giải quyết sự lo lắng về AI.
*   **Kịch bản nói:** "Phần mềm này **KHÔNG tự động gửi tin nhắn**. Bất kỳ tin nhắn nào do AI soạn (đòi nợ, nhắc bài tập) đều vào 'Hàng đợi duyệt'. Khi bấm Gửi, tin nhắn chỉ chạy vào Sandbox (Hộp thư giả lập) để anh/chị làm quen. Hoàn toàn chưa gửi ra ngoài cho khách thật."

### Bước 4: Module Tài Chính dành cho Founder
*   **Đường dẫn:** Từ trang Chủ, bấm vào `Workspaces` -> Chọn `Tổng quan Tài chính`
*   **Mục đích:** Khẳng định góc nhìn quản trị.
*   **Kịch bản nói:** "Tài chính không chỉ là học phí. Ở đây anh/chị xem được Công nợ theo tuổi nợ (1-7 ngày, 8-14 ngày). Hệ thống đang chuẩn bị ra mắt các chỉ số: Lợi nhuận tạm tính, Tổng chi phí, Hoa hồng sale để anh chị nắm toàn cảnh dòng tiền."

### Bước 5: Quy trình Nhóm Zalo & Bài tập
*   **Đường dẫn:** `/zalo-groups` và `/homework`
*   **Mục đích:** Cho thấy sự mạch lạc trong học thuật.
*   **Kịch bản nói:** "Quy trình bài tập rất rõ ràng: Giáo viên giao -> Học viên nộp -> AI chấm nháp -> Giáo viên duyệt điểm. Không bao giờ có chuyện AI tự động trả điểm sai cho phụ huynh. Các thông báo nhạy cảm như Nhắc học phí cũng bị cấm không được đăng vào nhóm Zalo chung của lớp."

---

## 4. Những câu hỏi thường gặp khi chạy Local

**Hỏi: Vì sao các nút "Leads tiềm năng" hay "Lợi nhuận" lại ghi Sắp có?**
Đáp: Chúng tôi ưu tiên ra mắt những tính năng thiết yếu (Học phí, Nhắc nợ, Chăm sóc học viên) một cách trơn tru trước. Các tính năng mở rộng sẽ được cập nhật trong tương lai mà không hiển thị số ảo đánh lừa khách hàng.

Chúc Founder có một buổi Demo thuyết phục và chốt sales thành công! 🚀
