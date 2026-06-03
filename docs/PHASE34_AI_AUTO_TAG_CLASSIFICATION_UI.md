# Phase 34: AI Auto Tag & Conversation Classification UI

## Overview
This phase introduces the visual presentation layer for the conversation intelligence established in Phase 33. We created reusable UI components to surface AI intent classification, severity, safe summaries, and suggested tags directly within the inbox and CRM workflows.

## What UI Was Added
1. **`ConversationIntelligenceCard` Component**
   - A reusable React component (`apps/web/src/components/conversation/ConversationIntelligenceCard.tsx`) designed to display the `IntelligenceResult`.
   - Utilizes translated Vietnamese labels (`Lead mới`, `Khẩn cấp`, etc.) for seamless adoption by center staff.
   - Distinctly marked as "Gợi ý AI (Read Only)" to clarify that it does not make unilateral decisions.

2. **Fanpage Inbox Integration**
   - Injected the `ConversationIntelligenceCard` directly into `apps/web/src/app/fanpage-inbox/FanpageInboxClient.tsx` right above the AI Draft Area.
   - Generates intelligence dynamically based on the aggregated transcript of the selected conversation.

3. **Zalo Inbox Integration**
   - Replaced the hardcoded AI Panel in `apps/web/src/app/zalo-inbox/page.tsx` with the real `ConversationIntelligenceCard`.
   - Uses the deterministic AI helper on the mock Zalo message thread.

4. **Sales Calling Preview**
   - Added an AI Tag Preview section to the Lead detail card in `apps/web/src/app/workspaces/sales/calling/page.tsx`.
   - Shows how tags derived from chat context will look on the telesales interface.

## Core Safety Constraints (Confirmed)
- **Data is Real-time Mock / Derived:** The UI dynamically derives classification using the safe deterministic helper on existing transcript data. It does not hit an external API or LLM.
- **Tags are Suggestion-Only:** No tags are written to the database (`TAG_APPLIED` is not implemented). They are purely visual suggestions.
- **No Auto-Send:** The system maintains a strict draft/suggestion boundary.
- **No Schema Changes:** Zero modifications to `prisma.schema`.
- **No DB Push / Migrations:** No migrations were generated or run.
- **RBAC Boundaries:** 
  - The AI suggestions only render inside routes already protected by the `canAccessRoute` helper (e.g. `OWNER`/`ADMIN` for general inbox, `SALE` for sales workspace).
  - No new bypasses were introduced.

## Known Limitations
- The underlying `analyzeConversation` helper is currently deterministic (regex/keyword based) and not an LLM. It serves as a structural foundation.
- "Zalo Inbox" still relies partially on static mock data while waiting for real Webhook integration.

## Next Phase Recommendation
Proceed to **Phase 35: Message Quality Guardrails**, where we will use this same classification foundation to evaluate outbound drafts (preventing staff from sending rude or incorrect information) and logging quality scores.
