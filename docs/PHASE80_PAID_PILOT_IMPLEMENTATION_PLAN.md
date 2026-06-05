# Phase 80: Paid Pilot Implementation Plan

## 1. Executive summary
EduOS is currently ready for founder and internal demos. Moving to a paid pilot is a conditional, scoped phase designed to test the core operational value of EduOS in a real environment.
**Crucially, the first paid pilot will NOT include real automated sending, personal Zalo monitoring, banking mutation, or autonomous AI.**
The objective of this initial pilot is to prove value through operational visibility, workflow adoption, and measurable improvements in center management using manual or semi-automated (draft-only) workflows.

## 2. Ideal pilot customer profile
The ideal center for this initial pilot fits the following criteria:
- **Type**: Vietnamese English / language center.
- **Size**: 100–800 active students.
- **Staff**: 3–20 operational staff (managers, sales, teachers, admin).
- **Current Stack**: Relying heavily on Zalo, Facebook Messenger, Excel, and manual task delegation.
- **Pain Points**: Struggling with lead follow-up drop-off, hidden tuition debt, lack of staff workload visibility, and slow academic reporting.
- **Leadership**: The owner/founder is actively involved in daily operations and highly motivated to fix workflow bottlenecks.

## 3. Pilot scope
**Included Modules:**
- CEO Dashboard (Health metrics and visibility)
- CRM Command Center (Lead tracking and Kanban)
- Team Inbox / Zalo Hotline (Governance demo and manual mock workflow)
- Task Management (Delegation and tracking)
- Teacher / Học vụ Workspace (Attendance, classes, grading)
- Homework / Curriculum Workspace (AI drafting)
- Finance Workspace (Debt visibility and tuition follow-up drafting)
- Safety Center (Admin visibility and control)

**Explicitly Excluded (NO-GO):**
- Real Zalo outbound sending
- Personal Zalo account scraping
- Private inbox scraping
- Real Facebook connector integrations
- Real banking/payment mutation
- Autonomous AI sending
- Production background workers (until formally approved)
- Live LLM calls (unless separately approved and sandboxed)
- Production data import persistence (unless explicitly designed and approved later)

## 4. Pilot timeline
This is a standard 4–8 week pilot implementation plan.

* **Week 0: Qualification and scope confirmation**
  * Goals: Align expectations, sign scope, agree on boundaries.
  * Owner tasks: Review scope, sign agreement, identify pilot champion.
  * EduOS tasks: Provision staging tenant, draft data mapping.
  * Deliverables: Signed scope, provisioned tenant.
  * Risks: Misaligned expectations regarding "real Zalo" features.
* **Week 1: Data mapping and workflow setup**
  * Goals: Import sanitized initial data, map real workflows to EduOS.
  * Owner tasks: Provide sample sanitized data (CSV).
  * EduOS tasks: Clean and import data, configure roles.
  * Deliverables: Sanitized tenant populated with sample data.
  * Risks: Poor data quality, delays in receiving data.
* **Week 2: Staff training and demo workflows**
  * Goals: Train staff on manual workflows, assign first real tasks.
  * Owner tasks: Mandate staff attendance at training.
  * EduOS tasks: Conduct training, monitor initial login metrics.
  * Deliverables: Staff trained, initial tasks created.
  * Risks: Low staff engagement.
* **Week 3–4: Daily operational use**
  * Goals: Staff use EduOS daily for task management and CRM tracking.
  * Owner tasks: Review CEO dashboard daily, enforce usage.
  * EduOS tasks: Provide daily support, monitor adoption metrics.
  * Deliverables: 2 weeks of active usage data.
  * Risks: Staff reverting to old Excel/Zalo habits.
* **Week 5–6: Review metrics and adjust workflow**
  * Goals: Measure baseline vs. current performance.
  * Owner tasks: Participate in weekly review, gather staff feedback.
  * EduOS tasks: Generate metric reports, tweak workflows.
  * Deliverables: Mid-pilot performance report.
  * Risks: Lack of measurable improvement.
* **Week 7–8: Renewal/upgrade decision**
  * Goals: Finalize pilot evaluation, decide on long-term contract and connector roadmap.
  * Owner tasks: Review final ROI, make renewal decision.
  * EduOS tasks: Present end-of-pilot report, propose next steps.
  * Deliverables: End-of-pilot report, renewal contract.

## 5. Pilot onboarding checklist
- [ ] Signed pilot scope agreement (explicitly acknowledging exclusions).
- [ ] Tenant contact list provided.
- [ ] Role matrix defined and agreed upon.
- [ ] Sample lead list provided (sanitized).
- [ ] Sample student list provided (sanitized).
- [ ] Sample finance records provided (sanitized).
- [ ] Channel inventory completed (which Facebook/Zalo pages they use).
- [ ] Tenant consent statement signed.
- [ ] Internal Admin/Owner pilot champion assigned.
- [ ] Support contact/channel established.
- [ ] Success metrics formally agreed upon.
- [ ] Confirmed: Real connectors remain strictly OFF.

## 6. Pilot data handling
- **Import Strategy**: Prefer sanitized CSV/manual imports for the pilot duration.
- **Privacy**: No real parent/student phone numbers displayed unless explicit consent is provided and it is required for the workflow.
- **Masking**: Phone number and email masking must be enabled by default.
- **Credentials**: NO personal Zalo credentials will ever be collected.
- **Deletion**: Clear process defined for data deletion requests at the end of the pilot.
- **Separation**: Pilot database must be physically separated from dev/demo environments.
- **Backups**: Regular backups and rollback capabilities tested.
- **Export**: Guarantee that the tenant can export their data if they do not renew.

## 7. Success metrics
The pilot will be evaluated against the following criteria:
- **Response time improvement**: Decrease in time taken to follow up on new leads.
- **Forgotten lead reduction**: Percentage decrease in "stale" or dropped leads.
- **Overdue task reduction**: Decrease in tasks missing their SLA.
- **Owner visibility**: Consistent completion of weekly owner review meetings using the CEO Dashboard.
- **Tuition follow-up visibility**: Improved tracking of outstanding debt.
- **Staff workload visibility**: Ability for managers to balance task distribution.
- **Teacher report turnaround**: Faster generation of academic reports.
- **Admin time saved**: Estimated manual hours saved per week.
- **Adoption rate**: Percentage of staff actively logging in daily.
- **Qualitative feedback**: Positive feedback from the center owner and key staff.

## 8. Pilot operating rhythm
**Daily Routine:**
- Owner/Manager checks CEO Dashboard.
- Sales team checks Team Inbox and CRM Command Center.
- Manager assigns/re-assigns overdue tasks.
- Finance reviews debt alerts.

**Weekly Routine:**
- Owner review meeting (using EduOS dashboards as the single source of truth).
- Staff workload review.
- CRM pipeline review (Lead Kanban).
- Finance/debt review.
- Academic/homework progress review.

**End of Pilot:**
- Compare before/after metrics.
- Attempt to secure a customer testimonial.
- Formalize renewal decision.
- Decide on technical/legal readiness for unlocking real connectors.

## 9. Roles and responsibilities
- **EduOS Founder/Team**: Responsible for infrastructure, initial data import, training, technical support, and generating metric reports. Owns the pilot success tracking.
- **Center Owner/CEO**: Responsible for mandating staff adoption, providing feedback, attending weekly reviews, and the final renewal decision.
- **Manager**: Responsible for daily task delegation, monitoring staff SLAs, and ensuring data quality.
- **Sales Staff**: Responsible for moving leads through the CRM Kanban and completing follow-up tasks.
- **Teacher/Admin**: Responsible for marking attendance, tracking homework, and generating parent reports.
- **Finance Staff**: Responsible for tracking tuition debt and reviewing finance task queues.

## 10. Pricing and commercial structure (DRAFT)
*Note: Numbers are placeholders for founder adjustment.*
- **Paid pilot setup fee**: `[5,000,000 - 10,000,000 VND]` (Covers data import, training, and staging setup).
- **Monthly pilot fee**: `[2,000,000 - 5,000,000 VND/month]` for the 2-month duration.
- **Annual credit**: Pilot fees are credited toward the annual plan if they convert.
- **Extension**: Success-based extension option available.
- **Connector Add-ons**: Future real-connector integrations will be priced separately.
- **Customization**: Custom feature development priced separately.

## 11. Legal/safety boundaries
The following strict boundaries must be communicated to and acknowledged by the pilot tenant:
- **NO** personal Zalo scraping.
- **NO** private inbox scraping.
- **NO** collection of personal staff credentials.
- **NO** real automated sending without a subsequent, separate written approval.
- **NO** autonomous AI outbound messaging.
- **NO** banking or payment mutation.
- **NO** production workers executing background automation until explicitly approved.
- Tenant consent is required for data processing.
- Staff must be clearly informed that work channels are being managed via EduOS.

## 12. Pilot risk register
| Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|
| Staff adoption is low | High | High | Owner mandate, UX improvements, daily support. | Center Owner / EduOS |
| Data quality is poor (garbage in) | Medium | High | Require clean CSV templates; validate before import. | Center Manager |
| Owner expects "real Zalo" immediately | Medium | High | Clear communication in scope document. Reiterate focus on workflow first. | EduOS |
| Workflow is too complex for staff | Low | Medium | Simplify roles; focus only on core tasks during training. | EduOS |
| Mobile UX issues in the center | Medium | Medium | Complete Phase 73/77 mobile QA. Prioritize critical mobile fixes. | EduOS |
| Confusion between staging/prod DBs | Low | High | Strict infrastructure isolation (Phase 79). | EduOS |
| Connector scope creep | High | Medium | Defer all connector requests to post-pilot roadmap. | EduOS |
| Legal/consent ambiguity | Low | High | Require signed consent form before kickoff. | EduOS |

## 13. Go/No-Go gates
**GO to Pilot if:**
- Scope and pricing are signed.
- Clean, sanitized data is provided.
- Role matrix is agreed upon.
- Success metrics are agreed upon.
- Real send feature flags are definitively OFF.
- Real connectors are definitively OFF.

**NO-GO (Halt Pilot) if:**
- Customer demands personal Zalo scraping to proceed.
- Customer refuses to sign consent/disclosure forms.
- Customer expects fully autonomous AI sending immediately.
- The center lacks a strong owner/sponsor to drive adoption.
- No clean data sample can be provided.

## 14. Pilot deliverables
- Configured staging/pilot tenant environment.
- Documented role matrix specific to the center.
- Imported and sanitized sample data.
- Demo route checklist for staff training.
- Staff training notes and recordings.
- Weekly metric report template.
- Comprehensive end-of-pilot report.
- Post-pilot renewal and roadmap proposal.

## 15. End-of-pilot report template
The final report presented to the owner will include:
1. **Executive Summary**: Did the pilot succeed?
2. **Baseline vs. After**: Comparison of key metrics.
3. **Usage by Module**: Which features were used most?
4. **Outcomes**: Lead conversion, task completion, and finance visibility improvements.
5. **Staff Feedback**: Qualitative quotes from users.
6. **Owner Feedback**: Insights from the CEO.
7. **Gaps**: Missing features identified during the pilot.
8. **Recommended Next Package**: Annual plan proposal.
9. **Connector Feasibility**: Assessment of whether the center is ready for real connector integration.

## 16. Next recommended phase
- Phase 81 — Pilot Tenant Data Model Proposal
- Phase 82 — Staging Environment Setup Plan
- Phase 83 — Customer Onboarding Forms and Consent Pack
