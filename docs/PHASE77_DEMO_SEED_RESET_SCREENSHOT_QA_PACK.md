# Phase 77: Demo Seed Reset & Screenshot QA Pack

## 1. Executive purpose
Demo consistency is vital to winning customer and investor trust. During demonstrations, any unpredicted state, lingering test data, or visual glitches can derail the core product narrative.
The demo seed/reset pack and QA documentation ensure:
- Founders can confidently demo EduOS to language centers in a predictable, stable environment.
- Screenshots for sales decks, landing pages, and pitch decks accurately represent the product's best state.
- Internal QA and investor walkthroughs encounter zero technical friction.

## 2. Demo environment checklist
Before any external demo, confirm the following:
- [x] **Confirm current master commit**: Ensure the environment is running the latest stable master.
- [x] **Confirm `.env` not committed**: Ensure local secrets remain secure.
- [x] **Confirm Supabase dev/test DB only**: Do not connect to any production database.
- [x] **Rotate Supabase dev/test password if exposed**: If the previous test password was logged anywhere, rotate it immediately in the Supabase dashboard and update `.env`.
- [x] **Confirm app builds**: Run `npm run build` locally.
- [x] **Confirm tests pass**: Ensure 195/195 tests pass across `@eduos/shared` and `@eduos/api`.
- [x] **Confirm no real data**: The app must use deterministic mock data exclusively.
- [x] **Confirm no real send**: Verify that the sandbox outbox intercepts all outbound messages.
- [x] **Confirm no live connectors**: Ensure Facebook/Zalo connectors are structurally disabled or heavily mocked.
- [x] **Confirm demo login works**: Ensure deterministic mock auth bypass functions properly.
- [x] **Confirm mobile viewport works**: Ensure responsive views don't break key navigation or tables.

## 3. Canonical demo route order
During a live walkthrough, navigate the platform in this specific order to construct a logical product story:

1. **`/dashboard`**
   - **Purpose**: Show the "God View" of the language center.
   - **What to show**: Revenue, leads, overdue tasks, and the CEO quick actions.
   - **Expected visual elements**: KPI cards, Team workload, AI priority insights.
   - **Key screenshot**: Top-fold showing KPI cards and the "Today's Command Feed".
   - **Talking point**: "EduOS gives the center owner complete visibility over business health, sales, and academics instantly."
   - **Risk/safety note**: Point out the "Demo Mode" badge so they know this is a safe environment.

2. **`/team-inbox`**
   - **Purpose**: Demonstrate centralized, governed communication.
   - **What to show**: The 3-pane layout, AI intent classification, and role permission badges.
   - **Expected visual elements**: Inbox list, chat thread, contextual right sidebar (CRM/Tags).
   - **Key screenshot**: Full 3-pane view with a "Needs Reassignment" warning visible.
   - **Talking point**: "No more personal Zalo monitoring. All communication is routed to specific roles with clear access boundaries."

3. **`/tasks`**
   - **Purpose**: Show accountability and task delegation.
   - **What to show**: Kanban board mapping workflows across Sales, Academic, and Finance.
   - **Expected visual elements**: Kanban columns, filters, and the task detail drawer.
   - **Key screenshot**: Kanban board with the task drawer open showing the "Cần ai duyệt?" (Who needs to approve?) badge.
   - **Talking point**: "Every message that requires action becomes a tracked task with a clear owner and approver."

4. **`/crm-command-center`**
   - **Purpose**: Showcase the sales pipeline and CRM capabilities.
   - **What to show**: Lead progression from New to Won/Lost.
   - **Expected visual elements**: Lead Kanban, SLA alerts, timeline view.
   - **Key screenshot**: The Lead Kanban board highlighting a red "Overdue" SLA warning.
   - **Talking point**: "Leads never fall through the cracks. The system automatically escalates ignored prospects."

5. **`/workspaces/teacher`**
   - **Purpose**: Highlight the academic staff workflow.
   - **What to show**: Schedule, attendance, and parent reporting workflows.
   - **Expected visual elements**: Class lists, conflict detection warnings.
   - **Key screenshot**: The schedule view showing an AI-flagged scheduling conflict.
   - **Talking point**: "Teachers get a dedicated workspace that strips away noise and focuses purely on their classes and students."

6. **`/homework`**
   - **Purpose**: Reveal the embedded AI capabilities.
   - **What to show**: Curriculum generation and automated homework drafting.
   - **Expected visual elements**: PDF upload simulation, generated quiz UI.
   - **Key screenshot**: The AI Curriculum Generator modal with a drafted quiz.
   - **Talking point**: "EduOS uses AI natively within the workflow to save teachers hours of preparation time."

7. **`/workspaces/finance`**
   - **Purpose**: Demonstrate revenue tracking and debt collection.
   - **What to show**: Tuition remaining, outstanding debts, and payment follow-ups.
   - **Expected visual elements**: Finance KPIs, debt tracking table.
   - **Key screenshot**: The Finance Dashboard with the Tuition Reminder Draft preview open.
   - **Talking point**: "Finance gets clear visibility into who owes what, with AI helping to draft polite, contextual payment reminders."

8. **`/settings/safety-center`**
   - **Purpose**: Reassure the customer regarding data privacy and system limits.
   - **What to show**: Role Permission Matrix, Mock Outbox, and Sandbox settings.
   - **Expected visual elements**: The Permissions tab, the Sandbox Toggle.
   - **Key screenshot**: The Role Permission Matrix.
   - **Talking point**: "We've built EduOS with enterprise-grade safeguards. Nothing is sent without your explicit approval, and roles are strictly enforced."

## 4. Screenshot checklist
| Screenshot ID | Route | Viewport | Target Component | Must Be Visible | Must Not Be Visible | Filename Suggestion |
|---|---|---|---|---|---|---|
| 01 | `/dashboard` | Desktop (1440px) | Full Screen | KPI Cards, AI Insights, CEO Responsibilities | Real names/numbers | `eduos-01-dashboard-desktop.png` |
| 02 | `/team-inbox` | Desktop (1440px) | Full Screen | 3-pane layout, Role Badges, Inbox Filters | Unmasked phones | `eduos-02-team-inbox-desktop.png` |
| 03 | `/team-inbox` | Mobile (390px) | Full Screen | Stacked inbox view, Navigation bar | Broken layouts | `eduos-03-team-inbox-mobile.png` |
| 04 | `/tasks` | Desktop (1440px) | Full Screen | Kanban Board, Staff Workload Panel | Horizontal overflow | `eduos-04-tasks-kanban-desktop.png` |
| 05 | `/tasks` | Desktop (1440px) | Task Drawer | "Cần ai duyệt?" badge, Deadline styling | Overlapping text | `eduos-05-tasks-drawer-desktop.png` |
| 06 | `/crm-command-center` | Desktop (1440px) | Full Screen | Lead Kanban, SLA Alerts | Empty states | `eduos-06-crm-pipeline-desktop.png` |
| 07 | `/workspaces/teacher` | Desktop (1440px) | Full Screen | Schedule, Conflict Alerts | Unstyled tables | `eduos-07-teacher-workspace-desktop.png` |
| 08 | `/homework` | Desktop (1440px) | Generator Modal | AI draft content, Approve button | Loading spinners | `eduos-08-homework-ai-desktop.png` |
| 09 | `/workspaces/finance` | Desktop (1440px) | Full Screen | Debt table, Tuition Reminder | Negative/invalid currencies | `eduos-09-finance-desktop.png` |
| 10 | `/settings/safety-center` | Desktop (1440px) | Permissions Tab | Role Matrix | Real API keys | `eduos-10-safety-matrix-desktop.png` |

## 5. Demo data consistency checklist
The demo relies on static files exporting deterministic arrays/objects. These must remain stable.

- **`ceoCommandDemoData.ts`**: Expected module: Dashboard. Must remain stable. Fake data required. Masked phones required.
- **`taskManagementDemoData.ts`**: Expected module: Tasks. Must remain stable. Fake data required. Masked phones required.
- **`teamInboxDemoData.ts`**: Expected module: Team Inbox. Must remain stable. Fake data required. Masked phones required.
- **`rolePermissionDemoData.ts`**: Expected module: Safety Center. Must remain stable.
- **Finance demo data**: Expected module: Finance Workspace. Must remain stable.
- **CRM demo data**: Expected module: CRM Command Center. Must remain stable.
- **Homework/curriculum demo data**: Expected module: Homework. Must remain stable.
- **Academic/teacher demo data**: Expected module: Teacher Workspace. Must remain stable.
- **Safety center demo data**: Expected module: Safety Center. Must remain stable.

**CRITICAL RULE**: Under no circumstances should real customer names, unmasked phone numbers, or actual center financial data be injected into these mock files.

## 6. Demo reset procedure
Because the current demo is entirely driven by mock data modules on the frontend:
- **No DB reset is needed**: The frontend relies on the static TypeScript files listed above.
- **Local State**: Any mutations (like marking a task "Done" or clearing an inbox) are held in React state. To reset the demo to its pristine state, simply **refresh the browser tab**.
- **Database Rules**: If using Supabase dev/test for backend validation, do not use it for live data. Never run a reset command against a production database. If future seed scripts are written (`seed.ts`), they must specifically target the local/dev environment only.

## 7. QA pass/fail checklist
Before a major presentation, verify:
- [x] Route opens instantly without crashing.
- [x] No React console errors or warnings in the DevTools.
- [x] No horizontal scrollbars (except explicitly designed Kanban lanes).
- [x] No real phone numbers are visible (e.g., must be `090****123`).
- [x] No credentials or API keys exposed in the UI.
- [x] No real send buttons (all buttons must say "Duyệt & Lưu Nháp" or "Gửi (Demo)").
- [x] No live connector API calls (check Network tab).
- [x] No live LLM calls (ensure mock latency/responses are used).
- [x] Copy clearly avoids mentioning scraping or personal monitoring.
- [x] Mobile layout is fully readable and buttons are tappable.
- [x] Drawers and modals close properly via 'X' or backdrop click.
- [x] CTA labels include "Demo", "Draft", or "Approval" where side effects would normally occur.

## 8. Known visual risks
Be mindful of these areas during a demo or when taking screenshots:
- **Team Inbox 3-pane density**: Can feel cramped on screens smaller than 1440px. Ensure browser zoom is 100%.
- **Safety Center technical overload**: The Mock Outbox and Logs tabs look highly technical; don't dwell on them unless talking to a CTO.
- **Finance table overflow**: Ensure mock names aren't so long they break the table layout.
- **Kanban horizontal scroll**: Ensure the trackpad/mouse scroll works smoothly.
- **Drawer on mobile**: Ensure it covers the screen properly without leaving strange background gaps.
- **Older routes**: Pages like `/zalo-inbox` and `/fanpage-inbox` are older prototypes and feel less polished than `/team-inbox`. Avoid them in the primary demo route.

## 9. Screenshot file naming convention
Use the exact naming structure outlined in the table above to ensure the sales/marketing team can easily organize the assets. Format:
`eduos-[number]-[module]-[viewport].png`
*Example:* `eduos-02-team-inbox-desktop.png`

## 10. Pre-demo script checklist
30 minutes before a meeting:
- [x] Open browser (preferably Chrome) at exactly 100% zoom.
- [x] Clear old tabs and hide bookmark bars.
- [x] Verify login bypass is working.
- [x] Pre-load the canonical routes in separate tabs to ensure rapid switching.
- [x] Ensure internet is stable.
- [x] If running locally against Supabase dev/test, verify the database is reachable.
- [x] **Mental check**: Remember this is a "vision demo". Mentally prepare to explicitly say "This is a sandbox environment" if the client asks about data privacy.

## 11. Next recommended phase
- Phase 78 — Official Connector Readiness Technical Spec
