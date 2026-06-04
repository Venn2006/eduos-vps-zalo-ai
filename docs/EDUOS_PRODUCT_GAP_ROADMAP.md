# Phase 53: EduOS Product Gap Roadmap

**Context:** This document outlines the roadmap to bridge the gap between EduOS's current capabilities and the vision of a complete AI Operating System for language centers.
**Product Thesis:** "EduOS should become an AI Operating System for language centers, not only a management database or AI chat tool."

## Current EduOS Strengths (After Phase 52)
* Base SaaS positioning.
* CRM Command Center.
* AI Add-on catalog.
* Approval queue.
* Mock outbox / sandbox.
* Safety architecture.
* Finance placeholder / workspace.
* Homework AI draft workflow.

## Current Gaps
* CEO dashboard still needs stronger business health metrics.
* CRM needs clearer lead pipeline / Kanban.
* Follow-up task workflow needs to become central.
* Student/parent timeline needs to be richer.
* Teacher/học vụ workflow needs better schedule/attendance/reporting UX.
* Finance needs debt/session/payment clarity.
* AI needs to feel embedded in workflows instead of isolated in AI pages.
* Data pipeline needs a clear safe architecture before real connectors.

## Roadmap Sections

### 1. Before Next Demo (P0)
Must prioritize:
* CEO Health Dashboard polish.
* CRM Command Center polish.
* Lead Kanban pipeline: New Lead → Contacted → Trial Booked → Trial Done → Won/Lost.
* Follow-up task center.
* Cold lead alert.
* Student/parent timeline drawer.
* Tuition remaining sessions / debt alert.
* Better demo copy explaining AI automation modes.

### 2. Before First Paid Pilot (P1)
Must prioritize:
* Schedule conflict detection.
* Attendance speed-up.
* Homework/quiz generator from uploaded PDF.
* Parent report workflow.
* Churn risk alert.
* Sale performance dashboard.
* Finance reporting hardening.
* Teacher workspace UX.

### 3. After First Paid Pilot (P2)
Must include:
* VietQR/Open Banking auto-reconciliation concept.
* Automated placement test for Writing/Speaking.
* Payroll agent.
* Parent/student/teacher portals.
* Advanced AI sales intelligence.
* Controlled real connector plan.

### 4. Defer / Do Not Build Yet
* Real send.
* Production connector worker.
* Private scraping.
* Anti-rate-limit bypass.
* Auto-posting to social channels.
* Fully automated payment reconciliation.
* Fully automated placement test scoring without human review.
* Fully automated salary/payroll without admin approval.

## Pilot Readiness Checklist
- [ ] Safe Data Pipeline architecture defined.
- [ ] P0 and P1 features implemented and tested.
- [ ] All AI automations respect the defined `AutomationModePolicy`.
- [ ] Sandbox mode thoroughly verified.

## Demo Storyline
1. Thể hiện EduOS là phần mềm quản trị toàn diện (Overview Dashboard).
2. Xử lý kịch bản chăm sóc khách hàng trên CRM Command Center (AI phân loại & gợi ý).
3. Thao tác vận hành học vụ trơn tru (Xếp lịch, điểm danh, báo cáo).
4. Phô diễn các "Vũ khí AI" (AI Add-ons) được nhúng sâu vào từng bước (Tạo đề thi, Nhắc nợ, Báo cáo rủi ro).

## Risks and Safety Constraints
* Tuyệt đối không can thiệp vào tài khoản cá nhân của khách hàng.
* Chế độ Sandbox luôn được bật cho tất cả các bản Demo trước khi Pilot.

## Recommended Next Phases
### Phase 54: CRM Command Center + Lead Kanban Polish (✅ DONE)
- **Status:** Hoàn thành (Mock Data/Frontend only).
- **Goal:** Turn the Zalo CRM concept into a visual Kanban board to show founders how leads move through stages.
- **Key Features:**
  - Lead Kanban (Lead Mới -> Đã Liên Hệ -> Học Thử -> Chốt).
  - SLA Alerts (Cảnh báo chìa khóa: "Lead quá hạn phản hồi").
  - Timeline Drawer (Lịch sử tương tác AI/Nhân viên).
- [x] **Phase 55**: Student/Parent Timeline + Follow-up Task Center Hardening
- [x] **Phase 56**: Teacher/Học vụ Workspace + Scheduling Conflict Detection
- [ ] **Phase 57**: Finance Real Reporting Hardening
* Phase 58 — Embedded AI Homework/Curriculum Generator
* Phase 59 — Safe Data Pipeline / Connector Architecture Plan
* Phase 60 — Controlled Real Connector Readiness Plan, only if there is a paying pilot and explicit approval.
