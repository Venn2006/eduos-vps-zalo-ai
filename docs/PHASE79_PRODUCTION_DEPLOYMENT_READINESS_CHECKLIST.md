# Phase 79: Production Deployment Readiness Checklist

## 1. Executive summary
EduOS is currently **founder-demo ready**. The application runs in a sandbox environment using mock data and a Supabase dev/test validation database.
**Production/pilot deployment is not yet approved.**
This checklist defines the strict prerequisites that must be met before transitioning the application to a staging environment, a production environment, or a paid pilot. At this time, real outbound messaging, real official connectors, live banking integrations, and live LLM calls remain strictly **NO-GO**.

## 2. Environment readiness
- [ ] Staging environment architecture defined (e.g., Vercel + Supabase Staging).
- [ ] Production environment architecture defined.
- [ ] Environment variables inventory complete and documented.
- [ ] Verified that NO secrets exist in the git repository.
- [ ] **Supabase dev/test password rotated** (if previously exposed).
- [ ] Production database completely physically separated from dev/test databases.
- [ ] Backup and restore plan documented.
- [ ] Monitoring and alerting plan established.
- [ ] Log retention policy defined.
- [ ] Strict access controls enforced for cloud environments and secrets managers.

## 3. Database readiness
- [ ] Finalize decision on the production Postgres provider (e.g., Supabase, AWS RDS).
- [ ] Schema migration strategy documented.
- [ ] Schema migration review process established.
- [ ] Seed strategy implemented for staging only (production starts clean).
- [ ] **Strict rule:** No `prisma db push` allowed in production.
- [ ] Automated backup schedule configured.
- [ ] Database restore drill successfully completed.
- [ ] PII retention rules mapped to database tables.
- [ ] Audit log table architecture finalized.
- [ ] Row-Level Security (RLS) / tenant isolation strategy reviewed.

## 4. Auth and role readiness
- [ ] Tenant `Admin` role capabilities strictly defined.
- [ ] Staff roles (`Teacher`, `Finance`, `Manager`) capabilities defined.
- [ ] Role permission matrix thoroughly tested.
- [ ] Ensure no shared admin passwords exist.
- [ ] Password reset and account lifecycle flows tested.
- [ ] Secure invitation flow for new tenant staff implemented.
- [ ] Session timeout and token expiration configured securely.
- [ ] Staff offboarding workflow (disabling access) tested.
- [ ] Principle of least privilege enforced across the application.

## 5. Demo-to-production data boundary
- [ ] Mock data generation logic clearly separated from production paths.
- [ ] Guarantee no fake demo data leaks into a production tenant.
- [ ] Guarantee no real customer data is ever downloaded to local dev environments.
- [ ] Phone number masking rules enforced in UI components.
- [ ] Data deletion and export workflows implemented for GDPR/privacy compliance.
- [ ] Data processing notice drafted.
- [ ] Tenant consent agreement templates finalized.

## 6. Connector readiness
*Refer to Phase 78 for the full technical spec.*
- [ ] Zalo OA / Zalo Business official path only.
- [ ] Meta Page official path only.
- [ ] **NO** personal Zalo scraping.
- [ ] **NO** private inbox scraping.
- [ ] **NO** credential collection (passwords/cookies) from staff.
- [ ] Read-only pilot must precede any outbound pilot.
- [ ] Draft-only outbox must precede any automated outbound pilot.
- [ ] Human approval strictly required for outbound actions.
- [ ] Per-tenant connector feature flags implemented and default to **OFF**.

## 7. Outbound send readiness
- [ ] Outbox table/model design reviewed for safe asynchronous sending.
- [ ] Approval workflow fully implemented in UI and API.
- [ ] Audit logs implemented for all staging and sending actions.
- [ ] Idempotency keys enforced on all outbound API requests.
- [ ] Rate limits defined to respect provider constraints.
- [ ] Emergency rollback / global disable switch implemented.
- [ ] Real send feature flag strictly **OFF** by default.
- [ ] **NO** direct sending by the AI agent.
- [ ] Admin confirmation UX implemented for activating sending capabilities.
- [ ] Pilot tenant written approval secured before enabling outbox.

## 8. AI/LLM readiness
- [ ] Live LLM integration flag strictly **OFF** by default.
- [ ] PII redaction layer and context builder implemented.
- [ ] Prompt audit metadata logging implemented.
- [ ] Confirmed no unnecessary PII is passed to the LLM.
- [ ] Final model/vendor selection made (considering data privacy terms).
- [ ] Cost controls and usage limits implemented.
- [ ] Human approval enforced for all AI-generated outbound copy.
- [ ] Failure fallback UI implemented if LLM is unavailable.
- [ ] **NO** autonomous outbound actions allowed.

## 9. Banking/payment readiness
- [ ] Integration strictly limited to **read-only** reconciliation first.
- [ ] **NO** money movement capabilities.
- [ ] **NO** payment mutation capabilities.
- [ ] Bank/vendor API consent obtained.
- [ ] Finance role manual approval required for reconciliation matching.
- [ ] Immutable audit trail implemented for all financial state changes.
- [ ] Exception handling for mismatched/failed webhooks.
- [ ] **NO** bank credentials stored in application code or DB.

## 10. Security readiness
- [ ] Secrets management solution (e.g., Vercel Secrets, AWS Secrets Manager) in place.
- [ ] NPM dependency audit run with 0 critical vulnerabilities.
- [ ] Authentication and session management review completed.
- [ ] Role authorization checks verified on all API endpoints.
- [ ] Input validation (Zod) enforced on all API endpoints.
- [ ] Webhook signature validation plan implemented.
- [ ] CSRF and CORS policies reviewed and tightened.
- [ ] API rate limiting implemented.
- [ ] Logging system verified to *not* leak sensitive PII or tokens.
- [ ] Database backup encryption verified.
- [ ] Incident response technical contact designated.

## 11. Observability readiness
- [ ] Application logs centralized.
- [ ] API access logs centralized.
- [ ] Database monitoring (CPU, memory, connections) enabled.
- [ ] Error tracking (e.g., Sentry) integrated.
- [ ] Audit event dashboard accessible to Admins.
- [ ] Performance monitoring (e.g., Vercel Analytics) enabled.
- [ ] Queue/worker monitoring configured (for future background jobs).
- [ ] Uptime checks configured.
- [ ] Alert routing (e.g., to Slack/Email) configured for critical errors.

## 12. QA readiness
- [ ] All 195 integration tests pass (`@eduos/shared` and `@eduos/api`).
- [ ] Application build passes without critical errors.
- [ ] Mobile screenshot QA pack completed.
- [ ] Core business routes manually QA'd.
- [ ] Role permission matrices manually QA'd.
- [ ] Verified **no real send buttons** exist in the demo build.
- [ ] Verified **no external API calls** (Zalo/Meta/Bank/LLM) are made in the demo build.
- [ ] Browser console is clean (no critical React warnings or failing requests).
- [ ] Regression checklist complete.

## 13. Staging deployment checklist
**GO Criteria for Staging Deploy:**
- [ ] Staging environment infrastructure provisioned.
- [ ] Staging database provisioned and physically separate from production.
- [ ] Environment restricted to internal test tenants only.
- [ ] Demo seed data successfully loaded.
- [ ] Verified NO production data exists in staging.
- [ ] All risky feature flags (Connectors, LLM, Real Send) set to OFF.
- [ ] Smoke tests pass on staging URL.
- [ ] Rollback procedure tested.

## 14. Production deployment checklist
**GO Criteria for Production Deploy:**
- [ ] Paid pilot contract and scope formally approved by pilot tenant.
- [ ] Production secrets securely loaded into managed environment.
- [ ] Production database provisioned, backups enabled, restore tested.
- [ ] Observability stack fully functional.
- [ ] Pilot tenant Owner/Admin training completed.
- [ ] Data processing notice provided to pilot tenant.
- [ ] Dedicated support channel established for pilot tenant.
- [ ] Incident response process activated.
- [ ] Legal review for intended official connectors completed.
- [ ] Real send and live connectors strictly **OFF** unless explicitly authorized for the pilot.

## 15. Go/No-Go matrix
| Initiative | Status |
|---|---|
| Founder demo | GO |
| Internal demo | GO |
| Staging deploy | CONDITIONAL (Pending Section 13) |
| Production deploy | CONDITIONAL (Pending Section 14) |
| Paid pilot | CONDITIONAL (Requires Contract) |
| Read-only connector pilot | CONDITIONAL |
| Draft-only AI | CONDITIONAL |
| Human-approved real send pilot | CONDITIONAL |
| Autonomous send | NO-GO |
| Zalo personal scraping | PROHIBITED |
| Bank payment mutation | NO-GO |

## 16. Immediate next actions
1. Rotate Supabase dev/test DB password (if previously exposed).
2. Create staging environment architecture plan.
3. Prepare production environment variable inventory.
4. Decide on production database provider.
5. Run the Phase 77 screenshot QA pack.
6. Prepare pilot tenant contract/scope.
7. Keep all real connectors OFF.

## 17. Next recommended phase
- Phase 80 — Paid Pilot Implementation Plan
