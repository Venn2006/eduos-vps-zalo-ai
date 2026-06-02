# Phase 11 Workspaces & RBAC Handover

## A. What Phase 11 Implemented

*   **11.1 Workspaces launcher + simplified sidebar:** Created a unified `/workspaces` hub for role-specific access and streamlined the global sidebar to avoid overwhelming users.
*   **11.2 Deep-link RBAC hardening:** Enforced strict backend route guarding via the `canAccessRoute` helper to prevent direct URL navigation bypassing the UI.
*   **11.3 Sales Workspace:** Added `/workspaces/sales` dashboard tailored for telesales & consultants, focusing on Leads and Trial Bookings.
*   **11.4 Teacher/Academic Workspace:** Added `/workspaces/teacher` dashboard tailored for academic staff, focusing on Classes, Attendance, Homework, and Students.
*   **11.5 Finance Workspace:** Added `/workspaces/finance` dashboard tailored for accountants, focusing on Payments, Renewals, Invoices, and Debt Reminders.

## B. Final Route Map

*   `/dashboard`
*   `/ai-center`
*   `/workspaces`
*   `/workspaces/sales`
*   `/workspaces/teacher`
*   `/workspaces/finance`
*   `/leads`
*   `/trial-bookings`
*   `/classes`
*   `/attendance`
*   `/homework`
*   `/students`
*   `/payments`
*   `/renewals`
*   `/fanpage-inbox`
*   `/reports`
*   `/settings`

## C. Final RBAC Matrix

### Roles
*   **OWNER**
    *   Full access to all routes including `/settings` and all workspaces.
*   **ADMIN**
    *   Full access to all routes including `/settings` and all workspaces.
*   **SALE**
    *   **Allowed**: `/workspaces`, `/workspaces/sales`, `/leads`, `/trial-bookings`, `/ai-center`, `/fanpage-inbox`
    *   **Blocked**: `/dashboard`, `/workspaces/teacher`, `/workspaces/finance`, `/classes`, `/attendance`, `/homework`, `/students`, `/payments`, `/renewals`, `/reports`, `/settings`
*   **TEACHER**
    *   **Allowed**: `/workspaces`, `/workspaces/teacher`, `/classes`, `/attendance`, `/homework`, `/students`, `/ai-center`
    *   **Blocked**: `/dashboard`, `/workspaces/sales`, `/workspaces/finance`, `/leads`, `/trial-bookings`, `/payments`, `/renewals`, `/fanpage-inbox`, `/reports`, `/settings`
*   **ACCOUNTANT**
    *   **Allowed**: `/workspaces`, `/workspaces/finance`, `/payments`, `/renewals`, `/ai-center`
    *   **Blocked**: `/dashboard`, `/workspaces/sales`, `/workspaces/teacher`, `/leads`, `/trial-bookings`, `/classes`, `/attendance`, `/homework`, `/students`, `/fanpage-inbox`, `/reports`, `/settings`
*   **UNKNOWN/anonymous**
    *   **Blocked**: All protected routes.

## D. Workspace Behavior

### Sales Workspace (`/workspaces/sales`)
*   **Allowed roles**: OWNER, ADMIN, SALE
*   **Blocked roles**: TEACHER, ACCOUNTANT, UNKNOWN
*   **Data sources used**: `Lead`, `TrialBooking`
*   **Tenant-scope rule**: Strict `where: { tenantId }`
*   **Metrics shown**: Lead mới hôm nay, Lead nóng, Lead chưa gọi, Lịch hẹn học thử hôm nay, Học thử cần follow-up, Đã chốt/WON, urgent lead/trial action cards.
*   **Metrics marked “Chưa đủ dữ liệu”**: Tỷ lệ chuyển đổi, Tin Fanpage chờ trả lời, Hiệu suất theo tư vấn viên.
*   **CTAs**: Xem Leads, Xem Lịch hẹn, Hỏi AI.
*   **AI prompt behavior**: Visual-only pills; dedicated "Hỏi AI" CTA links to `/ai-center`.

### Teacher/Academic Workspace (`/workspaces/teacher`)
*   **Allowed roles**: OWNER, ADMIN, TEACHER
*   **Blocked roles**: SALE, ACCOUNTANT, UNKNOWN
*   **Data sources used**: `ClassSession`, attendance relation/status, `HomeworkSubmission`
*   **Tenant-scope rule**: Strict `where: { tenantId }`
*   **Metrics shown**: Lớp hôm nay, Lớp chưa điểm danh, Bài tập chưa chấm, Bài nộp mới.
*   **Metrics marked “Chưa đủ dữ liệu”**: Học viên vắng gần đây, Báo cáo phụ huynh chờ duyệt, Bài nộp chờ AI duyệt, Học viên vắng nhiều.
*   **CTAs**: Điểm danh, Xem Bài tập, Hỏi AI.
*   **AI prompt behavior**: Visual-only pills; dedicated "Hỏi AI" CTA links to `/ai-center`.

### Finance Workspace (`/workspaces/finance`)
*   **Allowed roles**: OWNER, ADMIN, ACCOUNTANT
*   **Blocked roles**: SALE, TEACHER, UNKNOWN
*   **Data sources used**: `Payment`, `Invoice`, `RenewalCandidate`, `DebtReminder`
*   **Tenant-scope rule**: Strict `where: { tenantId }`
*   **Metrics shown**: Doanh thu hôm nay, Đã thu tháng này, Hóa đơn chưa thanh toán, Công nợ quá hạn, Sắp tái phí, Tin nhắc phí chờ duyệt.
*   **Metrics marked “Chưa đủ dữ liệu”**: Học viên cần tư vấn tái phí, Hóa đơn cần kiểm tra.
*   **CTAs**: Xem Học phí, Xem Tái phí, Hỏi AI về tài chính.
*   **AI prompt behavior**: Visual-only pills; dedicated "Hỏi AI" CTA links to `/ai-center`.

## E. Safety Rules Preserved

*   **No schema changes**: Verified.
*   **No db push**: Verified.
*   **No external dependencies**: Verified.
*   **No auto-send**: Verified.
*   **No Zalo/Facebook sends**: Verified.
*   **No payment reminder sends**: Verified.
*   **AI prompt pills visual-only**: Verified on all workspaces and hub.
*   **Blocked users hit ForbiddenRoleMessage before tenant lookup/Prisma query**: Enforced structurally in `page.tsx`.

## F. Demo QA Checklist

### Step-by-Step Manual Browser Test

**1. OWNER/ADMIN**
*   Log in as OWNER/ADMIN.
*   Navigate to `/workspaces`. All 3 cards (Sales, Teacher, Finance) are clickable.
*   Navigate to `/workspaces/sales`, `/workspaces/teacher`, `/workspaces/finance`. Ensure all pages load cleanly.
*   Verify sidebar shows: Tổng quan CEO, Danh mục công việc, Tin nhắn, Trung tâm AI, Báo cáo, Cài đặt.
*   (Operational routes like `/leads` or `/classes` are accessed via workspace cards and CTAs, not as top-level sidebar items).

**2. SALE**
*   Log in as SALE.
*   Navigate to `/workspaces`. Sales card is clickable. Teacher and Finance cards are disabled.
*   Click Sales card -> successfully routes to `/workspaces/sales`.
*   Directly visit `/workspaces/finance` -> "Truy cập bị từ chối" (ForbiddenRoleMessage).
*   Directly visit `/settings` -> "Truy cập bị từ chối".
*   Verify sidebar only shows: Danh mục công việc, Tin nhắn, Trung tâm AI.

**3. TEACHER**
*   Log in as TEACHER.
*   Navigate to `/workspaces`. Teacher card is clickable. Sales and Finance cards are disabled.
*   Click Teacher card -> successfully routes to `/workspaces/teacher`.
*   Directly visit `/workspaces/sales` -> "Truy cập bị từ chối" (ForbiddenRoleMessage).
*   Directly visit `/settings` -> "Truy cập bị từ chối".
*   Verify sidebar only shows: Danh mục công việc, Trung tâm AI.

**4. ACCOUNTANT**
*   Log in as ACCOUNTANT.
*   Navigate to `/workspaces`. Finance card is clickable. Sales and Teacher cards are disabled.
*   Click Finance card -> successfully routes to `/workspaces/finance`.
*   Directly visit `/workspaces/sales` -> "Truy cập bị từ chối" (ForbiddenRoleMessage).
*   Directly visit `/settings` -> "Truy cập bị từ chối".
*   Verify sidebar only shows: Danh mục công việc, Trung tâm AI.

## G. Known Limitations

*   **Prompt pills are not wired to AI Center yet**: Currently static visual indicators.
*   **Consultant performance lacks clean relation**: Sale metric for "Hiệu suất chốt sale" is hardcoded to "Chưa đủ dữ liệu".
*   **Some advanced metrics show “Chưa đủ dữ liệu”**: Used safely where Prisma data was too complex or models didn't exist yet.
*   **API routes need future RBAC audit**: If any API endpoints expose sensitive data to unauthorized roles, they need the same RBAC gating.
*   **No live LLM yet**: AI Center currently uses deterministic/mock provider behavior and draft-only workflows. Future live LLM integration must preserve approval guards, tenant scope, evidence, and no auto-send.
*   **No production Zalo send yet**: Zalo integration is staged but not fully sending live in production.
*   **No Facebook Graph send yet**: Fanpage inbox is staged but not fully sending live in production.

## H. Recommended Next Phases

*   **Phase 12**: AI prompt prefill wiring, no auto-run.
*   **Phase 13**: Sales calling / telesale 100 calls/day.
*   **Phase 14**: Teacher copilot / homework review queue.
*   **Phase 15**: Zalo VPS production hardening.
*   **Phase 16**: Fanpage production hardening.
*   **Phase 17**: Live LLM integration with approval guard.
