# Phase 54: CRM Command Center + Lead Kanban Polish

## Context & Goal
Phase 54 transforms the initial CRM Command Center (from Phase 52) into a visual, actionable Kanban-style board. The primary goal is to make the CRM workflows tangible and demo-ready for language center owners (aged 35-55), shifting the focus from abstract "AI settings" to concrete business value: "Who needs to be contacted today?", "Who is ignoring our messages?", and "What has the AI already handled?"

## What Was Improved
1. **Top Summary Refactor**: Replaced generic metrics with 8 business-focused cards (Lead mới hôm nay, Lead quá hạn phản hồi, Lịch học thử hôm nay, Phàn nàn cần xử lý, Tin nhắn cần handoff, Tỷ lệ phản hồi, AI tự động xử lý, Cần follow-up hôm nay).
2. **Tabbed Interface**: Introduced a toggle between the "Tổng quan đa kênh" (Channels & Staff overview) and the new "Kanban & Tasks" view.
3. **Lead Kanban Pipeline**: Added a horizontal scrollable Kanban board with columns: Lead Mới, Đã Liên Hệ, Đã Hẹn Thử, Đã Học Thử, Đã Chốt, Mất Lead.
4. **Follow-up Task Center**: Integrated a task list showing SLA, Owner, and AI Automation Mode context (`AUTO_WITH_DASHBOARD_REPORT`, `STAFF_HANDOFF`, etc.).
5. **Timeline Preview Drawer**: Clicking on a Lead in the Kanban opens a sliding drawer detailing the interaction history (AI suggestions, staff replies, booking events) with masked phone numbers (`[SĐT đã ẩn]`).
6. **AI Safety Banner**: Added a clear notification that the system is running in Sandbox mode, and no real messages are being sent to external APIs.

## Routes Changed
* `/crm-command-center`: Entire page refactored into a Server Component fetching mock data and a Client Component (`CrmCommandCenterClient`) handling the Tabs, Kanban, and Drawer state.
* AppLayout Sidebar: Renamed "Command Center" to "CRM & Zalo/Fanpage".

## Demo Storyline
1. **The Owner's Morning**: The center owner opens the CRM & Zalo/Fanpage page and immediately sees the 8 top metrics. They notice 2 complaints and 4 overdue leads.
2. **Reviewing Pipeline**: Switching to the Kanban tab, they see the flow of leads. They can spot which leads are "NÓNG" (Hot) and which are "QUÁ HẠN" (Overdue).
3. **Deep Dive**: They click on an Overdue lead. The Timeline Drawer slides out, showing that AI suggested a reply 2 days ago, but the assigned staff hasn't followed up yet.
4. **Task Assignment**: The Owner checks the Follow-up tasks column to see what the team needs to execute today.

## Safety Boundaries & Mock Implementations
* **No Real Send**: All actions in the Timeline Drawer (Soạn tin nhắn, Tạo Task) are explicitly marked as `(Demo)`.
* **Data Privacy**: All phone numbers in the mock data are masked as `[SĐT đã ẩn]`.
* **Mock Logic**: The cold/hot lead risk calculation is entirely deterministic and relies on mock data located in `apps/web/src/lib/crmDemoData.ts`. No database changes were made.
* **No External APIs**: No live Facebook or Zalo endpoints are called.

## Manual Test Checklist
- [ ] Navigate to `/crm-command-center` and verify the label in the sidebar says "CRM & Zalo/Fanpage".
- [ ] Ensure the top 8 summary cards render correctly.
- [ ] Click the "Lead Kanban & Tasks" tab.
- [ ] Verify the Follow-up tasks list renders with SLA status (MỚI, QUÁ HẠN, etc.).
- [ ] Verify the Kanban columns render with mock leads.
- [ ] Click on "Phụ huynh bé Na" or another lead to open the Timeline Drawer.
- [ ] Verify the Timeline Drawer displays the history, risk badges, and masked phone numbers.
- [ ] Verify the Sandbox AI warning banner is visible at the top.

## Future Work (Phase 55)
* Phase 55 will focus on **Timeline & Scheduling Polish**, replacing the current mock bookings with a visual calendar/timeline for trial classes and teacher assignments.
