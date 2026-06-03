# Phase 33: Messaging Intelligence Foundation

## Overview
This phase introduces the foundational AI intelligence layer for inbound Zalo and Fanpage conversations in EduOS. Rather than treating messages as a simple raw text log, EduOS now categorizes them into specific business-driven intents (e.g., Trial Booking, Parent Complaint, Tuition Question), assesses severity, and creates safe, PII-redacted summaries.

## Core Features
- **Conversation Intelligence Helper:** A deterministic mock classifier (`analyzeConversation`) at `packages/shared/src/lib/conversationIntelligence.ts` that acts as the blueprint for our upcoming AI engine.
- **Intent Detection:** Maps inbound text to strict business intents (`TRIAL_BOOKING_REQUEST`, `PARENT_COMPLAINT`, etc.) for safer role-scoped routing in the future.
- **Severity Scoring:** Automatically calculates risk (e.g., `CRITICAL` for complaints, `HIGH` for trial bookings).
- **PII Redaction (Safe Summary):** Phone numbers and explicit passwords/secrets are masked out of the `safeSummary` string (`[PHONE_REDACTED]`, `[REDACTED]`) before the data is ever stored in audit logs.
- **Audit Logging:** Introduced `CONVERSATION_CLASSIFIED` to safely log AI actions. Raw message bodies are **never** dumped into audit logs.

## Future Phases Context
- **Phase 34** will map these structured intents to automated AI UI tags in the CRM.
- **Phase 35** will build upon the severity/intent logic to add message quality guardrails for staff (preventing rude/incorrect replies).
- **Phase 37** will aggregate these intents into a CEO Dashboard (e.g., highlighting `CRITICAL` complaints today).

## Safety Notes
- This is a safe deterministic mock. No external LLM or API keys are required to execute this layer.
- **No auto-sending.** This foundation only reads and classifies. Sending will be handled in Phase 38 under strict human-approval pipelines.
- RBAC is preserved entirely. None of the AI analysis weakens the `canAccessRoute` permissions.
