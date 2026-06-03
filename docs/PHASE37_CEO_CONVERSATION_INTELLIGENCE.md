# Phase 37: CEO Conversation Intelligence

## Overview

Phase 37 builds upon the foundation of conversation redaction, tagging, and message guardrails to provide center Owners and Admins a bird's-eye operational summary. It directly answers the CEO's critical daily question: **"Hôm nay có vấn đề gì cần xử lý không?"** by aggregating risks and opportunities derived deterministically from existing Zalo/Facebook messages, pending AI drafts, follow-ups, and timelines.

## What Was Added

### 1. Helper Logic (`ceoConversationIntelligence.ts`)
Created `packages/shared/src/lib/ceoConversationIntelligence.ts` which provides:
- Aggregation of Timeline Events (Phase 36) and Conversation Analyses (Phase 33).
- Safe grouping of risks into actionable categories such as `PARENT_COMPLAINT`, `UNANSWERED_LEAD`, `AI_DRAFT_PENDING`.
- Deterministic calculation of an `overallStatus` (`OK` | `NEEDS_ATTENTION` | `URGENT`) based on metrics like the number of negative sentiments, overdue follow-ups, or unattended leads.
- Fully tested in `packages/shared/src/tests/ceo-conversation-intelligence.test.ts` across 10 critical requirements (e.g. correct redaction of API keys, deterministic behavior, proper Vietnamese suggestions).

### 2. UI Components
- **`CEOConversationIntelligenceCard.tsx`**: A dashboard card designed specifically for the `OWNER`/`ADMIN` role. It uses large action-oriented sections instead of dense data tables to highlight what needs immediate attention.
- **`dashboard/page.tsx`**: Integrated the new CEO Intelligence card at the top of the dashboard utilizing mocked real-world data points and the `isPreview` flag to clearly identify it as a "Bản xem trước từ dữ liệu hiện có".
- **`AiCommandBar.tsx`**: Updated the prompt pills in the AI Command Center to explicitly suggest CEO-oriented questions like "Hôm nay có tin nhắn nào cần xử lý gấp không?", "Phụ huynh nào đang không hài lòng?", "Lead nào chưa được phản hồi?", "Học viên nào có nguy cơ nghỉ?".

## Safety & Architectural Constraints Maintained

- **Role Boundaries (RBAC):** 
  - `/dashboard` remains strictly restricted to `OWNER` / `ADMIN` via `canAccessRoute`.
  - The CEO Intelligence card is not visible to roles like `SALE` or `TEACHER` who might otherwise see tenant-wide private complaints.
- **Data Safety:** 
  - `redactSensitiveInfo` ensures raw PII (passwords, OTPs, API keys, phone numbers) is proactively redacted before it's displayed as a safe summary.
  - No raw private message bodies are blindly displayed on the dashboard without passing through the safe summarization logic.
- **No External API / LLM / Auto-Send:** 
  - All intelligence generation is entirely deterministic based on local database states. No live LLMs or external services are called to generate the summaries. 
  - No messages or tags are automatically sent or applied.
- **No Schema Changes / Migrations:** 
  - Relies completely on existing `timelineEvents`, `conversationAnalyses`, and standard Prisma aggregate queries.

## Known Limitations

- Currently relies on manually constructed mock events to populate the `dashboard` UI for demonstration.
- Needs the final Phase 38 Approval-Send bridge to connect the "AI_DRAFT_PENDING" alerts directly to actionable approval workflows in the inbox.

## Next Phase Recommendation

Proceed to Phase 38 to finalize the Messaging AI Roadmap: building the Approval-Send Bridge and completing the full transition from AI draft creation to final CEO approval and execution.
