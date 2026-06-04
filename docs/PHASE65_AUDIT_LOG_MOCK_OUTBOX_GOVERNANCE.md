# Phase 65: Audit Log & Mock Outbox Governance

## Overview
To provide absolute visibility into AI and connector actions, Phase 65 hardens the Governance and Mock Outbox visibility. Center admins must have an audit trail for every automated decision and human approval.

## Key Principles
1. **Total Visibility:** Every draft created, every message blocked, and every manual import warning must be logged.
2. **Mock Outbox Sandbox:** The system safely queues actions into a Mock Outbox instead of firing real webhooks or API requests.
3. **Human-in-the-loop Verification:** Identifies actions that hit `ADMIN_APPROVAL_REQUIRED` or `TEACHER_APPROVAL_REQUIRED`.

## UI Components
The Safety Center now includes an "Audit Log" tab:
- **Governance Counters:** High-level metrics showing how many real sends were blocked, drafts created, and outbox items queued.
- **Mock Audit Log Preview:** A table showing deterministic simulation events (e.g., "Real send blocked by safety policy" or "Draft ready for teacher review").

## Status
- **Implemented:** Yes (Mock UI only)
- **Real Backend:** No (No real DB writes to `AuditLog` yet to prevent sandbox pollution)
- **Next Steps:** Create a real scalable Audit Logger when transitioning to production.
