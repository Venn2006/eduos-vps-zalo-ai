# EduOS Ship Audit Report - 2026-06-07

## Executive verdict

Verdict: **Conditional GO for controlled paid pilot / NO-GO for broad production launch**.

The product is strong enough for a scoped paid pilot if positioned as a **sandbox/manual-approval operating system** for education centers. It is not ready for unsupervised real connectors, autonomous outbound messaging, or broad self-serve SaaS launch until lint/test debt, RBAC coverage, billing flow, and environment isolation are closed.

## 1. Product clarity

EduOS is clearest when sold as: **CEO operating dashboard + CRM/workspace + AI draft assistant for Zalo/Fanpage-heavy education centers**.

Do not sell it as autonomous Zalo automation yet. The winning pilot promise should be visibility, fewer missed leads, controlled task follow-up, safer AI drafts, and finance/debt awareness.

## 2. Problem-solution fit

Strong fit for Vietnamese language/English centers that currently operate through Zalo, Facebook, Excel, and manual reminders.

Most valuable modules for pilot:
- CEO Dashboard
- CRM Command Center / Sales Calling
- Workspaces
- Finance debt follow-up drafts
- Team Inbox / approval queue / safety center

Risk: too many modules can make onboarding feel broad. Pilot should start with 3 workflows only: lead follow-up, task ownership, tuition/debt visibility.

## 3. Market and competition

Competitive edge is local workflow specificity: Zalo/Fanpage, Vietnamese center operations, parent communication, tuition renewal, and AI safety controls.

Weakness versus mature LMS/CRM tools: incomplete production QA, no polished billing/subscription enforcement yet, and many demo/sandbox surfaces.

## 4. Monetization and business model

Recommended pilot pricing:
- Setup: 5-15M VND depending on import/training complexity.
- Monthly pilot: 3-8M VND/month for 4-8 weeks.
- Real connector add-ons must be separately scoped and priced.

Do not make real automated sending part of base pilot. Keep it as a future enterprise add-on after consent, safety, and technical gates.

Critical monetization fix applied: billing upgrade API now requires OWNER/ADMIN instead of allowing any logged-in user to activate a tenant.

## 5. Go-to-market

Best ICP: 100-800 active students, 3-20 staff, owner-led, using Zalo/Facebook/Excel heavily.

Sales angle: "Owner sees what is slipping today: missed leads, late tuition, staff workload, parent complaints. AI drafts help staff move faster but do not send without control."

Pilot no-go conditions:
- Customer demands personal Zalo scraping.
- Customer refuses consent/data-processing terms.
- Customer expects autonomous AI sending immediately.
- No owner champion.

## 6. Technical audit

Fixed in this pass:
- Web typecheck blockers from stale lead stage enum mapping.
- Sales actions now map to current Prisma `LeadStage`: `WAITING_TRIAL`, `TRIALED`, `REGISTERED`, `NO_NEED`, `NOT_POTENTIAL`.
- Finance workspace tab type now matches actual tabs.
- Worker BullMQ v5 type issue fixed by using plain Redis connection options.
- Fastify upgraded to 5.8.5, BullMQ to 5.78.0, Next to 16.2.7.
- AI package rebuilt so API no longer uses stale `WON` enum in dist.
- DB package lead-stage references now use current `REGISTERED` terminal status instead of stale `WON` enum.
- AuditLog schema now has tenant/date and tenant/action/date indexes plus a migration for faster filtering/export.
- Added pilot deployment checklist, data policy draft, and customer-facing known limitations document.

Verification:
- `npm run typecheck --workspace=@eduos/web`: pass.
- `npm run typecheck --workspace=@eduos/shared`: pass.
- `npm run typecheck --workspace=@eduos/ai`: pass.
- `npm test --workspace=@eduos/shared -- --runInBand`: pass, 158 tests.
- `npm test --workspace=@eduos/api -- --runInBand`: pass, 37 tests.
- `npm run build --workspace=@eduos/api`: pass.
- `npm run build --workspace=@eduos/worker`: pass.
- `npm run typecheck --workspace=@eduos/worker`: pass.
- `npm run typecheck --workspace=@eduos/db`: pass.
- `npm run lint --workspace=@eduos/web`: pass with warnings.
- Targeted ESLint on the files changed in the final UI pass: pass with 16 warnings, all remaining warnings are pre-existing-style `any`/quote warnings in demo-heavy components.
- Targeted ESLint for request-security and audit-log changes: pass with 0 errors.
- Pilot dry-run smoke for owner critical pages: pass on desktop and 390px mobile with no console/page errors and no body-level horizontal overflow.
- Audit CSV export dry-run: pass, `200 text/csv`.
- Teacher RBAC dry-run against OWNER/ADMIN-only AI knowledge API: pass, `403 Forbidden`.
- Local `.env` readiness check: `DATABASE_URL` and `JWT_SECRET` are present; `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and `AUDIT_LOG_RETENTION_DAYS` are not present locally and must be set in staging/production.
- Web production artifacts were generated under `apps/web/.next`, but the shell output did not return a clean final route summary.

Remaining technical debt:
- Web lint is no longer a hard blocker, but still has many warnings, mostly `any`, unescaped quote lint, and old demo-code cleanup.
- Web build output should be captured cleanly in CI/staging; local shell output in this environment cuts off after TypeScript even though artifacts are generated.

## 7. Security and compliance

Fixed in this pass:
- Replaced per-file JWT fallback secrets with a shared runtime helper.
- Production now throws if `JWT_SECRET` is missing at auth runtime.
- Register now sets the same `session_token` cookie used by the app.
- Login now verifies real bcrypt password and active tenant membership instead of accepting demo email only.
- Next.js 16 `src/proxy.ts` added for route protection; removed obsolete `middleware.ts` path.
- Lead CSV import no longer trusts client-supplied `x-tenant-id`; tenant is derived from signed session.
- Lead CSV import now limits file size, accepts CSV only, normalizes headers, and creates `LeadSource` correctly.
- Cookie-authenticated mutation APIs now enforce same-origin checks in production and use shared Upstash Redis REST rate limits when configured.
- Production rate limiting now fails closed with `503` if the shared rate-limit store is missing/unavailable, unless `ALLOW_IN_MEMORY_RATE_LIMITS=true` is explicitly set.
- Login/register now have IP/email rate limits; register normalizes email, enforces minimum password length, and avoids duplicate tenant slug failures.
- Settings staff/channel/class mutation APIs now require OWNER/ADMIN.
- Staff creation now rejects invalid roles and short passwords.
- Settings channel/class/import/AI knowledge/billing mutations now have basic payload-size/rate guards.
- Added shared `requireRole`/`requireAuthenticated` helpers for server-side RBAC.
- AI knowledge create/delete now requires OWNER/ADMIN and validates tenant ownership before delete.
- Lead, finance, teacher attendance, student progress note, and legacy sales server actions now enforce server-side role/tenant checks.
- Legacy sales calling no longer trusts client-supplied `saleId`; the actor comes from the signed session.
- Mock outbox actions no longer hardcode `server-tenant-id`; sandbox items/events now use the signed tenant/user.
- Audit logs are now written for tenant registration, staff creation, channel changes, billing upgrade simulation, class creation, lead CSV import, AI knowledge create/delete, lead mutations, finance reminders/expenses, attendance changes, student progress notes, and sandbox outbox create/transition.
- Audit log UI now supports category/date/action/entity filters, summary counters, CSV export, and an explicit retention policy note.
- AI add-on catalog defaults no longer claim real-send `AUTO`; risky add-ons require review/draft modes.

Remaining security/compliance work before broad production:
- Add double-submit CSRF tokens or equivalent if third-party embedded contexts are introduced.
- Complete a second-pass RBAC review for lower-traffic/reporting endpoints and any future server actions.
- Ensure staging/pilot/prod databases are physically separated.
- Formalize consent, data deletion, export, and retention policies.

Dependency audit:
- High vulnerabilities from Fastify/fast-uri and BullMQ/uuid were removed by upgrades.
- `npm audit --omit=dev` still reports 2 moderate advisories through Next/PostCSS, with npm suggesting an invalid downgrade to `next@9.3.3`; do not apply that force fix.

## 8. UX/UI audit

Fixed in this pass:
- Login no longer hangs on "Dang dang nhap" after successful auth; it performs hard navigation to `/dashboard`.
- Mobile dashboard layout no longer shifts off-screen. Root cause was sidebar `relative` overriding `fixed` on mobile.
- Sidebar, dashboard KPI cards, workspaces index, CRM overview, finance workspace, Leads CRM action/detail layout, AI Center, AI Knowledge, and AI command bar were toned down from demo/marketing styling toward quieter operational UI.
- CRM now displays an explicit demo-data banner when the tenant has no real leads and fallback sample leads are shown.
- Finance and AI Center no longer use large dark gradient hero sections on priority pilot screens.
- Leads detail now opens as a fixed drawer on mobile instead of forcing an extra fixed-width column into the table layout.
- Removed several unused imports/state variables from touched UI files to reduce lint noise.

Browser verification:
- Login to dashboard succeeds with seed account.
- Desktop dashboard renders with no Next error overlay.
- Mobile dashboard renders at 390x844 without horizontal overflow or console errors.
- Dashboard chart containers now render after measuring a real width, removing Recharts width/height console warnings during login/dashboard smoke tests.
- RBAC smoke test: `teacher1@omlis.test` can login but receives `403 Forbidden` when posting to OWNER/ADMIN-only AI knowledge API.
- Playwright smoke for `/crm-command-center`, `/workspaces/finance`, `/leads`, and `/ai-center` on desktop and 390px mobile: no console errors, no page errors, and no body-level horizontal overflow.
- AI Center re-smoke after removing the command-bar orb: desktop has no overflowing elements; mobile only reports the intentionally hidden off-canvas sidebar while body overflow remains false.
- Audit log page smoke: `/settings/audit-log?category=ai` renders without console/page errors or body-level horizontal overflow; CSV export route returns `200` with `text/csv`.
- Pilot dry-run screenshots saved for dashboard, CRM, Leads, Finance, AI Center, and Audit Log across desktop/mobile.
- Screenshots saved in `output/playwright/`.

Remaining UX risk:
- Some lower-priority screens still use gradient/orb styling and should be normalized after pilot-critical workflows.
- Several mobile cards outside the latest smoke set may still have cramped alert text/buttons; usable now, but should be tightened before customer training.
- Some Vietnamese strings appear mojibake in source/terminal; browser rendered the core UI correctly in QA, but source encoding should be normalized later.

## 9. Growth and retention

Retention loop should be weekly owner review:
- Lead SLA dashboard.
- Overdue tuition/debt queue.
- Staff task completion.
- Parent complaint/risk queue.
- AI draft approval volume.

Add pilot success metrics to the app or weekly report: response time, stale lead reduction, overdue task reduction, tuition follow-up completion, active staff usage.

## 10. Full verdict

Ship recommendation: **pilot only, with guardrails**.

Must keep disabled for pilot:
- Real Zalo outbound sending.
- Personal Zalo scraping.
- Private inbox scraping.
- Autonomous AI send.
- Real payment/banking mutation.

Top remaining blockers before broader launch:
1. Separate staging/pilot/prod databases and verify environment variables per environment.
2. Formalize consent, data deletion, export, and retention policies.
3. Add CSRF token hardening if embedded/cross-origin contexts are introduced.
4. Reduce demo-only UI copy, source mojibake, and tighten lower-priority mobile cards for field use.
5. Clean remaining web lint warnings enough to make CI stricter again.
