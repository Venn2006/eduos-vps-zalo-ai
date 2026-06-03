# Phase 38: Approval-to-Manual-Review Bridge Foundation

This phase establishes the foundational bridge between the CEO dashboard alerts and the operational inbox without enabling any automatic sending. 

## Scope
- Added `actionUrl` and `actionLabel` to CEO Intelligence risk cards.
- Linked `AI_DRAFT_PENDING` alerts to `/fanpage-inbox?filter=HAS_DRAFT`.
- Filtered the fanpage inbox natively to conversations with drafts via `HAS_DRAFT`.
- Hooked up the "Duyệt nháp" (Approve Draft) button to safely **copy the approved draft into manual input**.

## Security & Guardrails Ensured
- **No Production Send:** The approval button strictly populates the text input box. The staff must still click send manually.
- **No Outbox Send / Connector Send:** No `zaloOutboxMessage` or external connector integrations were invoked.
- **No Delivery Status or `MESSAGE_SENT` Audit:** Because no messages are sent by this automated UI, no false audit logs are generated.
- This is strictly a **safe pre-send foundation**. 

All prior RBAC and PII redaction guardrails remain fully intact.
