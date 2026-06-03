# Phase 39: Messaging Intelligence Production Safety & Demo QA

## Tested Demo Flow
The following demo flow has been verified to be completely safe from production data mutations:
1. **CEO Dashboard**: Displays `AI theo dõi hội thoại hôm nay` with safe summaries (phone/OTP redacted).
2. **Fanpage Inbox**: CEO clicks actionable links to view conversations needing attention (e.g., `filter=HAS_DRAFT`).
3. **Inbox Draft Review**: User reviews AI suggestions and clicks "Duyệt nháp (Sao chép vào ô trả lời)".
4. **Composer**: The AI draft populates the text composer. The user must manually click Send to proceed. 
5. **Guardrail Validations**: The system explicitly warns "Cần nhân viên kiểm tra trước khi gửi. Không tự động gửi." 

## Browser QA Checklist
- [x] Dashboard actionable buttons route correctly (`/fanpage-inbox?filter=HAS_DRAFT`).
- [x] `FanpageInboxClient` safely filters drafts using the `HAS_DRAFT` flag.
- [x] Button explicitly labeled "Duyệt nháp (Sao chép vào ô trả lời)".
- [x] Auto-send is physically blocked; the AI output ONLY populates the manual input string state.

## RBAC Checklist
- [x] CEO Dashboard intelligence logic operates independently of any unsafe data mutation endpoints.
- [x] Timeline component and role scopes continue to respect non-admin visibility limitations.
- [x] No `canAccessRoute` logic was bypassed or weakened.

## PII Redaction Checklist
- [x] Vietnamese phone formats (`0912345678`, `+84 912 345 678`, etc.) are intercepted and replaced with `[SĐT BẢO MẬT]`.
- [x] OTP, API keys, tokens, and password phrases are replaced with `[BẢO MẬT]`.
- [x] Raw private message bodies are NOT stored in the permanent `AuditLog` metadata schema.

## Non-Production Confirmations
- **No Auto-Send:** Confirmed via strict regex check and component wiring (`setInputValue(activeConv.suggestions[0].suggestion)`).
- **Manual-Review-Only Explanation:** This implementation forces human-in-the-loop validation for all AI generations. The system proposes text, categorizes urgency, but relies 100% on a human staff member to physically review the text box and press send.
- **No Schema/Migrations added:** The database schema remains untouched.
- **No External API or Live LLM:** Operations rely strictly on deterministic dummy functions returning predefined `GuardrailCheckResult` and `CEORiskCard` objects.

## Known Limitations
- The underlying filter `NEEDS_REPLY` and `UNREAD` currently approximate logic for UI flow visualization.
- Draft creation logic is statically seeded rather than generated via a real LLM for now.
- `ZaloOutboxMessage` integration and webhook triggers are disabled for these demo pathways to ensure 0 risk of spam.

## Next Phase Recommendation
- **Phase 40**: Begin cautious integration with local, isolated LLM parsing (or mock LLM endpoint) for dynamic tag generation, followed by strict review. 

This environment is 100% safe to demo to investors or early adopters as a non-destructive Sandbox.
