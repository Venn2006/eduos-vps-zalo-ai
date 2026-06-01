# EduOS Role-Based Workspaces & Module Launcher Plan

## 1. Audit Current Sidebar / Routes
Currently, the `AppSidebar.tsx` has **20 top-level items**, making the application feel cluttered and difficult to navigate.

## 2. Proposed Simplified Navigation (Sidebar)
We will reduce the sidebar to **max 6 top-level items** to drastically simplify navigation.

**New Top-Level Sidebar Items:**
1. **Tổng quan CEO** (`/dashboard`) - *Action-first command center*
2. **Trung tâm AI** (`/ai-center`) - *CEO Chat + AI Drafts approval*
3. **Danh mục công việc** (`/workspaces`) - *Module Launcher by Role*
4. **Tin nhắn** (`/inbox` or `/fanpage-inbox`)
5. **Báo cáo** (`/reports`)
6. **Cài đặt** (`/settings`)

> **Note - Strict Separation Policy:** 
> - `/dashboard` is for CEO decisions.
> - `/workspaces` is for finding work areas by role.
> - `/ai-center` is for asking AI and approving drafts.
> Do not merge these three into one cluttered page.

---

## 3. UX Principle: Simple for 35–55 Year Old Center Owners
EduOS must be designed for real Vietnamese language center owners and staff, many of whom are 35–55 years old and not highly technical.

**Product rules:**
- Use simple Vietnamese labels.
- Avoid excessive English technical terms in UI.
- Avoid tiny text and dense Excel-like tables.
- Avoid more than 6–8 top-level navigation items.
- Each page should answer: “What do I need to do next?”
- Every card should have a clear count, short explanation, and CTA.
- Prefer role-based workspaces over a long sidebar.
- Prefer AI suggested questions over forcing users to search reports.
- Keep CEO Dashboard action-first, not feature-heavy.
- Low-frequency tasks should be hidden inside workspaces/settings, not shown on the homepage.
- Use large readable cards, clear icons, and consistent color severity:
  - Green = ổn
  - Yellow = cần chú ý
  - Red = xử lý gấp
  - Blue/Purple = AI/draft/info
- No page should feel like a spreadsheet unless the user explicitly opens a detailed report.

**Core UX statement:**
“Người dùng không cần học phần mềm. Phần mềm phải tự chỉ cho họ việc cần làm.”

---

## 4. Workspaces & Module Launcher (`/workspaces`)
The `/workspaces` route acts as a Role-Based Module Launcher. Inside, features are grouped into cards by domain.

### 4.1. Ban giám đốc (CEO)
- **Roles allowed:** `OWNER`, `ADMIN`
- **Modules:** Tổng quan CEO (`/dashboard`), Trung tâm AI (`/ai-center`), Báo cáo tổng hợp (`/reports`).
- **AI Prompt Suggestion:** "Hôm nay có vấn đề gì nghiêm trọng không?"
- **Drill-down flow:** CEO -> Dashboard -> AI Drafts -> Approve/Reject

### 4.2. Tư vấn tuyển sinh (Sales)
- **Roles allowed:** `OWNER`, `ADMIN`, `SALE`
- **Modules:** Dashboard tuyển sinh, Leads (`/leads`), Học thử (`/trial-bookings`), Follow-up.
- **AI Prompt Suggestion:** "Có lead nào đang nóng chưa được chăm sóc không?"

### 4.3. Giáo viên (Teacher)
- **Roles allowed:** `OWNER`, `ADMIN`, `TEACHER`
- **Modules:** Lớp hôm nay (`/classes`), Điểm danh (`/attendance`), Bài tập (`/homework`), Nhận xét học viên.
- **AI Prompt Suggestion:** "Soạn giúp tôi nhận xét cho học viên điểm kém môn ngữ pháp."

### 4.4. Học vụ (Academic)
- **Roles allowed:** `OWNER`, `ADMIN`, `STAFF` (future role, not implemented yet)
- **Modules:** Lớp học (`/classes`), Học viên (`/students`), Lịch học, Lịch test, Rủi ro học viên.
- **AI Prompt Suggestion:** "Có học viên nào rủi ro nghỉ học cao không?"

### 4.5. Tài chính (Finance)
- **Roles allowed:** `OWNER`, `ADMIN`, `ACCOUNTANT`
- **Modules:** Học phí (`/payments`), Tái phí (`/renewals`), Công nợ, Nhắc phí chờ duyệt.
- **AI Prompt Suggestion:** "Tạo danh sách các học viên nợ học phí quá hạn 7 ngày."

### 4.6. Tin nhắn & AI Agents
- **Roles allowed:** `OWNER`, `ADMIN`, `SALE`, `STAFF` (future role, not implemented yet)
- **Modules:** Fanpage Inbox (`/fanpage-inbox`), Zalo Group (`/zalo-groups`), Zalo phụ huynh (`/zalo-inbox`), AI Drafts.

### 4.7. Hệ thống
- **Roles allowed:** `OWNER`, `ADMIN`
- **Modules:** Cài đặt Zalo (`/zalo-accounts`), Cài đặt Fanpage, Nhân sự, Phân quyền.

---

## 5. Third-Party Reference Policy
The previous analysis of the "PSE ONE" competitor system is strictly for high-level UX/business-process reference only. 
**EduOS must adhere to the following rules:**
- **No copying:** Do not copy UI, data, HTML, CSS, icons, or proprietary structure from third-party systems.
- **No credentials:** Do not store credentials or scraped private data in the repository, docs, logs, or codebase.
- **Original UX:** EduOS must implement its own original role-based UX, avoiding the cluttered "Excel-like" tables seen in legacy software.

---

## 6. Build Priority (Phase 11)
We will not build all workspaces at once. Implementation will proceed in this order:
1. **`/workspaces` module launcher only:** Build the empty shell with cards.
2. **Simplified sidebar:** Implement the 6 top-level items.
3. **Sales workspace dashboard:** Build out the Sales flow.
4. **Teacher/Academic workspace:** Consolidate class and student management.
5. **Finance workspace:** Build payment/renewal flows.
6. **Role-specific dashboards later:** Defer other specific dashboards to future phases.
