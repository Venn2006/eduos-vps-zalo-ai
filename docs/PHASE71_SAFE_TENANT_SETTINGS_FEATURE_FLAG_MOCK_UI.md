# Phase 71: Safe Tenant Settings / Feature Flag Mock UI

## Goal
Add mock tenant settings and feature flags UI.

## Implementation Details
1. Added a "Tenant Feature Flags" tab within `/settings/safety-center`.
2. Displayed feature flag mock cards:
   - REAL_SEND_ENABLED = false
   - CONNECTORS_ENABLED = false
   - LIVE_LLM_ENABLED = false
   - BANK_RECONCILIATION_ENABLED = false
   - SANDBOX_OUTBOX_ONLY = true
   - REQUIRE_ADMIN_APPROVAL_FOR_MONEY = true
   - REQUIRE_TEACHER_APPROVAL_FOR_GRADES = true
3. All toggles are disabled or operate as demo-only state in memory.
4. No env/config changes or real flags backend added.
