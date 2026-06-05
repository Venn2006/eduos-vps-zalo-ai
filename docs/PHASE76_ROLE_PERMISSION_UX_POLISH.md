# Phase 76: Role & Permission UX Polish

## 1. Context
EduOS is currently running as a standalone demo environment meant for founders. During sales demonstrations, a critical question arises: "Who can see what? Is everyone going to see everything?". 
To address this fear effectively during demonstrations, the UI needs to clearly articulate that EduOS has a strict Role-Based Access Control (RBAC) model. Even though the demo environment runs locally as a CEO/Admin to showcase the entire product, the UX must be dotted with visual cues (badges, labels, restrictions) that explain how normal staff roles will experience the product.

## 2. Goal
Polish the EduOS UI and create explicit role documentation so that a founder demo can seamlessly explain:
- **CEO/Admin:** Sees everything, makes configuration changes, and approves major actions.
- **Manager:** Sees their team's workload, assigns tasks, and handles escalated threads.
- **Sales:** Only handles their own assigned CRM leads and hotline conversations.
- **Teacher:** Only handles academic reports and communications for their classes.
- **Finance:** Only handles tuition, debts, and payment follow-ups.
- **AI Constraints:** AI drafts/actions are always subject to human approval by the appropriate role.

## 3. Role Model (Demo Data)
We have formalized the following roles into a demo data structure (`rolePermissionDemoData.ts`):
1. **CEO/Admin:** Toàn quyền hệ thống, không tự nhắn tin CSKH thật, phê duyệt cấp cao.
2. **Quản lý (Manager):** Phân bổ công việc, duyệt tin nhắn nháp của nhân viên.
3. **Sale (Tư vấn viên):** Tạo nháp, tương tác với khách theo phân công. Không xem tài chính.
4. **Giáo viên:** Chăm sóc học viên trong lớp, tạo nháp báo cáo học tập.
5. **Kế toán:** Theo dõi hóa đơn, công nợ, gửi thông báo học phí.

## 4. Permission Matrix
A new **Permissions** tab has been added to the **Safety Center**. 
It visually displays the matrix of roles and explicitly shows:
- What each role can view.
- What each role has the authority to approve.
- Safety notes indicating that all roles (including Admin) are restricted from real message transmission and real connector interactions during the demo phase.

## 5. UI Changes
- **Safety Center:** Added the "Ma trận quyền truy cập (Role Matrix)" tab. Emphasized that Real Send and Live Connectors are OFF.
- **Team Inbox:** Added role badges ("Học vụ", "Sale", "Admin") to the staff accounts list. Added a tooltip explaining that we do not monitor personal accounts. Added specific warning labels if a thread needs reassignment due to permission boundaries.
- **Task Management:** Added role badges next to task owners. Added a "Cần ai duyệt?" (Who needs to approve?) badge in the task detail drawer based on the task type (e.g., Finance tasks require Accountant/Manager approval). Added visual emphasis on deadlines.
- **Dashboard:** Added a "Quyền & trách nhiệm hôm nay" (Today's Rights & Responsibilities) card in the CEO quick actions column, summarizing the daily approval and assignment workload expected of a CEO.

## 6. Demo Boundaries
All role implementations are strictly UI/UX visual overlays and mock data configurations to aid the sales narrative. There is no complex database RBAC logic executed in the background for this phase, as the demo operates in a single-tenant "God Mode".

## 7. Safety/Legal Framing
The system continues to heavily emphasize:
- **No live connections**: No actual APIs to Zalo, Meta, or Banks are called.
- **No data scraping**: Explicitly stating that staff personal Zalo accounts are not scraped or monitored.
- **No real sending**: Hardcoded demo safeguards preventing any message egress.

## 8. What is not implemented
- Actual backend Prisma schema models for `Role`, `Permission`, `Policy`.
- Real session token role resolution and API endpoint gating.
- Dynamic data filtering at the database query level based on the logged-in user's role.

## 9. Manual QA Checklist
- [x] Navigate to `/settings/safety-center`. Verify the "Permissions" tab is visible and the Role Matrix renders correctly.
- [x] Navigate to `/team-inbox`. Verify the staff list displays role badges (Học vụ, Sale, Admin). Verify the Reassign warning on specific threads.
- [x] Navigate to `/tasks`. Open a task drawer. Verify the "Cần ai duyệt?" section is visible.
- [x] Navigate to `/dashboard`. Verify the "Quyền & trách nhiệm hôm nay" card is visible on the right column.
- [x] Verify no console errors exist across these pages.

## 10. Next Recommended Phase
- **Phase 77 — Demo Seed Reset + Screenshot QA Pack**: Refresh demo data and generate high-quality screenshots for the sales pack.
