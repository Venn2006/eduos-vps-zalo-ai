# Phase 53: Embedded AI Operating Model

**Context:** This document explains the architecture and operational model for AI within EduOS.
**Core Thesis:** "AI in EduOS should be embedded into daily workflows, not only exposed as a standalone chat interface."

## AI Product Positioning

* **AI Chatbot:** A standalone tool where users type questions and get answers. (Basic)
* **AI Draft Assistant:** A tool that drafts emails or messages but requires the user to click "Generate" on a specific screen. (Intermediate)
* **Embedded AI:** AI that operates seamlessly behind the scenes (Data Pipeline -> AI -> Action/Alert), deeply integrated into the specific business UI context.
* **AI Operating System:** The entire platform is orchestrated by data layers and embedded AI that proactively manages center health, student success, and staff efficiency.

## The EduOS AI Layers

1. **Base SaaS Data Layer:** Core database (Prisma) tracking students, classes, and revenue.
2. **CRM / Message Context Layer:** Structured timelines of all interactions (Zalo, Facebook, calls).
3. **Finance / Tuition Context Layer:** Tracking invoices, debt, and remaining sessions.
4. **Attendance / Learning Context Layer:** Tracking presence, homework scores, and teacher notes.
5. **Consent-based Data Pipeline:** Secure infrastructure to ingest external data.
6. **Embedded AI Decision Layer:** LLMs and logic rules analyzing the context layers.
7. **Approval / Safety Layer:** `AutomationModePolicy` dictating whether actions execute automatically or require handoff.
8. **Sandbox Outbox Layer:** Isolated testing environment ensuring no accidental real-world actions.
9. **AI Add-on Billing Layer:** Controlling which embedded AI features are active based on the center's subscription.

## Safe Data Pipeline Vocabulary

**Use:**
* consent-based data sync
* official API / webhook integration
* async connector pipeline
* rate-limit-aware queue
* import from customer-provided files
* sandbox-first sync
* audit-safe context builder
* deterministic local mocks for pilot/demo.

**Do not use:**
* scraping protected systems
* credential sharing
* bypassing rate limits
* copying private data
* scraping behind login
* stealth automation.

## Embedded AI Workflow Examples

### 1. AI Sales Intelligence
* **Input:** conversation history, lead source, follow-up history.
* **AI action:** classify intent, score lead, detect missing follow-up, suggest reply.
* **Output:** lead score, suggested task, handoff reason.
* **Safety:** no real send; admin approval if money/policy/commitment involved.

### 2. AI Cold Lead Alert
* **Input:** lead status and last interaction timestamp.
* **AI action:** detect stale lead.
* **Output:** follow-up task.
* **Safety:** dashboard/task only unless approved.

### 3. AI Churn Risk Alert
* **Input:** attendance, homework, score trend, complaints.
* **AI action:** detect high-risk student.
* **Output:** care task and suggested call script.
* **Safety:** no automatic sensitive message.

### 4. AI Homework/Curriculum Generator
* **Input:** teacher-uploaded PDF.
* **AI action:** extract vocabulary, create quiz, cloze test, CEFR-tagged exercises.
* **Output:** draft materials.
* **Safety:** teacher approval required.

### 5. AI Parent Report Assistant
* **Input:** attendance, homework, teacher notes.
* **AI action:** draft parent report.
* **Output:** parent report draft.
* **Safety:** teacher/admin approval before sending.

### 6. AI Tuition Reminder
* **Input:** debt, remaining sessions, parent communication tone.
* **AI action:** draft polite reminder.
* **Output:** reminder draft or sandbox schedule.
* **Safety:** admin approval required for money-related communication.

### 7. AI CEO Assistant
* **Input:** dashboard metrics.
* **AI action:** summarize center health.
* **Output:** insights and recommended actions.
* **Safety:** can draft actions, not execute sensitive actions.

## Automation Matrix

| Workflow | Default Mode | Why | Human Approval Required? | Allowed in Pilot? |
| :--- | :--- | :--- | :--- | :--- |
| Simple FAQ | AUTO_LOW_RISK | Low impact, high volume. | No | Yes (Mocked) |
| Lead follow-up alert | AUTO_WITH_DASHBOARD_REPORT | Needs visibility for managers. | No | Yes |
| Complaint detection | STAFF_HANDOFF | High risk, requires human empathy. | Yes | Yes |
| Homework grading | TEACHER_APPROVAL_REQUIRED | Academic integrity. | Yes | Yes |
| Tuition/payment message | ADMIN_APPROVAL_REQUIRED | Financial sensitivity. | Yes | Yes |
| Social post generation | DRAFT_ONLY | Brand voice control. | Yes | Yes |
| Disabled add-on | OFF | Not subscribed. | N/A | Yes |

## AI Add-on Packaging Implications
These embedded features will be bundled into monthly add-ons (e.g., "Gói AI Chăm Sóc Khách Hàng", "Gói AI Học Vụ"). The system must dynamically enable/disable the decision layer based on subscription status.

## Safety Boundaries
AI operates strictly within the context provided. It cannot issue connector commands without passing through the Approval/Safety Layer and respecting the `AutomationModePolicy`.

## What Can Be Demoed Now
The mock UI layers, the approval workflows, the sandbox outbox, and the localized mock LLM suggestions demonstrating the embedded concept.

## What Requires Paid Pilot Approval
Real data ingestion via official APIs, real webhook processing, and actual message sending (even in a sandbox context with real endpoints).
