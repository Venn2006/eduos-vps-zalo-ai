# EduOS Data Policy Draft

Status: draft for paid pilot. This is an operational template, not legal advice. Review with legal counsel before broad production launch.

## 1. Scope

This policy applies to EduOS pilot tenants using the following controlled modules:

- Owner dashboard.
- CRM and lead follow-up.
- Team inbox/sandbox message workflow.
- Finance/debt visibility and draft reminders.
- AI Center and AI knowledge base.
- Audit log and CSV export.

During pilot, EduOS is positioned as a **manual-approval operating system**. AI may draft, summarize, classify, and suggest actions. AI must not autonomously send real outbound messages unless a separate written connector agreement is signed.

## 2. Data Categories

EduOS may process these categories for a pilot tenant:

- Tenant data: center name, tenant ID, subscription/trial status, settings.
- User data: email, role, status, password hash, session metadata.
- Staff data: name/email/role/status and assigned workflow records.
- Lead data: student/parent name, phone, source, stage, notes, activities.
- Student/class data: class, course, attendance, progress notes, care risk signals.
- Finance data: tuition status, debt amount, reminder drafts, expense/payment metadata.
- AI knowledge data: uploaded/manual policy, pricing, FAQ, scripts, and internal notes.
- Audit data: actor, action, entity type/id, timestamps, before/after/metadata JSON.

EduOS should not intentionally collect highly sensitive data unless explicitly required and approved by the tenant.

## 3. Pilot Processing Purposes

Data is processed for:

- Lead follow-up and conversion tracking.
- Staff task ownership and operational visibility.
- Tuition/debt follow-up visibility and draft reminder creation.
- AI-assisted drafting, summarization, and knowledge retrieval.
- Security, auditability, abuse prevention, and incident investigation.
- Product support and pilot success reporting.

Data must not be sold or reused for unrelated advertising.

## 4. Consent And Customer Responsibilities

Before importing real parent/student data, the pilot customer should confirm:

- They have a lawful basis or consent to upload/process the data in EduOS.
- Staff accounts are assigned only to authorized personnel.
- Imported CSV files do not contain unnecessary sensitive information.
- Parents/students can request correction, deletion, or export through the center's process.
- AI-generated drafts require human review before use.

Recommended pilot consent statement:

> The center uses EduOS to manage consultation, class care, tuition follow-up, and internal operations. Data may be processed by AI tools to draft suggestions or summarize operational information, but messages are reviewed by authorized staff before being sent.

## 5. AI Use Policy

Allowed during pilot:

- Draft message suggestions.
- Summarize lead/student/finance context.
- Suggest next actions.
- Classify operational risk, such as stale lead or parent complaint.
- Search tenant-provided knowledge base content.

Not allowed during pilot without separate written approval:

- Autonomous real outbound send.
- Personal Zalo scraping.
- Private inbox scraping.
- Use of customer data to train a public/shared model outside tenant context.
- Making final decisions on refunds, billing, disciplinary action, or student status without human approval.

## 6. Access Control

Minimum pilot rules:

- OWNER/ADMIN can manage settings, staff, audit log, AI knowledge, and billing simulation.
- SALE can work assigned leads and sales workflows.
- TEACHER can manage relevant attendance/progress workflows.
- ACCOUNTANT can manage relevant finance workflows.
- Every sensitive mutation should use signed tenant/user context, not client-supplied tenant IDs.
- Shared accounts are discouraged.

## 7. Audit Logging

EduOS records audit logs for important tenant activity, including:

- Tenant registration.
- Staff creation and permission-sensitive changes.
- Channel/settings/class changes.
- Billing upgrade simulation.
- Lead import and lead mutations.
- AI knowledge create/delete.
- Finance reminders and expenses.
- Attendance and student progress notes.
- Sandbox outbox create/transition.

Current retention target: `AUDIT_LOG_RETENTION_DAYS=180` unless the tenant agreement specifies another value.

Operators can filter audit logs and export CSV from `/settings/audit-log`.

## 8. Retention

Suggested pilot defaults:

- Audit logs: 180 days minimum.
- Active tenant operational data: retained during active pilot/subscription.
- Deleted tenant export package: provide within an agreed support window if requested.
- Backups: retained according to infrastructure policy and purged on normal backup rotation.

If a customer requests deletion, record:

- Tenant ID.
- Requestor identity.
- Scope of deletion.
- Export requested before deletion: yes/no.
- Date/time completed.
- Operator who completed the action.

## 9. Export And Deletion Requests

Export request flow:

1. Verify the requestor is OWNER or authorized representative.
2. Export relevant tenant data and audit CSV.
3. Deliver through an agreed secure channel.
4. Log the export action.

Deletion request flow:

1. Verify the requestor.
2. Confirm whether an export is needed before deletion.
3. Disable tenant access if required.
4. Delete or anonymize tenant operational records according to the agreed scope.
5. Preserve legally required audit/security records if applicable.
6. Log completion.

## 10. Security Commitments

Current implementation commitments:

- Passwords are stored as hashes, not plaintext.
- Session cookie is HTTP-only and secure in production.
- Mutation APIs enforce same-origin protection.
- Production rate limiting requires a shared Redis REST store and fails closed if unavailable.
- Route access is protected by role-aware checks.
- CSV import derives tenant from signed session, not client headers.
- Audit log records important mutations.

Operational commitments:

- Do not share production credentials in chat/email.
- Use separate staging/pilot/prod databases.
- Rotate credentials after staff/vendor changes.
- Limit production DB access to authorized maintainers.
- Investigate suspicious audit log activity promptly.

## 11. Incident Response

If a suspected data incident occurs:

1. Disable risky connector/sandbox queue first.
2. Preserve audit logs.
3. Export affected audit log time range.
4. Identify tenant, users, actions, and affected data categories.
5. Notify the customer owner with known facts and mitigation steps.
6. Patch or disable the affected feature before re-enabling.
7. Record final incident notes and follow-up actions.

## 12. Pilot Customer Summary

Short version for customer-facing pilot docs:

EduOS helps the center manage leads, staff tasks, class care, finance follow-up, and AI-assisted drafts. During pilot, AI suggestions are for staff review and do not automatically send real messages. The system records important actions in an audit log, supports audit CSV export, and uses role-based access controls to limit who can see or change sensitive workflows.

## 13. Open Items Before Broad Production

- Legal review of this policy.
- Final data processing agreement template.
- Customer-facing deletion/export request form.
- Backup retention documentation.
- Subprocessor/vendor list.
- Incident notification SLA.
