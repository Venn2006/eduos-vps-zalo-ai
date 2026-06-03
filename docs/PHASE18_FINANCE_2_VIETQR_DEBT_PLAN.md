# Phase 18: Finance 2.0 / VietQR / Debt Aging Plan

## 1. Current Finance Models Audit
* **Invoice:** Contains `totalAmount`, `paidAmount`, `remainingAmount`, `dueDate`, and `status`. Supports debt aging perfectly without schema changes.
* **Payment:** Represents actual payments against an invoice, including method (CASH, VIETQR, etc.) and `amount`.
* **DebtReminder:** Tracks AI drafts and approval states for sending debt collection notices via Zalo/SMS.
* **RenewalCandidate:** Flags students nearing the end of their sessions for upsell/renewal pipelines.
* **Student:** Related to all invoices, ensuring tenant scoping.

## 2. Finance 2.0 Target
* **VietQR Reconciliation:** Automatically match incoming webhook payments to Invoices using transaction memo codes.
* **Debt Aging:** Visualize accounts receivable based on how far past `dueDate` an unpaid invoice is.
* **Overdue Tuition:** Specific AI alerts when tuition drops below required thresholds.
* **Renewal Pipeline:** Manage `RenewalCandidate` records in a Kanban-style view.
* **Revenue Analytics:** Pivot revenue by class, course, and sales representative.
* **Safe AI:** Generate payment reminder drafts (`DebtReminder`), but NO auto-send without explicit OWNER/ACCOUNTANT approval.

## 3. Debt Aging Design (Read-Only Foundation)
We will add a non-intrusive UI section to `/workspaces/finance`.
It calculates the following buckets for all `status = UNPAID` or `PARTIALLY_PAID` invoices:
* **Hiện tại (Current):** `dueDate >= today`
* **Quá hạn 1-7 ngày:** `dueDate` is 1 to 7 days in the past.
* **Quá hạn 8-14 ngày:** `dueDate` is 8 to 14 days in the past.
* **Quá hạn 15+ ngày:** `dueDate` is 15 or more days in the past.

The UI will use simple, friendly cards indicating both the *count* of invoices and the *total remaining amount* in that bucket. It is explicitly read-only.

## 4. Safety Constraints
* **No SALE/TEACHER access:** The `/workspaces/finance` page is protected.
* **No auto-send:** Debt reminders are purely conceptual drafts at this stage.
* **No payment mutation:** This phase introduces zero `prisma.payment.create` or `prisma.invoice.update` calls.
* **Tenant-scoped:** All queries aggressively filter by `tenantId`.
