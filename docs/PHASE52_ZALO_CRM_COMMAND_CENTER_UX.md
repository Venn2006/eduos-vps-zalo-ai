# Phase 52: Zalo CRM Command Center & Product Model Pivot

## Goal
Shift the product model from an "Approval-heavy AI system" to a "Practical Zalo/Fanpage CRM with optional AI add-ons".

## Key Changes

1. **New Automation Policy (`automationModePolicy.ts`)**
   - We introduced a structured `AutomationMode` instead of a binary "AI / Human" switch.
   - Modes include: `AUTO_LOW_RISK`, `AUTO_WITH_DASHBOARD_REPORT`, `STAFF_HANDOFF`, `TEACHER_APPROVAL_REQUIRED`, `ADMIN_APPROVAL_REQUIRED`, `DRAFT_ONLY`, `OFF`.
   - This allows low-risk tasks (like Lead FAQ) to be fully automated, while high-risk tasks (like Complaints) are strictly routed to `STAFF_HANDOFF`.

2. **CRM Command Center (`/crm-command-center`)**
   - Created a new owner-facing dashboard to monitor Zalo/Fanpage connections.
   - Displays real-time metrics for messages, leads, and staff performance.
   - Allows Giám đốc to oversee 10+ Zalo employee accounts and Zalo class groups in one place.

3. **Inbox Workflow Enhancements (`/fanpage-inbox`, `/zalo-inbox`)**
   - Added specific workflow buttons for the AI Draft area: "Sao chép vào ô trả lời", "Đưa vào duyệt", "Bật AI tự trả lời", "Giao cho tư vấn".
   - Integrated new visual badges that indicate the risk level and automation mode of the AI suggestion (e.g., "Tự động (Rủi ro thấp)").

4. **Copy & UX Hardening**
   - **`/approval-queue`**: Updated copy to reflect that not *everything* needs approval, only sensitive items.
   - **`/ai-center`**: Replaced generic AI text with the "Lớp áo AI trên nền tảng Zalo CRM" concept.
   - **`/homework`**: Clarified the AI grading workflow (AI Draft -> Teacher Review -> Sandbox/Zalo).
   - **`/ai-addons`**: Changed "Kho AI Tự Động Hóa" to "Kho Tính Năng AI Mở Rộng" and updated the pricing labels to reflect the new Staff Handoff modes.
   - **`/workspaces`**: Upgraded the grid to a premium, colorful, card-based layout with hover effects.
   - **`/workspaces/finance`**: Improved typography and added realistic visual filter pills (Hôm nay, Tuần này, Tháng này).

## Status
All manual changes have been completed. The product now feels like a highly capable CRM with a powerful AI engine, rather than an AI experiment that requires too much manual babysitting.
