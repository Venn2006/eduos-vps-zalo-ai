# Phase 26: Demo Seed Data Audit

## Objective
Ensure the existing `seed.ts` script securely and comprehensively prepares a dataset suitable for high-quality product demos without touching live production data or compromising PII.

## Current State Analysis
The current `packages/db/prisma/seed.ts` is thoroughly built and satisfies all demo requirements. It securely scopes all data to a single mock tenant (`Trung Tâm Ngoại Ngữ OMLIS`). 

### Sales Dataset
* **Leads:** Seeds 150 leads distributed across realistic stages (NEW, CONTACTED, QUALIFIED, BOOKED_TRIAL, ATTENDED_TRIAL, WON, LOST).
* **Call Attempts:** Randomly seeds call attempts and outcomes (NO_ANSWER, BUSY_CALLBACK, WRONG_NUMBER, INTERESTED, NOT_INTERESTED) for non-new leads.
* **Trial Bookings:** 30 trials mapped perfectly with 'CONVERTED', 'ATTENDED', and 'BOOKED' statuses.
* **Sources:** Included via LeadBatches ("Facebook Ads Campaign 1/2/3").

### Academic Dataset
* **Classes:** 8 classes (English, Chinese, Korean, IELTS, Kids).
* **Teachers:** 3 teachers mapped accurately.
* **Students:** 80 students with associated guardians.
* **Attendance/Homework:** Examples are fully generated (60 future sessions, 1 recent past session, 1 upcoming session) to trigger realistic UI states. Grades and AI drafts are included.

### Finance Dataset
* **Invoices:** 40 invoices generated.
  * 10 PAID
  * 10 PARTIALLY_PAID
  * 20 UNPAID (Debt Aging ready)
* **Renewals:** 15 renewal candidates with realistic remaining sessions and suggestions.
* **Debt Reminders:** 10 overdue reminders staged with Zalo drafts.

### Messaging & Connectors
* **Zalo:** Personal account bootstrapped in `OFFLINE` status to demonstrate the Connector Center. Generates 80 student/guardian Zalo identities with 1.0 confidence. Generates Zalo Groups with inbound/outbound mock chats.
* **Facebook Fanpage:** "OMLIS Official" page seeded with 3 realistic, multi-turn sales conversations and AI reply drafts.

### CEO / AI
* The dashboard has rich data to compute KPIs correctly.
* AI Drafts are populated across Fanpage messages, Debt Reminders, and Homework grading.

## Security & Privacy Compliance
* **No PII:** All names are generic (`Student 1`, `Teacher 2`, `Nguyễn Hương`).
* **Safe Phone Numbers:** Phone numbers use invalid/safe ranges (e.g., `0911111000`).
* **Tenant Isolation:** Every single record strictly implements `tenantId`.

## Conclusion
The current `seed.ts` is **fully compliant and demo-ready**. No code mutations or schema changes are required for Phase 26. To refresh the staging environment, simply run:
`npm run db:seed` (which invokes Prisma seed).
