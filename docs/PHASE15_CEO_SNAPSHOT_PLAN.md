# Phase 15 CEO Snapshot Plan

## 1. Proposed Future Model: `DailyCenterSnapshot`
In the future, we will materialize daily metrics into a discrete table to speed up dashboard loads and provide historical trend analysis.
Proposed fields:
* `tenantId`
* `date`
* `newLeads`
* `callsToday`
* `bookedTrialsToday`
* `followUpsCreatedToday`
* `trialsToday`
* `paidAmountToday`
* `overdueDebt`
* `activeStudents`
* `absentStudentsToday`
* `pendingAiDrafts`
* `connectorHealthSummary`

**Note:** We are explicitly NOT creating this schema in Phase 15.

## 2. Why a Snapshot Helps
* **Faster dashboard:** Reading from a consolidated payload instead of running 10 heavy JOINs.
* **Better AI evidence:** The AI Center can quickly injest a daily snapshot to answer "Hôm nay có vấn đề gì nghiêm trọng không?".
* **Less scattered logic:** Centralizes the core KPIs that matter to the OWNER/ADMIN.
* **Historical trends:** Materializing this daily (in the future) allows easy week-over-week reports.

## 3. Phase 15 Implementation
In this phase, we are building a purely **computed, read-only helper** (`ceoSnapshot.ts`).
It dynamically queries existing raw tables (Lead, CallAttempt, FollowUpTask, TrialBooking) to generate the snapshot object on the fly.
It operates under strict `tenantId` boundaries and is surfaced exclusively to `OWNER` and `ADMIN` roles on the `/dashboard` route.
