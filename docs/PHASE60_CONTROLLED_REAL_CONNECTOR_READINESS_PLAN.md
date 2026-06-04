# Phase 60: Controlled Real Connector Readiness Plan

## 1. Context
- Builds on Phase 59 architecture.
- Current EduOS remains sandbox/demo-only.
- Phase 60 is a readiness plan, not implementation.

## 2. Goal
- Prepare for future controlled pilot.
- Define go/no-go gates.
- Prevent unsafe real send or unauthorized data sync.

## 3. Non-negotiable Launch Gates

Before real connector work can begin:
- paying pilot or explicit signed approval
- tenant-level opt-in
- written consent for channels/data
- documented data retention policy
- audit log design approved
- rollback plan
- manual review process
- admin approval queue working
- sandbox outbox proven
- monitoring/alerts defined
- rate-limit policy defined
- no private scraping
- no credential sharing
- legal/privacy review if needed

## 4. Connector Categories and Readiness

| Connector | Purpose | Data direction | Current status | Earliest allowed phase | Required approval | Risk level | Must remain disabled until |
|---|---|---|---|---|---|---|---|
| Zalo OA read-only | Message import | Inbound | Mocked | Pilot | Tenant Opt-in | Medium | Pilot Approval |
| Zalo OA draft/reply | Send messages | Outbound | Mocked | Pilot Phase 2 | Admin Approval | High | Real Send Approval |
| Facebook Fanpage read-only | Message import | Inbound | Mocked | Pilot | Tenant Opt-in | Medium | Pilot Approval |
| Facebook Fanpage reply | Send messages | Outbound | Mocked | Pilot Phase 2 | Admin Approval | High | Real Send Approval |
| Zalo group/class | Message import | Inbound | Mocked | N/A | N/A | Prohibited | N/A |
| Zalo personal account | Monitoring | Inbound | Mocked | N/A | N/A | Prohibited | N/A |
| Landing page/form | Lead import | Inbound | Mocked | Pilot | None | Low | Pilot Approval |
| CSV/XLSX | Data import | Inbound | Mocked | Pilot | None | Low | Immediate |
| VietQR payment intent | Link generation | Outbound | Mocked | Pilot Phase 2 | Admin Approval | High | Banking Approval |
| Bank/Open Banking | Reconciliation | Inbound | Disabled | Post-Pilot | Admin Approval | High | Banking Approval |
| Email | Import/send | Both | Mocked | Pilot Phase 2 | Admin Approval | Medium | Real Send Approval |
| LMS/homework | Import | Inbound | Mocked | Pilot | None | Low | Immediate |
| Calendar/schedule | Import | Inbound | Mocked | Pilot | None | Low | Immediate |

## 5. Recommended Pilot Scope

First safe pilot scope:
- one tenant only
- one channel only
- read-only first
- no real send
- import limited date range
- masked PII in logs
- manual review
- clear rollback
- staff training
- daily audit review

Preferred first connector:
- manual CSV/XLSX import or landing page/form import
- read-only Zalo OA import only after approval

Not first:
- Zalo personal monitoring
- bank/Open Banking reconciliation
- real auto-send
- payroll
- automated payment mutation

## 6. Real Send Readiness

Strict rules:
- real send disabled by default
- separate feature flag
- tenant opt-in
- admin approval required
- sandbox dry-run before live
- send preview
- throttling
- cancellation window if possible
- audit log
- rollback/disable switch

Must state: No real send is implemented in Phase 60. No `MESSAGE_SENT` event should exist until a future approved phase.

## 7. Payment/Banking Readiness

Strict rules:
- no real bank API now
- no real payment mutation
- no auto reconciliation
- VietQR can be payment-intent/mock only until approval
- admin review required for marking paid
- finance data must be auditable
- parent-facing payment communication requires admin approval

## 8. AI/LLM Readiness

Strict rules:
- no live LLM now
- no real student data to LLM without consent
- teacher approval for grades/reports
- admin approval for money/policy/complaint
- prompt logging policy
- model output disclaimer
- hallucination mitigation
- fallback to human

## 9. Feature Flag Plan

Conceptual flags (Do not implement env/config changes unless already present and safe):
- `CONNECTORS_ENABLED`
- `ZALO_OA_IMPORT_ENABLED`
- `FANPAGE_IMPORT_ENABLED`
- `REAL_SEND_ENABLED`
- `BANK_RECONCILIATION_ENABLED`
- `LIVE_LLM_ENABLED`
- `SANDBOX_OUTBOX_ONLY`
- `REQUIRE_ADMIN_APPROVAL_FOR_MONEY`
- `REQUIRE_TEACHER_APPROVAL_FOR_GRADES`

## 10. Monitoring and Rollback

Include:
- connector health dashboard concept
- failed import count
- duplicate count
- send blocked count
- approval queue backlog
- error alerts
- disable switch
- tenant-level rollback
- audit export

## 11. Go / No-Go Checklist

- [ ] Product approval
- [ ] Legal/privacy approval
- [ ] Technical readiness
- [ ] Customer consent
- [ ] Test tenant
- [ ] Sandbox run
- [ ] Monitoring
- [ ] Rollback
- [ ] Training
- [ ] Final sign-off

## 12. Explicitly Deferred Items

Defer:
- real send
- production connector worker
- bank/Open Banking reconciliation
- payroll automation
- Zalo personal scraping
- private group scraping
- AI final grading
- automated tuition reminders
- social auto-posting

## 13. Recommended Next Phases

- Phase 61 — Connector Readiness UI / Admin Safety Dashboard
- Phase 62 — Manual Import Wizard for CSV/XLSX Leads and Finance
- Phase 63 — Sandbox Connector Simulator
- Phase 64 — Pilot Tenant Consent and Audit Log Spec
- Phase 65 — Controlled Read-only Connector Prototype, only after explicit approval
