# Phase 21: Production Deployment Runbook

## 1. Production Architecture Overview
EduOS is built to run reliably for language centers with a modern, decoupled architecture:
* **Web App (Next.js):** Hosts the frontend UI and secure API routes. Typically deployed on Vercel or a self-hosted Node.js server.
* **API App (Next.js/Node):** Handles core background processing and webhooks (often merged with the Web App for simplicity in early deployments).
* **Database (PostgreSQL via Prisma):** Relational database storing all tenant, user, lead, and operational data.
* **Zalo VPS Connector:** A separate hardened service running Appium/automation scripts on an Android environment to act as the Zalo personal bridge.
* **Fanpage Webhook:** Secure API endpoints exposed to receive real-time Facebook Messenger events.
* **AI Center:** Role-scoped intelligence layer. Currently mock/simulated; future integration requires secure API key management (e.g., OpenAI/Anthropic).
* **Worker / Outbox (Future):** Dedicated background jobs for sending queued messages and emails safely with rate-limiting.
* **Connector Health Center:** Internal monitoring module to check heartbeat and token validity of Zalo and Fanpage connections.

## 2. Environment Variables Checklist
Ensure the following variables are securely configured in your production environment. **Do not commit actual secrets to source control.**

* **Database:**
  * `DATABASE_URL`: Connection string for PostgreSQL.
* **Security & Auth:**
  * `JWT_SECRET` / `SESSION_SECRET`: Strong cryptographic keys for signing sessions.
* **Integrations:**
  * `FACEBOOK_APP_SECRET`: Used to verify incoming webhook signatures.
  * `FACEBOOK_VERIFY_TOKEN`: Used during the initial webhook setup handshake.
  * `ZALO_VPS_TOKEN` / `ZALO_API_SECRET`: Tokens for authenticating with the Zalo VPS bridge.
  * `AI_PROVIDER_KEY` (Optional): API key for external LLM providers when live AI is activated.
* **Application Config:**
  * `NEXT_PUBLIC_APP_URL`: Base URL of the application.
  * `NODE_ENV`: Should be explicitly set to `production`.

## 3. Deployment Steps
1. **Install Dependencies:** Run `npm ci` to ensure reproducible builds from the lockfile.
2. **Verify Environment Variables:** Check that all required secrets are loaded into the production environment (e.g., Vercel dashboard or `.env.production`).
3. **Typecheck & Test:** Run `npm run typecheck` and `npm run test` to catch regressions.
4. **Build:** Run `npm run build`.
5. **Database Migration:** If there are approved schema changes, run `npx prisma migrate deploy`. **Do not run `db push` in production.**
6. **Seed Data:** Run seed scripts only if deploying a demo/sandbox environment.
7. **Deploy App:** Deploy the built Next.js application.
8. **Configure Webhooks:** Update the Facebook App Dashboard with the production webhook URL and verify token.
9. **Configure Zalo Connector:** Start the VPS connector and pair it with the production API endpoint.
10. **Post-Deployment Verification:** Log in with an OWNER account, verify RBAC works for lower roles, and check connector health statuses.

## 4. Backup and Rollback
* **Database Backups:** Ensure automated daily backups are configured in your PostgreSQL provider (e.g., Supabase, RDS). Take a manual snapshot before major releases.
* **Restore Plan:** Test restoring from a snapshot in a staging environment quarterly.
* **Git/Vercel Rollback:** If a deployment introduces critical bugs, use the Vercel dashboard (or your hosting platform) to instantly revert to the previous successful deployment.
* **Connector Rollback:** If the Zalo VPS script breaks due to a Zalo app update, pause outbound message processing and revert the VPS script to a stable version.
* **Webhook Failure:** If Facebook webhooks fail, ensure the app responds with 200 OK gracefully to prevent Facebook from disabling the webhook entirely.

## 5. Monitoring
* **App Health:** Monitor via Vercel Analytics or standard Node.js APM tools.
* **Connector Heartbeat:** Check the `/settings/connectors` dashboard for "Healthy" status.
* **Failed Events:** Monitor API logs for 4xx/5xx responses on the `/api/webhooks/*` routes.
* **Outbox Failures:** (Future) Alert on messages stuck in the "PENDING" or "FAILED" state for > 15 minutes.
* **Slow Queries:** Monitor database performance for queries taking > 500ms.
* **Error Logs:** Centralize server logs for quick debugging.

## 6. Security Checklist
* [x] Database is not publicly accessible (restrict IP ranges).
* [x] Connectors use secure, authenticated endpoints; no direct DB writes.
* [x] No `.env` files or secrets are committed to the Git repository.
* [x] All incoming webhooks validate cryptographic signatures (e.g., SHA256 HMAC for Facebook).
* [x] `tenantId` isolation is strictly enforced in all database queries.
* [x] RBAC authorization checks are implemented at the server/route level.
* [x] (Future) Sensitive actions are recorded in an Audit Log.

## 7. Go-Live Checklist for First Center
* [ ] Create Tenant record in database.
* [ ] Create initial OWNER/ADMIN user accounts.
* [ ] Assist center in creating staff accounts (SALE, TEACHER, ACCOUNTANT).
* [ ] Import initial data (Leads, Students, Classes) via safe import scripts/UI.
* [ ] Pair Zalo personal account via VPS Connector.
* [ ] Configure Fanpage webhook connection.
* [ ] Perform manual role testing (log in as Sale, verify limited access).
* [ ] Verify that no auto-send features are prematurely activated.
