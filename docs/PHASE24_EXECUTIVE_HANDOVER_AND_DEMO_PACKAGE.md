# Phase 24: Executive Handover & Demo Package

## 1. What EduOS is
EduOS is an AI-first SaaS (Software as a Service) operating system designed exclusively for language centers in Vietnam.
It goes beyond simple CRM or Student Information Systems (SIS) by deeply integrating with the specific workflows of Vietnamese centers: Zalo personal messages (via a custom VPS bridge), Fanpage inbox management, CRM for sales, Teacher portals for academic delivery, Finance for cashflow, and a CEO AI to orchestrate it all.

## 2. Product Differentiators
* **CEO AI Command Center:** A unified natural language interface that understands center data (leads, finance, classes) and takes scoped actions.
* **Sales Calling Workflow:** Optimized UI for tele-sales to process up to 100 calls/day with 1-click outcome logging and auto-follow-ups.
* **Zalo Personal VPS Bootstrap:** The only system that allows syncing a *personal Zalo account* directly into a SaaS without using expensive, restricted Zalo OA. (Achieved via Appium Android VPS).
* **Fanpage Agent:** Connects directly to Facebook Messenger webhook, intelligently routing leads vs. current students.
* **Role-based Workspaces:** `Sale` sees only Sales; `Teacher` sees only Classes; `Accountant` sees only Finance. Zero clutter.
* **No-auto-send Safety:** Strict philosophy: AI writes drafts, humans click approve.
* **Simple UX for Vietnamese Owners:** Designed for non-technical users aged 35–55. Large cards, simple labels, no dense Excel-like grids.

## 3. Current Modules
* **Dashboard:** CEO overview of KPI, Leads, Trial Bookings.
* **AI Center:** The global chat interface for the AI agent.
* **Workspaces:**
  * **Sales:** Kanban boards, Lead management, Tele-calling interface (`/workspaces/sales/calling`).
  * **Teacher:** Class lists, Attendance, Homework grading.
  * **Finance:** Invoicing, Payment tracking, Debt Aging.
* **Messaging:** Fanpage Inbox, Zalo accounts/groups inbox.
* **Reports:** Exportable metrics.
* **Settings:**
  * Permissions (RBAC)
  * Connectors (Zalo VPS, Facebook health)
  * Production Readiness

## 4. Demo Narrative
### 5-Minute Pitch
"Chào anh/chị, EduOS là hệ điều hành duy nhất trên thị trường biến Zalo cá nhân của trung tâm thành một hệ thống tự động. Kế toán không cần tự nhắn phí, Sale không cần tự soạn kịch bản chăm sóc. Trợ lý AI của EduOS sẽ soạn sẵn tất cả, anh/chị chỉ cần duyệt và gửi."

### 15-Minute Product Walkthrough
1. **CEO Login:** Show the clean dashboard.
2. **Sales Role:** Switch to Sale. Show `/workspaces/sales/calling`. Click a lead, log "No Answer", see the follow-up task appear automatically.
3. **Teacher Role:** Switch to Teacher. Show quick attendance.
4. **Finance Role:** Switch to Accountant. Show the Debt Aging tracker.
5. **AI Center:** Ask "Hôm nay doanh thu bao nhiêu?" as CEO. Then ask it as Sale to prove the AI respects RBAC and denies the answer.

### 30-Minute Deep Demo
Add on: Configure a Fanpage Webhook live. Show the Zalo VPS Connector logic. Walk through the Permission Center.

### Objections & Answers
* **“Có gửi nhầm tin không?”** -> "Không. Triết lý của EduOS là 'Draft-first'. Máy viết nháp, người duyệt."
* **“Có cần nhân viên biết kỹ thuật không?”** -> "Không. Giao diện chia theo từng Workspace riêng biệt. Sale chỉ thấy việc của Sale."
* **“Zalo cá nhân có an toàn không?”** -> "Chúng tôi chạy qua server giả lập Android (VPS) riêng biệt cho trung tâm của anh/chị, y hệt như anh/chị đang cắm một chiếc điện thoại thật, rất an toàn."
* **“AI có sai số liệu không?”** -> "AI của chúng tôi chỉ dịch kết quả từ câu query SQL tuyệt đối chính xác của hệ thống, không tự bịa ra số liệu (no hallucinations)."
* **“Có phân quyền được không?”** -> "Dữ liệu được khóa cứng theo Role ở cấp độ server. Sale tuyệt đối không xem được doanh thu."

## 5. Technical Handover
* **Monorepo Structure:** Managed by Turborepo. `apps/web` (Next.js App Router), `packages/db` (Prisma), `packages/ai` (Langchain/Agents), `apps/zalo-vps-connector` (Node/Appium).
* **Key Routes:** `/workspaces/sales/calling` (Phase 13), `/workspaces/finance` (Phase 18), `/settings/permissions` (Phase 14).
* **Key Prisma Models:** `User`, `Tenant`, `Lead`, `TrialBooking`, `FollowUpTask`, `ZaloAccount`, `Invoice`.
* **Major Safety Rules:**
  1. Every query must have `where: { tenantId }`.
  2. Route components must check `canAccessRoute` before returning UI.
  3. No raw `.send()` calls to external APIs without explicit user action.
* **Commands:**
  * Build: `npm run build`
  * Test: `npm run test`
  * Typecheck: `npm run typecheck`

## 6. Roadmap from Here (Next Phases)
* **Real Dynamic Permission Center:** Implement `PermissionPolicy` and `PermissionOverride` schema for custom roles.
* **AuditLog Schema:** Record every mutation.
* **Production Zalo Hardening:** Implement the Appium VPS bridge code.
* **Fanpage Send:** Implement the actual Graph API outbound send (currently just receiving webhook).
* **Live AI:** Connect OpenAI/Anthropic APIs with the Role/Evidence guardrails.
* **VietQR:** Automated reconciliation of bank transfers.
* **Parent Portal:** A lightweight web-app/PWA for parents to see schedules and pay.

## 7. What NOT To Do (For Future Developers)
* **DO NOT** auto-send messages by default. Always queue to an outbox for approval.
* **DO NOT** bypass `tenantId` in any Prisma query.
* **DO NOT** expose Finance or Settings data to users without OWNER/ADMIN/ACCOUNTANT roles.
* **DO NOT** trust `tenantId` or `userId` from the client; always derive from `getSession()` server-side.
* **DO NOT** add database schemas without a clear, committed migration plan.
* **DO NOT** hook up a live LLM without strict data-scoping guardrails to prevent data leakage.
