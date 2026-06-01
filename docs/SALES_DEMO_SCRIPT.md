# Sales Demo Script & Founder Pitch

**Mục tiêu:** Kịch bản Demo 5-7 phút dành cho Giám đốc/Chủ trung tâm ngoại ngữ.
**Định vị lõi:** EduOS không phải là phần mềm quản lý thông thường (SaaS). EduOS là **Hệ điều hành AI (AI Operating System)** dành riêng cho trung tâm ngoại ngữ.
**Nỗi đau cốt lõi:** Phần mềm cũ nhồi nhét quá nhiều báo cáo, bắt CEO phải tự mò mẫm dữ liệu. EduOS dùng AI để tổng hợp rủi ro, cơ hội, tác vụ cần duyệt, sale, tài chính, lớp học, Zalo và Fanpage vào một trung tâm chỉ huy duy nhất.

---

## 1. Checklist Trước Khi Demo
- [ ] Xác nhận nhánh hiện tại là `master`.
- [ ] Chạy lệnh `npm run db:seed` để đảm bảo dữ liệu Demo hoàn hảo (tên tiếng Việt, dữ liệu học thử, Fanpage).
- [ ] Đảm bảo Docker (Postgres, Redis) và VPS Zalo/Fanpage webhook đang chạy mượt mà.
- [ ] Mở sẵn trình duyệt ở màn hình Login, chế độ toàn màn hình, giao diện Sáng/Tối tùy thuộc ánh sáng phòng.
- [ ] Không click quá nhanh, để khách hàng kịp nhìn thấy các "Magic Moments" của AI.

---

## 2. Kịch Bản Demo Trực Tiếp (5-7 Phút)

### Bước 1: Đăng nhập (Login as OWNER)
*Mở `/login`, đăng nhập với tài khoản Owner.*
**Talk track:** "Chào chị, hôm nay em không giới thiệu cho chị một phần mềm quản lý học viên nữa. Phần mềm thì bên nào cũng giống nhau: nhập liệu, xuất Excel. Hôm nay, em giới thiệu cho chị một **Hệ điều hành AI** – một người trợ lý Giám đốc thực thụ."

### Bước 2: Bảng Điều Khiển Giám Đốc (`/dashboard`)
*Vừa vào Dashboard, dừng lại 3 giây ở phần 'Tóm tắt hôm nay'.*
**Talk track:** "Chị không cần mở 30 báo cáo nữa. EduOS tự đưa việc quan trọng lên trước. Ví dụ, hệ thống sẽ tự chỉ ra hôm nay có vấn đề gì cần xử lý: lớp nào có rủi ro, học phí nào cần theo dõi, tin nhắn Fanpage nào cần phản hồi, và AI draft nào đang chờ duyệt."

### Bước 3: AI Command Bar
*Click vào AI Command Bar ở đầu trang.*
**Talk track:** "Nếu chị muốn hỏi sâu hơn, thay vì mò vào menu, chị chỉ cần hỏi thẳng."
*Nhập lệnh: "Hôm nay có vấn đề gì nghiêm trọng không?"*
**Talk track:** "AI sẽ tự phân tích dữ liệu toàn trung tâm và trả lời chị bằng tiếng Việt, giúp chị tiết kiệm hàng giờ đọc số liệu."

### Bước 4: Trung Tâm Chỉ Huy AI (`/ai-center`)
*Chuyển sang tab AI Center. Hiển thị CEO Chat ở trên cùng.*
**Talk track:** "Đây là não bộ của trung tâm. Phần trên là nơi chị chat trực tiếp với AI. Phần dưới là **AI Drafts Cần Duyệt**. Đội ngũ Sale và Giáo viên làm việc, AI hỗ trợ soạn nháp các tin nhắn chăm sóc phụ huynh, nhắc học phí, báo cáo học tập. Các nội dung nhạy cảm chỉ ở trạng thái nháp và cần người duyệt. Chị chỉ lướt qua, thấy ok thì ấn **Duyệt Nháp**. Mọi thứ hoàn toàn nằm trong tầm kiểm soát."

### Bước 5: Hộp Thư Fanpage AI (`/fanpage-inbox`)
*Vào Fanpage Inbox, click vào một tin nhắn hỏi về IELTS/Kids English.*
**Talk track:** "Chị xem một ví dụ thực tế. Phụ huynh nhắn tin hỏi lịch học IELTS. AI của EduOS không tự động chat linh tinh làm hỏng thương hiệu. Nó phân tích tin nhắn, tự động soạn một đề xuất trả lời cực chuẩn, và tạo thẻ khách hàng nóng (HOT) ở ngay cột bên phải cùng với một nút **Tạo Follow-up Task** cho Sale. Việc của nhân viên chỉ là đọc, sửa nhẹ và copy gửi."

### Bước 6: Quản lý Tuyển sinh (`/leads`)
*Chuyển qua giao diện quản lý Leads.*
**Talk track:** "Các khách hàng từ Fanpage được gom về đây trước, còn Zalo sẽ được hợp nhất sâu hơn ở phase tiếp theo. Mục tiêu là mọi nguồn tuyển sinh đều chảy về một CRM chung. Giao diện cực kỳ trực quan bằng tiếng Việt. Chị nhìn ngay được ai là khách 'Mới', ai 'Tiềm năng' để phân bổ Sale."

### Bước 7: Học Thử & Nhập Học (`/trial-bookings`)
*Chuyển qua giao diện Trial Bookings.*
**Talk track:** "Khi khách có nhu cầu học thử, thông tin được gom về danh sách tuyển sinh/học thử để sale hoặc admin xử lý tiếp. Các bước tạo lịch học thử tự động sâu hơn sẽ được hoàn thiện ở phase sau."

### Bước 8: Chốt Sale (Closing)
*Quay lại màn hình Dashboard.*
**Talk track:** "Phần mềm cũ cho chị dữ liệu. EduOS cho chị **quyết định**. Nó giải phóng chị khỏi việc giám sát lặt vặt để tập trung vào việc mở rộng trung tâm. EduOS không thay con người ra quyết định; EduOS giúp CEO thấy đúng vấn đề và ra quyết định nhanh hơn."

---

## 3. Top 5 "Magic Moments" Trong Demo
1. **Tóm tắt hôm nay:** Ngay khoảnh khắc đăng nhập, không thấy biểu đồ rối rắm, chỉ thấy dòng chữ AI báo cáo chính xác việc cần làm.
2. **AI Command Bar:** Gõ câu hỏi bằng ngôn ngữ tự nhiên và hệ thống hiểu trọn vẹn ngữ cảnh.
3. **Fanpage Inbox Auto-Draft:** Khách nhắn tin -> Cột phải hiện Profile chi tiết -> Ở giữa hiện sẵn bản nháp trả lời cực mượt.
4. **Cơ chế Duyệt (Draft-only):** Cảm giác "An toàn tuyệt đối" khi CEO biết AI chỉ làm nháp, quyền bấm gửi vẫn thuộc về con người.
5. **Flow từ Inbox -> Lead -> Follow-up/Học thử:** Trải nghiệm một đường thẳng từ lúc phụ huynh chat, AI phân loại nhu cầu, tạo lead nóng, và gợi ý bước follow-up/học thử tiếp theo.

---

## 4. Xử Lý Từ Chối (Objections & Answers)

**Q: "Chị sợ AI tự động chat sai, phụ huynh mắng vốn thì sao?"**
> **A (Giải thích an toàn):** "EduOS được thiết kế với triết lý **Draft-First (Chỉ làm nháp)**. AI tuyệt đối **không tự động gửi** bất kỳ tin nhắn nhạy cảm nào như nhắc học phí/công nợ, báo cáo học tập cá nhân, hoặc tư vấn cần người duyệt. Nó chỉ soạn sẵn và để nhân viên/CEO duyệt. Quyền kiểm soát 100% thuộc về trung tâm chị."

**Q: "Nhân viên trung tâm chị mù công nghệ lắm, dùng được không?"**
> **A:** "EduOS thiết kế giống hệt Zalo và Facebook. Nhân viên không cần học cách dùng phần mềm, chỉ cần vào Inbox là làm việc được ngay. AI đã lo phần nghĩ, nhân viên chỉ việc thao tác."

**Q: "Dữ liệu trung tâm có bị rò rỉ ra ngoài qua ChatGPT không?"**
> **A:** "Dữ liệu được tách theo từng trung tâm/tenant. AI chỉ đọc dữ liệu trong phạm vi trung tâm được cấp quyền, và các thao tác nhạy cảm đều phải qua duyệt."

---

## 5. Các Góc Độ Bán Hàng & Định Giá (Pricing/Value Angles)
1. **Angle Tối ưu chi phí nhân sự:** EduOS giúp giảm tải đáng kể cho Quản lý CSKH và Sale Admin bằng cách tự tổng hợp việc cần làm, soạn nháp phản hồi, và nhắc follow-up. Gói phần mềm rẻ hơn lương 1 tháng của nhân sự nhưng hoạt động 24/7.
2. **Angle Tăng tỷ lệ chuyển đổi:** Các Lead không bao giờ bị nguội nhờ AI tự tạo task follow-up và tự phân loại độ nóng (Temperature). Tăng 10% tỷ lệ chốt là dư sức bù đắp chi phí EduOS.
3. **Angle Giải phóng Lãnh đạo:** CEO mua lại thời gian của chính mình. Giảm 2-3 tiếng mỗi ngày check cam, check file Excel, check Zalo cá nhân của nhân viên.

---

## 6. Hạn Chế Cần Lưu Ý (Known Limitations - Không Oversell)
- **Chưa có Facebook Graph Auto-Send:** Hiện tại AI chỉ tạo nháp (Copy trả lời), nhân viên vẫn phải gửi bằng tay hoặc qua tab Fanpage chuẩn. Đừng hứa hẹn việc hệ thống tự auto-reply 100% rảnh tay.
- **Trial Booking Creation:** Luồng tạo lịch học thử vẫn đang hoàn thiện và có một số giới hạn về mặt dữ liệu demo, tập trung nói về mặt quy trình (flow) thay vì click tạo mới quá nhiều trong buổi demo.
- **Zalo VPS Sync:** Việc đồng bộ tin nhắn Zalo cá nhân cần quét QR Code và phụ thuộc vào VPS, cần dặn trước khách hàng đây là giải pháp "kỹ thuật linh hoạt", không phải API chính thức của Zalo OA.
