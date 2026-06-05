# Phase 82: Staging Environment Setup Plan

## 1. Executive Summary
This document outlines the detailed technical specifications and operational steps required to create a "Staging Environment" for EduOS. Staging is the final isolated environment mirroring Production. It will be used exclusively for the pilot dry-run, end-to-end (E2E) testing, and Center Owner QA before any real data or real APIs are touched in Production.

## 2. Goals & Strict Boundaries
- **Goal:** Validate the import scripts (Phase 81), RBAC policies, and connector stability without touching real user data.
- **Isolation Boundary:** Staging must use a completely separate Supabase project and Vercel project from Development and Production.
- **No Cross-Talk:** Webhooks from Zalo/Facebook Test Accounts must explicitly route to the Staging URL, ensuring no accidental pollution of the Development database.

## 3. Infrastructure Architecture

### 3.1. Database Layer (Supabase)
- **Project Name**: `eduos-staging`
- **Region**: Singapore (ap-southeast-1) to mirror Production latency.
- **Migration Strategy**: 
  - Strictly use `npx prisma migrate deploy` to apply migrations.
  - DO NOT use `npx prisma db push` in Staging, to enforce production-like strict schema evolution.
- **Security Check**: Apply Row-Level Security (RLS) on all tables (even if currently using application-layer checks) and restrict public API access.

### 3.2. Hosting Layer (Vercel)
- **Project Name**: `eduos-staging-web`
- **Branch**: Linked to a permanent `staging` branch (or configured to build from specific `release/*` branches).
- **Protection**: Vercel Protection bypass enabled. The Staging URL must be password protected so web crawlers and malicious bots do not index the pre-release pilot UI.
- **Build Command**: `npm run build`
- **Install Command**: `npm ci`

## 4. Environment Variables Map
A strict`.env.staging` template must be created and verified.

| Variable Name | Purpose | Staging Value Rule |
| :--- | :--- | :--- |
| `DATABASE_URL` | Transactional DB connection | Must point to `eduos-staging` pooler |
| `DIRECT_URL` | Migration DB connection | Must point to `eduos-staging` direct port |
| `NEXT_PUBLIC_APP_URL` | Base URL for the frontend | e.g. `https://staging.eduos.io` |
| `ZALO_APP_ID` | Zalo Mini App integration | Use a Zalo "Test App" ID, never Production |
| `ZALO_APP_SECRET` | Zalo App Secret | Use Test App Secret |
| `FACEBOOK_APP_ID` | Meta App ID | Use Meta "Test App" |
| `FACEBOOK_APP_SECRET`| Meta App Secret | Use Meta "Test App" Secret |
| `LLM_PROVIDER` | AI Agent Provider | Set to `MOCK` unless actively testing prompt latency |

## 5. Third-Party Connector Sandboxing

### 5.1. Zalo Official Account & VPS
- Create a distinct Zalo Official Account (OA) named "EduOS Demo Center".
- Link this OA strictly to the Zalo Test App.
- The Zalo VPS connector must run locally or on a separate staging VPS instance, pointing its API requests exclusively to `https://staging.eduos.io/api/...`

### 5.2. Meta / Facebook Fanpage
- Create a private Facebook Page "EduOS Staging Hub".
- Configure the Webhook URL in Meta App Dashboard to `https://staging.eduos.io/api/webhooks/facebook`.
- Verify the webhook signature logic exclusively with the Staging `FACEBOOK_APP_SECRET`.

## 6. Execution Plan & Sign-off Checklist

To promote EduOS to Staging, the engineering lead must execute and sign off on the following:

- [ ] **Step 1: Provision DB** - Create `eduos-staging` on Supabase. Save DB passwords securely in 1Password.
- [ ] **Step 2: Run Migrations** - Execute `npx prisma migrate deploy` locally pointing to Staging `DIRECT_URL`.
- [ ] **Step 3: Provision Hosting** - Create Vercel project, link repository, and input all Environment Variables.
- [ ] **Step 4: Webhook Bindings** - Update Zalo and Meta Developer Portals to point webhooks to Vercel Staging URL.
- [ ] **Step 5: Dry-Run Import** - Execute the Phase 81 Pilot Import script against the Staging DB.
- [ ] **Step 6: UI Smoke Test** - Log in as Pilot Owner. Verify data visibility, Role restrictions, and mock sending functionality.

## 7. Rollback & Teardown
If the pilot staging dry-run fails severely (e.g., severe data leak across tenants, failed migrations), the environment is considered disposable. We can pause Vercel deployments and wipe the `eduos-staging` database without impacting active development.

## 8. Next Recommended Phase
- Phase 83 — Customer Onboarding Forms and Consent Pack
