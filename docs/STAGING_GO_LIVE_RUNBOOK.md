# EduOS Staging Go-Live Runbook

Use this runbook to create a production-like staging environment before any paid pilot tenant goes live. This is intentionally operational and checklist-driven.

## 0. Required Outcome

Staging is ready only when:

- [ ] It uses a database that is not local, not demo, and not production.
- [ ] It has shared Redis REST rate limiting configured.
- [ ] Production-like `NODE_ENV=production` behavior is tested.
- [ ] DB migrations apply cleanly.
- [ ] Owner login works.
- [ ] Critical pages pass smoke tests.
- [ ] Audit log filter/export works.
- [ ] Non-admin RBAC denial works.

## 1. Provision Infrastructure

Create these resources:

- [ ] PostgreSQL database: `eduos_staging` or equivalent.
- [ ] Redis REST store for rate limiting, recommended Upstash Redis.
- [ ] Deployment target for the web app.
- [ ] Secure secret storage for environment variables.

Do not reuse:

- Local dev database.
- Customer production database.
- Demo/seed-only database.
- Shared Redis from another unrelated app.

## 2. Required Environment Variables

Set these in staging:

```bash
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_SECRET="replace-with-long-random-secret"
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
AUDIT_LOG_RETENTION_DAYS=180
ALLOW_IN_MEMORY_RATE_LIMITS=false
```

Optional, depending on modules enabled:

```bash
AI_PROVIDER="mock"
OPENAI_API_KEY=""
DEEPSEEK_API_KEY=""
CLOUD_API_URL="https://staging-url.example.com"
CONNECTOR_TOKEN="staging-only-token"
MOCK_MODE=true
```

Pass/fail:

- [ ] `DATABASE_URL` points to staging DB.
- [ ] `JWT_SECRET` is not copied from local `.env.example`.
- [ ] Upstash Redis REST URL/token are present.
- [ ] `ALLOW_IN_MEMORY_RATE_LIMITS` is absent or `false`.
- [ ] `MOCK_MODE=true` unless a separately approved connector test is being performed.

## 3. Install And Generate

From repo root:

```bash
npm install
npm run db:generate --workspace=@eduos/db
```

Pass/fail:

- [ ] Install completes.
- [ ] Prisma client generation completes.

## 4. Apply Database Migrations

Run against staging DB only:

```bash
npm run db:migrate --workspace=@eduos/db
```

Expected migration includes audit log indexes:

- `20260607090000_audit_log_indexes`

Pass/fail:

- [ ] Migration completes without drift errors.
- [ ] `AuditLog_tenantId_createdAt_idx` exists.
- [ ] `AuditLog_tenantId_action_createdAt_idx` exists.

If migration fails:

1. Stop deployment.
2. Do not point staging app at partially migrated DB.
3. Capture migration error output.
4. Verify `DATABASE_URL` is staging and not production.

## 5. Build And Static Verification

Run:

```bash
npm run typecheck --workspace=@eduos/web
npm run typecheck --workspace=@eduos/db
npm test --workspace=@eduos/api -- --runInBand
npm run build --workspace=@eduos/web
```

Known local behavior: web build output may stop after `Finished TypeScript` in this shell. Treat it as inconclusive unless artifacts are checked.

Artifact checks:

```bash
ls apps/web/.next/BUILD_ID
ls apps/web/.next/routes-manifest.json
ls apps/web/.next/prerender-manifest.json
```

Pass/fail:

- [ ] Web typecheck passes.
- [ ] DB typecheck passes.
- [ ] API tests pass.
- [ ] Web build exits successfully in CI/deploy platform.
- [ ] `.next/BUILD_ID` exists after build.

## 6. Seed Or Create Staging Owner

For staging, create a minimal owner tenant. Do not seed broad demo data unless needed for walkthrough.

Minimum data:

- [ ] Tenant.
- [ ] OWNER user.
- [ ] OWNER tenant membership active.
- [ ] One SALE user for RBAC workflow test if needed.
- [ ] One TEACHER user for RBAC denial test if needed.

Password rules:

- [ ] Use non-demo passwords for any externally accessible staging.
- [ ] Do not reuse production passwords.
- [ ] Store temporary credentials in a secure handoff channel.

## 7. Deploy Staging

Deploy with staging env vars.

Pass/fail:

- [ ] App starts without missing env errors.
- [ ] Login page loads.
- [ ] No route protection loop.
- [ ] No server logs showing rate-limit store unavailable.

Important: because production rate limiting fails closed, missing Upstash env will break mutation/login requests in staging if `NODE_ENV=production`. That is expected and correct.

## 8. Browser Smoke Test

Use staging URL in place of local URL.

Owner account:

- [ ] Login succeeds.
- [ ] `/dashboard` loads.
- [ ] `/crm-command-center` loads.
- [ ] `/leads` loads.
- [ ] `/workspaces/finance` loads.
- [ ] `/ai-center` loads.
- [ ] `/settings/audit-log` loads.

For each page:

- [ ] No Next error overlay.
- [ ] No console errors.
- [ ] No body-level horizontal overflow on desktop.
- [ ] No body-level horizontal overflow at 390px mobile.

## 9. Audit Log Verification

In staging:

- [ ] Perform one auditable action, such as AI knowledge create/delete or staff creation.
- [ ] Open `/settings/audit-log`.
- [ ] Confirm total count increases.
- [ ] Filter by category.
- [ ] Filter by date.
- [ ] Export CSV.
- [ ] Confirm CSV status is `200` and content type is `text/csv`.

Expected CSV columns:

- `createdAt`
- `actorId`
- `action`
- `entityType`
- `entityId`
- `metadataJson`

## 10. RBAC Verification

Use a TEACHER account or any non-admin role:

- [ ] Login succeeds.
- [ ] Attempt OWNER/ADMIN-only AI knowledge mutation.
- [ ] API returns `403 Forbidden`.
- [ ] TEACHER can still access allowed teacher workflows if configured.

Do not proceed if a non-admin can mutate admin-only resources.

## 11. Rate Limit Verification

Staging must use Redis REST rate limits.

Check server logs:

- [ ] No `Rate limit store unavailable` logs during login/mutation smoke.
- [ ] No `ALLOW_IN_MEMORY_RATE_LIMITS=true` in staging env.

Optional stress test:

- [ ] Send repeated login attempts above configured limit.
- [ ] Confirm API eventually returns `429` with `Retry-After`.

## 12. Pilot-Safe Feature Verification

Confirm disabled/sandboxed:

- [ ] Real Zalo outbound sending disabled.
- [ ] Personal Zalo scraping disabled.
- [ ] Private inbox scraping disabled.
- [ ] Autonomous AI send disabled.
- [ ] Real payment/banking mutation disabled.

Confirm allowed:

- [ ] Manual CSV import.
- [ ] CRM workflow.
- [ ] Finance visibility/drafts.
- [ ] AI knowledge/drafts.
- [ ] Audit log/export.

## 13. Customer Handoff Package

Before inviting a pilot customer, prepare:

- [ ] `docs/PILOT_DEPLOYMENT_CHECKLIST.md`
- [ ] `docs/DATA_POLICY_DRAFT.md`
- [ ] `docs/PILOT_KNOWN_LIMITATIONS.md`
- [ ] Pilot pricing/offer document.
- [ ] Temporary staging credentials.
- [ ] First-week success metrics.

## 14. Go / No-Go Decision

GO for paid pilot if:

- [ ] Sections 1-12 pass.
- [ ] Customer accepts known limitations.
- [ ] Customer accepts AI/manual-approval operating model.
- [ ] Customer has consent/lawful basis for imported data.
- [ ] Owner champion is assigned.

NO-GO if:

- [ ] Production-like rate limiting is missing.
- [ ] Migrations fail or DB is shared with production/demo.
- [ ] RBAC denial fails.
- [ ] Audit export fails.
- [ ] Customer expects autonomous real-send automation in base pilot.
- [ ] Customer refuses data/consent terms.

## 15. Incident Rollback

If staging or pilot breaks:

1. Disable connector/sandbox queue first.
2. Keep login and audit log available.
3. Export audit log for incident window.
4. Preserve tenant data.
5. Revert customer workflow to manual CSV/Excel temporarily.
6. Patch and re-run this runbook before re-enabling.
