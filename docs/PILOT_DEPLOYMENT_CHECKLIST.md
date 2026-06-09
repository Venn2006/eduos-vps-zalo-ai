# EduOS Pilot Deployment Checklist

Purpose: use this checklist before shipping EduOS to a paid pilot center. The current safe positioning is **controlled pilot with manual approval**, not autonomous real-send automation.

## 1. Environment Separation

Required before onboarding a real customer:

- [ ] Create separate databases for `staging`, `pilot`, and `production`.
- [ ] Confirm no customer tenant shares the local demo/seed database.
- [ ] Confirm each environment has its own `JWT_SECRET`.
- [ ] Confirm production has `NODE_ENV=production`.
- [ ] Confirm production has shared rate-limit store configured:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- [ ] Confirm `ALLOW_IN_MEMORY_RATE_LIMITS` is not enabled in production unless there is a written incident override.
- [ ] Set `AUDIT_LOG_RETENTION_DAYS=180` or the agreed pilot value.

## 2. Database Release

Run on staging first, then pilot/prod:

```bash
npm run db:generate --workspace=@eduos/db
npm run db:migrate --workspace=@eduos/db
npm run typecheck --workspace=@eduos/db
```

Release checks:

- [ ] AuditLog indexes migration is applied.
- [ ] Prisma client is regenerated after schema changes.
- [ ] Seed/demo data is not applied to a real customer tenant unless explicitly requested for training.
- [ ] Tenant owner account is created with a non-demo password.

## 3. Web Release Verification

Run before handoff:

```bash
npm run typecheck --workspace=@eduos/web
npm run typecheck --workspace=@eduos/db
npm test --workspace=@eduos/api -- --runInBand
```

Manual browser smoke:

- [ ] Login as OWNER.
- [ ] Open `/dashboard`.
- [ ] Open `/crm-command-center`.
- [ ] Open `/workspaces/finance`.
- [ ] Open `/leads`.
- [ ] Open `/ai-center`.
- [ ] Open `/settings/audit-log`.
- [ ] Export audit CSV from `/settings/audit-log`.
- [ ] Verify no console errors on the pilot-critical pages.
- [ ] Verify mobile viewport at 390px has no body-level horizontal overflow.

## 4. Security Gates

Must pass before paid pilot:

- [ ] Login uses real bcrypt password verification.
- [ ] `session_token` cookie is `httpOnly`, `sameSite=lax`, and `secure` in production.
- [ ] Route protection is active via Next `src/proxy.ts`.
- [ ] OWNER/ADMIN-only APIs reject TEACHER/SALE/ACCOUNTANT where required.
- [ ] Mutation APIs enforce same-origin checks.
- [ ] Shared rate limiting works in production; missing Redis store fails closed.
- [ ] Audit logs are created for staff, settings, billing simulation, lead import, AI knowledge, lead actions, finance actions, attendance/progress notes, and sandbox outbox changes.
- [ ] Audit log UI filters and CSV export work for the pilot tenant.

## 5. Pilot Feature Flags And Restrictions

Keep disabled or sandboxed:

- [ ] Real Zalo outbound sending.
- [ ] Personal Zalo scraping.
- [ ] Private inbox scraping.
- [ ] Autonomous AI send.
- [ ] Real payment/banking mutations.
- [ ] Any connector that stores third-party credentials without explicit customer approval.

Allowed pilot mode:

- [ ] Manual CSV lead import.
- [ ] CRM follow-up workflow.
- [ ] Team task ownership.
- [ ] Finance debt visibility and draft reminders.
- [ ] AI knowledge base and AI draft suggestions.
- [ ] Sandbox/manual approval outbox.
- [ ] Audit log review and CSV export.

## 6. Customer Onboarding

Before kickoff:

- [ ] Customer signs pilot scope and data-processing consent.
- [ ] Customer nominates one owner champion.
- [ ] Customer provides staff list, roles, and work emails.
- [ ] Customer provides sample lead CSV or a small real CSV import file.
- [ ] Customer confirms AI will not send messages automatically during pilot.
- [ ] Customer confirms retention/export/delete expectations.

Setup steps:

- [ ] Create tenant.
- [ ] Create OWNER account.
- [ ] Create ADMIN/SALE/TEACHER/ACCOUNTANT accounts as needed.
- [ ] Import leads.
- [ ] Configure basic classes/courses if needed for finance/care flows.
- [ ] Add initial AI knowledge entries: pricing, policy, schedule, refund/hold rules, FAQ.
- [ ] Review audit log after setup to confirm actions are recorded.

## 7. Go-Live Day Script

1. Show owner the dashboard and explain this is a control cockpit, not an autonomous bot.
2. Show CRM Command Center and stale lead handling.
3. Show Finance debt queue and reminder draft approval.
4. Show AI Center and explain how knowledge affects AI suggestions.
5. Show Audit Log and CSV export.
6. Confirm real-send automation is disabled.
7. Agree on first-week success metrics.

## 8. Pilot Success Metrics

Track weekly:

- Lead response time.
- Stale lead count.
- Follow-up task completion rate.
- Overdue tuition follow-up count.
- Number of AI drafts generated.
- Number of drafts approved vs rejected.
- Parent complaint/risk items handled.
- Active staff usage.

## 9. Rollback Plan

If pilot issues occur:

- [ ] Disable connector or sandbox queue first.
- [ ] Keep login and audit log available for investigation.
- [ ] Export audit CSV for the affected time range.
- [ ] Revert to manual CSV/Excel workflow while preserving tenant data.
- [ ] Do not delete customer data until retention/delete request is formally confirmed.

## 10. Ship Verdict

Paid pilot can proceed when all required boxes in sections 1-5 are checked. Broad production launch still requires formal data policy, environment isolation proof, stricter CI lint/build output, and customer support/incident process.
