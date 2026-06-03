# Phase 35: Message Quality Guardrails

## Overview

As part of the Messaging Intelligence roadmap, Phase 35 introduces deterministic, on-device checks to evaluate outgoing messages before they are sent to parents or students. This ensures that EduOS maintains a professional, polite, and safe communication standard while preventing privacy leaks.

## Key Features

### 1. Deterministic Rule Engine
We introduced `checkMessageQuality` in `@eduos/shared/src/lib/messageQualityGuardrails.ts`, which performs regex and keyword-based checks without relying on external LLM APIs (improving latency and reliability).

### 2. Multi-Level Severity
Issues are flagged with varying severities, which map to clear UI components:
- **LOW / MEDIUM:** Suggestions (e.g. missing greeting). Status: `NEEDS_REVIEW`.
- **HIGH:** Missing politeness (e.g. rude tone). Status: `NEEDS_REVIEW` / `BLOCKED`.
- **CRITICAL:** Data leakage (phone numbers, OTPs, passwords) or strict policy violations (tuition info in a group chat). Status: `BLOCKED`.

### 3. Privacy & Safety Masks
If a message contains sensitive information such as a phone number or a password, the system automatically suggests a rewritten version with `[SĐT BẢO MẬT]` or `[BẢO MẬT]` placeholders to prevent accidental exposure, especially when AI drafts are generated.

### 4. UI Integration
A unified `GuardrailPreviewCard` component is embedded in:
- **Fanpage Inbox:** Checking AI-suggested responses before staff uses them.
- **Zalo Inbox:** Checking the staff's manual drafts directly inside the composer.
- **Sales Calling:** Checking suggested call scripts and ensuring the copy is safe for internal use.

## Technical Details

- **Test Coverage:** Extensive Jest tests (`message-quality-guardrails.test.ts`) ensure zero false positives/negatives for critical cases (like phone number matching, OTP leakage, etc).
- **No Schema Changes:** This phase adds no new database schema. It utilizes the existing `AuditAction` enum strings in the codebase.
- **Backward Compatibility:** All existing functionality remains unaffected. The system defaults to failing safe.
