# Phase 36: Parent/Student Unified Timeline Foundation

## Overview

Phase 36 introduces a safe, deterministic, and role-scoped timeline foundation for EduOS. Instead of merely storing raw chat messages like basic CRMs, EduOS synthesizes interactions—such as calls logged, lead creation, trial bookings, AI message drafts, and tuition payments—into a unified, friendly chronologic story of the parent/student journey.

## What Was Added

### 1. Timeline Builder Helper (`timelineBuilder.ts`)
Created `packages/shared/src/lib/timelineBuilder.ts` which provides:
- **Core Types:** `TimelineEventType`, `TimelineActorType`, `TimelineVisibilityScope`, `SafeTimelineEvent`.
- **`buildTimelineEvent`:** A standardized function that creates timeline entries, automatically resolving default visibility per event type (e.g., payment events are restricted to FINANCE and OWNER_ADMIN).
- **`filterTimelineForRole`:** Scopes the visible events dynamically based on the current user's role (SALE, TEACHER, ACCOUNTANT, OWNER, ADMIN).
- **`redactSensitiveInfo`:** Redacts PII including phone numbers and passwords/OTPs/API keys from the `rawSummary` to ensure the timeline can be safely displayed on screens that might be shared or recorded.

### 2. UI Component (`ParentStudentTimeline.tsx`)
Created `apps/web/src/components/timeline/ParentStudentTimeline.tsx` to display the safe timeline.
- Features intuitive `lucide-react` icons and conditional severity badges.
- Clean vertical line layout designed for scannability, avoiding dense table interfaces.
- Filters events natively before rendering using `filterTimelineForRole`.

### 3. Sales Calling Integration
Added a mock/derived preview of the timeline into `apps/web/src/app/workspaces/sales/calling/page.tsx`.
- Generates dynamic timeline nodes based on the `activeLead`'s creation date, last call attempts, and synthetic AI drafts.
- Prominently labeled with a badge indicating `"Bản xem trước AI từ dữ liệu hiện có"`.

## Safety & Architectural Constraints Maintained

- **No Schema / Migrations:** No changes were made to the database schema. The timeline is constructed virtually from existing relational data (e.g., `CallAttempt`, `Lead`, etc.) preventing complex multi-table migrations.
- **Role-Scoping:** The current route-based RBAC remains the primary authorization method. The timeline visibility rules act strictly as an extra layer of view filtering for timeline components.
- **No External API or Auto-Send:** Everything is derived deterministically from existing on-device data. No live AI, LLMs, or connectors were invoked.
- **Safe Rendering:** The raw PII (like `0912345678` or `password: 12345`) is automatically redacted into `[SĐT BẢO MẬT]` and `[BẢO MẬT]`.

## Known Limitations

- Timeline events currently generated in the Sales Calling preview are somewhat mocked/derived rather than pulled from a singular global `TimelineEvent` database table.
- Future phases may require persisting these aggregated events into an `AuditLog` structure or a dedicated table if querying them across the entire database proves too slow.

## Next Phase Recommendation

Phase 37 should build on this foundation by introducing **CEO Intelligence**—giving center owners an executive summary of center health based on aggregated timeline interactions and detected risks, before moving on to the final Approval-Send Bridge.
