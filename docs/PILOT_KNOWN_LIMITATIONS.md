# EduOS Pilot Known Limitations

Use this document with paid pilot customers so expectations are explicit before go-live. The current product is ready for a controlled pilot, not a broad autonomous automation launch.

## 1. Pilot Positioning

EduOS is provided during pilot as an operating system for center owners and staff:

- CRM visibility.
- Lead follow-up workflows.
- Staff task ownership.
- Finance/debt visibility.
- AI-assisted drafts and suggestions.
- Manual approval and audit trail.

EduOS is not positioned during pilot as a fully autonomous bot that sends messages or operates real connectors without staff approval.

## 2. AI Limitations

AI can:

- Draft suggested replies.
- Summarize lead/student/finance context.
- Suggest next actions.
- Search and use tenant-provided knowledge base content.
- Highlight possible risks such as stale leads or parent complaints.

AI cannot during pilot:

- Send real messages automatically.
- Make final billing/refund decisions.
- Replace owner/admin approval.
- Guarantee every suggestion is correct.
- Use missing or outdated center policies unless the tenant uploads them first.

All AI output should be reviewed by authorized staff before being used with parents, students, or staff.

## 3. Zalo/Fanpage Connector Limitations

Disabled or sandbox-only during pilot unless separately agreed in writing:

- Real Zalo outbound sending.
- Personal Zalo scraping.
- Private inbox scraping.
- Autonomous fanpage replies.
- Credential storage for unofficial connector workflows.

Allowed pilot usage:

- Manual import.
- Sandbox/mock outbox.
- Draft approval workflow.
- Internal CRM and task tracking.

## 4. Finance Limitations

Finance module during pilot is for visibility and staff workflow support:

- Tuition/debt overview.
- Draft reminder creation.
- Expense/payment metadata.
- Commission estimate views.

Not included during pilot unless separately scoped:

- Real banking mutation.
- Automatic reconciliation with bank accounts.
- Tax/accounting compliance reporting.
- Payroll execution.
- Legal invoice issuance.

Finance values should be verified by the center before acting on them.

## 5. Data And Import Limitations

Manual CSV import is supported, but pilot data quality depends on customer input.

Known constraints:

- Duplicate or malformed CSV rows may require cleanup.
- Missing phone/source/stage data can reduce CRM usefulness.
- Large historical imports should be scoped and tested in staging first.
- Customer must confirm they have consent/lawful basis to upload parent/student data.

## 6. Role And Permission Limitations

Role-based access control exists for critical workflows. During pilot, edge-case reporting screens and newly added modules should still be reviewed before enabling them for all staff.

Recommended pilot setup:

- OWNER: center owner only.
- ADMIN: trusted operations manager.
- SALE: sales/admissions staff.
- TEACHER: teaching staff.
- ACCOUNTANT: finance staff.

Avoid shared staff accounts.

## 7. Audit Log Limitations

Audit logs record important system events and support filtering/export. They are not a replacement for a full SIEM or legal archive.

Current pilot behavior:

- Audit log retention target defaults to 180 days.
- CSV export is limited to recent matching rows.
- Audit metadata is operational and may not include every field from every business object.

## 8. Availability And Support Limitations

Pilot support should be treated as high-touch founder/operator support.

Before broad production launch, the following should still be formalized:

- Support SLA.
- Incident notification SLA.
- Backup and restore documentation.
- Subprocessor/vendor list.
- Customer-facing data deletion/export request form.

## 9. Customer Acceptance Checklist

Before go-live, customer should acknowledge:

- [ ] AI suggestions require staff review.
- [ ] Real autonomous sending is disabled.
- [ ] Zalo/Fanpage real connector is not part of base pilot.
- [ ] Finance screens support operations but do not replace accounting verification.
- [ ] Customer is responsible for lawful data upload and consent.
- [ ] Pilot success will be measured by workflow metrics, not fully automated operation.

## 10. Safe Pilot Promise

The safe promise is:

> EduOS helps the owner and team see what is slipping, organize follow-up work, and use AI to draft or summarize faster while keeping humans in control.

Do not promise autonomous real-send automation until connector, consent, compliance, and incident-response gates are completed.
