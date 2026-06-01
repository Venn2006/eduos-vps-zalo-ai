# Competitor UX Audit: Legacy Center Management Systems (PSE ONE)

*Note: This audit is strictly a conceptual analysis based on sanitized UX/IA extractions. No private data, PII, credentials, raw HTML, or third-party assets are included.*

## 1. Navigation & Menu Patterns Found
The legacy system relies on a dense, top-level navigation structure with operational menus visible to all users by default:
- Dữ liệu cá nhân (Personal Data)
- Tuyển sinh (Admissions)
- Học thử (Trial Classes)
- Kiểm tra đầu vào (Placement Tests)
- Học viên (Students)
- Điểm danh (Attendance)
- Báo cáo (Reports)

## 2. Page & Workspace Structure
The default landing page is an operational "Sổ liên lạc" (Communication Book) rather than a strategic dashboard. 
- **Action-Heavy:** Users are immediately presented with granular academic actions such as "Tạo đề thi" (Create Test), "Viết sổ cả lớp" (Class Log), "Nhập điểm cả lớp" (Enter Grades), "Gửi thông báo" (Send Notice), and "Đơn nghỉ học" (Leave Request).
- **Filter-Heavy:** The interface requires users to manually filter states: "Đang học" (Active), "Bảo lưu" (Reserved), "Nghỉ học" (Dropped), "Còn nhiều buổi" (Many sessions left), "Sắp hết buổi" (Expiring soon), "Cần gia hạn" (Needs renewal).

## 3. Common Language-Center Modules
The extraction reveals standard operational requirements for language centers:
- **Academic:** Class grading (Xuất sắc, Rất tốt, Kém...), Attendance, Testing.
- **Sales/CS:** Trial tracking, Follow-up calling ("Gọi điện", "Chưa gọi điện").
- **Admin:** Student states, Session counting ("Số buổi còn").

## 4. UX Pain Points in Legacy Systems
- **Too Many Menus:** A flat navigation structure overwhelms users who only need to do one specific job.
- **Dense Tables:** Viewing everything in list/spreadsheet format forces users to hunt for information.
- **Tiny Text & Unclear CTAs:** Actions are crammed together in button bars without visual hierarchy.
- **CEO Has No High-Level Command View:** Owners logging in see the exact same granular data as academic staff. They have to proactively search to find business health indicators.

## 5. What EduOS Should Learn Conceptually
- **Granular Statuses are Necessary:** Tracking exact student states ("Sắp hết buổi", "Bảo lưu") and call statuses is critical for center operations.
- **Contextual Actions:** Putting actions like "Nhập điểm" (Enter Grades) directly next to the class is a good pattern, but it should only be shown to Teachers.

## 6. What EduOS Must Avoid
- Do not build a single monolithic interface for all roles.
- Do not force the CEO to look at attendance tables just to understand center health.
- Avoid forcing the user to manually click filters to find out who needs a follow-up call.

## 7. Improvements for EduOS
- **CEO Dashboard:** Must be strictly action-first (Metrics + AI Drafts + Urgent Approvals). Zero dense tables.
- **`/workspaces` Module Launcher:** Group complex tools by role (Sales, Teacher, Finance) so the sidebar stays clean (Max 6-8 items).
- **Sales Workspace:** Auto-surface "Chưa gọi điện" (Uncalled) leads using cards, rather than a giant table.
- **Teacher/Academic Workspace:** Keep the contextual grading/attendance actions, but wrap them in a clean, modern card interface for each active class.
- **Finance Workspace:** Automatically surface "Cần gia hạn" (Needs renewal) accounts without requiring manual filtering.
- **Fanpage/Zalo Inbox:** Separate messaging from the core management system to avoid navigation clutter, unifying all external comms in one clean workspace.

## 8. Core UX Rule Reinforcement
The legacy UX proves our core thesis: users are currently forced to "learn" how to use the software by clicking through menus and applying manual filters. 

EduOS must adhere strictly to this rule:
> **“Người dùng không cần học phần mềm. Phần mềm phải tự chỉ cho họ việc cần làm.”**
*(Users don't need to learn the software. The software must automatically point out what they need to do.)*
