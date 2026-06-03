# Phase 50 UX Issue Log & Hardening

## Overview
Trong Phase 50, chúng tôi tiến hành rà soát chuyên sâu về trải nghiệm người dùng (UX) đối với Owner/Founder để đảm bảo các kịch bản demo an toàn, chính xác và không gây hiểu nhầm.

---

## Danh sách Issue và Cách khắc phục

### 1. Sai lệch điều hướng thẻ "Phụ huynh phàn nàn" trên Dashboard
*   **Vấn đề (Issue):** Thẻ (Card) "Phụ huynh phàn nàn" sinh ra từ `PARENT_COMPLAINT_DETECTED` bị trỏ link mặc định vào `/reports` với nhãn "Xem Báo Cáo", khiến Founder không thể thao tác xử lý trực tiếp nội dung phàn nàn.
*   **Mức độ (Severity):** High (Chặn luồng demo)
*   **Cách khắc phục (Fix):** Đã sửa lại hàm `generateCEOIntelligence` (trong `ceoConversationIntelligence.ts`). Tính năng điều hướng (Action URL) giờ đây đọc cờ `source` của sự kiện:
    *   Nếu `source === 'ZALO'`, trỏ về `/zalo-inbox?filter=COMPLAINT`.
    *   Nếu `source === 'FACEBOOK'`, trỏ về `/fanpage-inbox?filter=COMPLAINT`.
    *   Nhãn (Action Label) đổi thành **"Mở hội thoại"**.

### 2. Chính sách che giấu PII (Số điện thoại) gây khó chịu
*   **Vấn đề (Issue):** Chính sách ẩn giấu thông tin cá nhân (PII) trên Dashboard quá cứng nhắc, thay thế số điện thoại bằng tag `[SĐT BẢO MẬT]`, làm cho giao diện báo cáo khô khan và khó demo.
*   **Mức độ (Severity):** Medium
*   **Cách khắc phục (Fix):** Đã sửa `timelineBuilder.ts`. Regex số điện thoại giờ đây thay thế bằng chuỗi **`[SĐT đã ẩn]`** tự nhiên hơn. Đã bổ sung thông báo màu vàng trên cùng Dashboard giải thích rõ với Founder: *"Số điện thoại và thông tin nhạy cảm được tự động ẩn ở Dashboard. Mở hồ sơ/hội thoại chi tiết để xem đầy đủ và xử lý."*

### 3. Nút bấm ảo (Dead/Misleading CTAs) trên Dashboard
*   **Vấn đề (Issue):** Các nút CTA chưa hoàn thiện như "Telesale", "Leads tiềm năng", "Học viên yếu kém" vẫn cho phép bấm hoặc trỏ sai đường dẫn.
*   **Mức độ (Severity):** Medium
*   **Cách khắc phục (Fix):**
    *   "Đã gọi (Telesale)": Đã trỏ đúng về `/workspaces/sales/calling`.
    *   "Leads tiềm năng": Vô hiệu hóa, đổi nhãn thành **"Sắp có"**.
    *   "Học viên yếu kém": Vô hiệu hóa, đổi nhãn thành **"Sắp có"**.

### 4. Thiếu Block hiển thị số liệu phân tích tài chính sâu (Finance Workspace)
*   **Vấn đề (Issue):** Trang `/workspaces/finance` chỉ hiển thị học phí cơ bản, thiếu các góc nhìn "Owner-facing" quan trọng như Tổng chi phí, Lợi nhuận, Hoa hồng.
*   **Mức độ (Severity):** Medium
*   **Cách khắc phục (Fix):** Bổ sung thêm các thẻ ActionCard tương ứng (Lợi nhuận, Chi phí, Doanh thu theo nhân viên, Hoa hồng sale). Gắn nhãn **"Sắp có"** và ghi rõ lý do chưa đủ dữ liệu hoặc tính năng đang phát triển, giúp giải quyết mong muốn góc nhìn quản trị viên mà không "lừa dối" khách hàng.

### 5. Luồng tính năng Zalo Lớp Học & Bài Tập chưa rõ ràng
*   **Vấn đề (Issue):** Việc AI nháp bài tập và tự động hóa trong nhóm Zalo thiếu minh bạch, khách hàng dễ hiểu lầm là bot gửi thẳng đáp án/nhắc nợ vào nhóm chung.
*   **Mức độ (Severity):** High
*   **Cách khắc phục (Fix):** 
    *   Trong `/zalo-groups`: Bổ sung cảnh báo (Alert) màu xanh trên cùng, làm rõ nguyên tắc "Không gửi nhắc nợ lên nhóm chung" và trạng thái Sandbox.
    *   Trong `/homework`: Đã làm nổi bật bằng biểu đồ đường ống (Pipeline): **`Giao bài -> Nộp bài -> AI chấm nháp -> GV Duyệt -> Phụ huynh nhận`**. Sửa nhãn nút gửi thành **"Duyệt & Gửi (Vào Sandbox)"**.

---

## Tổng kết
Tất cả các rào cản ngăn chặn buổi Founder Demo hiệu quả đã được khắc phục hoàn toàn. Không có API thật, LLM thật hay Worker nào bị kích hoạt nhầm trong Phase này.
