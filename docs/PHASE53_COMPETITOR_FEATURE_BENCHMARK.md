# Phase 53: Competitor Feature Benchmark

**Context:** This document outlines a public feature benchmark and roadmap for transforming EduOS from an AI chat tool into a fully-fledged AI Operating System for language centers. 
**Current EduOS Baseline (After Phase 52):** Base SaaS positioning, CRM Command Center, Role-based Workspaces, Embedded AI Add-ons catalog.

## Benchmark Methodology & Safety Rules
* **No-Copy Policy:** All insights are derived strictly from public landing pages, pricing pages, and promotional videos. No private accounts, scraping, or code copying were used.
* **Objective:** Identify UX patterns, operational workflows, and product gaps relevant to the Vietnamese language center market.

## Competitor Benchmark Table

| Competitor / Inspiration | Publicly Observed Feature | Why it matters for VN Centers | EduOS Status | Gap Level | Priority | Target Phase | No-copy Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Easy Edu / Bizfly** | Zalo/Fanpage CRM & Lead Kanban | Giúp Sale theo dõi quá trình chuyển đổi (Lead -> Khách hàng). | CRM Command Center exists but lacks Kanban view. | Partial | P0 | Phase 54 | Lấy cảm hứng từ quy trình Sale chuẩn, không sao chép UI. |
| **Getfly CRM / MISA** | Round-robin Lead Assignment & Cold Lead Alerts | Đảm bảo không bỏ sót khách hàng, phân chia công bằng cho Sale. | Missing. | Missing | P0 | Phase 54 | Dựa trên logic phân tích dữ liệu, tự phát triển quy tắc phân chia. |
| **ZenPlanner / Edu Space** | Grid Calendar / Class Scheduling & Conflict Detection | Lịch học chồng chéo là "nỗi đau" lớn nhất của Học vụ. | Missing visual grid & conflict logic. | Missing | P1 | Phase 56 | Tự xây dựng thuật toán kiểm tra trùng lặp thời gian/phòng. |
| **Jackrabbit / Myngle** | Sliding Drawer Detail UX | Xem thông tin học viên nhanh không cần reload trang. | Some modals exist, needs consistent drawer UX. | Partial | P0 | Phase 55 | Áp dụng UI pattern phổ biến (Drawer) thay vì sao chép. |
| **VnResource / Faceworks** | Tuition & Remaining Sessions Tracking | Tài chính minh bạch, tránh thất thoát doanh thu. | Finance page is placeholder. | Missing | P0 | Phase 57 | Phát triển cấu trúc dữ liệu theo nghiệp vụ kế toán chuẩn. |
| **MISA EMIS / VietQR** | Auto-reconciliation (Payment/VietQR/Open Banking concept) | Giảm thiểu sai sót khi gạch nợ thủ công. | Missing. | Missing | P2 | Future | Định hướng khái niệm (Concept), chưa tích hợp API thật. |
| **ClassIn / EduGo** | Curriculum / Quiz Generation | Giảm gánh nặng soạn giáo án cho giáo viên. | Missing AI generation from PDF. | Missing | P1 | Phase 58 | Sử dụng AI nhúng tự phát triển, không lấy dữ liệu nền tảng khác. |
| **General Best Practice** | Role-based Workspaces | Mỗi vai trò (CEO, Sale, Teacher) cần một giao diện làm việc riêng tối ưu. | Exists but needs UX polish. | Partial | P0 | Phase 54 | Xây dựng theo RBAC nội bộ của EduOS. |
| **General CRM SaaS** | Follow-up Tasks & Student/Parent Timeline | Lưu vết toàn bộ tương tác để chăm sóc khách hàng tốt hơn. | Basic chat history exists, missing CRM timeline. | Partial | P0 | Phase 55 | Thiết kế Timeline UX độc lập. |

## Key Benchmark Insights
* Thị trường hiện tại chia làm 2 cực: Một bên mạnh về Kế toán/Vận hành (MISA, VnResource) nhưng giao diện phức tạp; Một bên mạnh về Sale/Marketing (Easy Edu, Bizfly) nhưng ít ứng dụng AI sâu vào học vụ.
* Cơ hội lớn của EduOS: Kết hợp giữa **Giao diện hiện đại, tối giản** và **AI được nhúng sâu (Embedded AI)** để xử lý tự động cả khâu Sale lẫn Học vụ.

## What EduOS Should Not Copy
* Không sao chép các giao diện quản lý dữ liệu (Tables) khô khan, nhiều cột và phức tạp.
* Không sao chép cấu trúc phần mềm tĩnh, thiếu tính năng gợi ý hành động.
* Tuyệt đối không sao chép quy trình đăng nhập, API hay bất kỳ dòng code nào từ nền tảng khác.

## What EduOS Should Adapt Safely
* Mượn ý tưởng về cấu trúc Phễu (Kanban) cho đội ngũ Tư vấn.
* Mượn ý tưởng về Lưới thời khóa biểu (Grid Calendar) cho bộ phận Học vụ.
* Áp dụng tư duy cảnh báo (Alerts) chủ động cho các trường hợp "Khách hàng lạnh" hoặc "Học viên sắp nghỉ học".
