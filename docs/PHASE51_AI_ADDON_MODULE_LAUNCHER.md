# Phase 51: AI Add-on Business Model + Module Launcher UX

## Objective
Reframe EduOS from an "AI-first experimental tool" into a **standard language-center management SaaS** that offers **optional paid AI add-ons**. 
This strategic pivot addresses Founder feedback: not all AI logic should require CEO approval, and some features like customer support need fast execution, whereas academic reports strictly require teacher sign-off.

## Key Deliverables

### 1. AI Add-on Catalog
Created a flexible catalog at `packages/shared/src/lib/aiAddonCatalog.ts`.
This defines the available AI modules, their pricing, safety modes (Auto vs. Review), and exact channels.

### 2. Module Launcher UX
Completely refactored the `/workspaces` route into a visual "EduOS Launcher", organized by domains:
- Tuyển sinh & CRM
- Đào tạo
- Tài chính
- Zalo/Fanpage & Nhân viên
- Trợ lý AI & Tự động hóa

This resembles familiar ERPs like Salework, making the tool instantly recognizable for center owners without copying third-party systems directly.

### 3. AI Automation Store
Added `/ai-addons` to act as an internal marketplace where center owners can browse, configure, and purchase AI modules. 

### 4. Finance Page Filters
Added visual UI placeholders for Date filtering (Today, This Month, This Quarter, This Year) at `/workspaces/finance`.

## Automation & Safety Modes
The system introduces distinct automation modes:
- `AUTO`: Fully automatic.
- `AUTO_FOR_LOW_RISK`: Automatic for low-risk scenarios (e.g., simple FAQ), requires human handoff for complaints.
- `REVIEW_REQUIRED`: Default safe mode. Drafts are generated and await manual approval.
- `TEACHER_APPROVAL_REQUIRED`: Specific to academic grading; no AI can finalize a grade without a teacher.
- `DRAFT_ONLY`: Strictly drafting mode, mostly used for marketing posts.

## Implementation Gaps & Next Steps
- Real billing is not integrated (Stripe/VNPay).
- Real AI workflows for some modules (like Auto Content Posting) remain stubbed.
- The Date filters on the Finance page are visual placeholders only and do not alter the DB query yet.
