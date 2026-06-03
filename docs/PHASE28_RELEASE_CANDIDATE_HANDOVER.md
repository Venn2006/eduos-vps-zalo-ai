# Phase 28: Release Candidate Handover

## 1. Current Commit Baseline
* **Latest Master Before Branch:** `22a2bbe merge: add demo production readiness package`
* **Branch Name:** `work/phase25-28-release-candidate-hardening`
* **Phases Included in this Release Candidate:**
  * Phase 25: Release Candidate Browser / Route QA
  * Phase 26: Demo Seed Data Audit
  * Phase 27: Audit Log & Dynamic Permission Implementation Plan
  * Phase 28: Release Candidate Handover

## 2. What Is Demo-Ready
EduOS is fundamentally ready to be demonstrated to investors or partner centers. The following modules are complete and highly presentable:
* **CEO Dashboard:** Aggregated KPI metrics loaded live from the DB.
* **AI Center:** The prompt prefill and role-scoped LLM structure.
* **Workspaces Structure:** Perfect isolation between Sale, Teacher, and Finance.
* **Sales Calling:** Kanban board and a highly optimized tele-calling interface (`/workspaces/sales/calling`).
* **Teacher Workspace:** Class attendance and homework tracking.
* **Finance Workspace:** Invoice tracking and dynamic Debt Aging metrics.
* **Settings:** Read-only foundational UI for Permissions, Connectors, and Production Readiness.
* **Docs & Runbooks:** Complete documentation on how to onboard a center and deploy to production safely.

## 3. What Is Pilot-Ready
For early testing with a *real* center, the following workflows are structurally robust and safe:
* **Role Access (RBAC):** Strict boundaries are enforced at the server level.
* **Tenant-Scoped Reads/Writes:** All queries enforce `tenantId`.
* **Manual Call Outcome Workflow:** Safe logging of `CallAttempt` and automatic generation of `FollowUpTask`.
* **Trial Booking Handoff:** Seamless conversion of leads into `TrialBooking` without double data entry.
* **Connector Status Read-Only:** Safe visualization of whether the Zalo VPS is online.

## 4. What Is NOT Production-Complete
To manage expectations, these features are explicitly *not* ready for live traffic:
* **No Live Zalo Send:** The Appium VPS bridge cannot physically dispatch outbound texts yet.
* **No Live Fanpage Send:** Facebook Messenger Webhook receives events but does not emit Graph API replies.
* **No Dynamic Permission Editing:** Roles are hardcoded; you cannot currently create a custom role in the UI.
* **No AuditLog Table:** History tracking relies on `updatedAt` rather than an immutable ledger.
* **No Billing/Subscription SaaS Layer:** EduOS itself does not have a Stripe integration to charge the language centers yet.
* **No Parent Portal:** Parents do not yet have a dedicated PWA/app to log into.
* **No Real Payment Reconciliation:** VietQR and automated bank scraping are not implemented.
* **No Live LLM:** The AI returns mock deterministic responses until OpenAI/Anthropic keys are securely hooked into the prompt engine.

## 5. Safety Guardrails Guaranteed
* **No Auto-Send:** The system strongly adheres to the "Draft-First" philosophy.
* **No Client TenantId Trust:** `tenantId` is always derived strictly from `getSession()` on the server.
* **No SALE Cross-Lead Mutation:** Sales members only see and mutate their assigned leads.
* **No Finance Leakage:** Financial data is fully blocked from Sales and Teachers.
* **No Teacher Data Leakage:** Academic grades are blocked from Sales.
* **Role-Gated Sensitives:** All sensitive pages immediately return `<ForbiddenRoleMessage />` before making any DB queries.

## 6. How To Demo
* **5-Minute Flow:** Log in as OWNER. Show the Dashboard. Ask the AI a question. Switch to `/workspaces/sales/calling` and log a call.
* **15-Minute Flow:** Do the 5-minute flow, then switch users to demonstrate the RBAC block on the Dashboard for a SALE user. Show the Teacher attendance screen. Show the Debt Aging screen for an ACCOUNTANT.
* **Role-Switch Demo:** Demonstrate that opening `/workspaces/finance` logged in as SALE returns an instant "403 Forbidden".
* **Connector / Readiness Demo:** Show `/settings/production-readiness` to prove enterprise-grade deployment checks.

## 7. Final QA Commands
Before pushing any updates to this Release Candidate, run:
```bash
git status --short
npm run typecheck
npm run build
npm run test
```

## 8. Recommended Next Build Phases
Once the RC is approved, development should resume in this exact order:
1. **Phase 29:** AuditLog schema implementation & Middleware.
2. **Phase 30:** Dynamic Permission Center backend.
3. **Phase 31:** Zalo / Fanpage approval-send production bridge (The final mile for messaging).
4. **Phase 32:** Payment / VietQR automated reconciliation.
5. **Phase 33:** Parent Portal Lite (PWA).
