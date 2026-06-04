# The EduOS Product Model (Phase 52)

## 1. Core Identity: Zalo & Fanpage CRM
EduOS is primarily a SaaS **Customer Relationship Management (CRM) system** built around the communication channels that Vietnamese education centers use most: Zalo and Facebook Fanpage.
- It provides shared inboxes (`/fanpage-inbox`, `/zalo-inbox`).
- It manages Class Groups (`/zalo-groups`).
- It tracks Financial workflows (Tuition, Renewals).
- It tracks Academic workflows (Homework, Attendance).
- The Giám đốc (Director) uses the **CRM Command Center** (`/crm-command-center`) to oversee all staff Zalo accounts and Fanpages.

## 2. The "AI Add-on Layer"
We do **not** sell EduOS as an "AI that runs your business." We sell it as a CRM.
The AI is a **layer** on top of the CRM, packaged into specific "Add-ons" that the owner can choose to enable via the **AI Add-on Catalog** (`/ai-addons`).
- **Student Care AI**: Reminds about classes.
- **Academic AI**: Grades homework drafts.
- **Sales AI**: Follows up on renewals and trial bookings.

## 3. Automation & Human-in-the-Loop
Previously, we forced nearly all AI messages into the `/approval-queue`. This proved to be too "approval-heavy" for small/mid-sized centers.

In Phase 52, we introduced the `AutomationModePolicy` (`packages/shared/src/lib/automationModePolicy.ts`), which classifies intent and risk level to determine the optimal automation mode:
- **`AUTO_LOW_RISK`**: E.g., basic FAQs. AI sends immediately.
- **`STAFF_HANDOFF`**: E.g., complaints or high-risk leads. AI immediately stops and pings a human staff member to take over.
- **`TEACHER_APPROVAL_REQUIRED` / `ADMIN_APPROVAL_REQUIRED`**: E.g., sending homework grades, financial tuition reminders. Must be approved.
- **`AUTO_WITH_DASHBOARD_REPORT`**: E.g., Renewal reminders. AI sends, but logs heavily on the dashboard for staff to track.

This model provides a practical, safe, and highly marketable SaaS platform that centers can trust.
