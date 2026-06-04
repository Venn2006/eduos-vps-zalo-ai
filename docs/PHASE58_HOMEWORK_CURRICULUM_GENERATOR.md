# Phase 58: Embedded AI Homework/Curriculum Generator

## 1. Context
EduOS is positioning itself as a "Base SaaS quản lý trung tâm ngoại ngữ" that embeds AI carefully into operational workflows rather than simply being an "AI chatbot."
A significant challenge for language centers is the time teachers spend grading homework, generating quizzes, and writing parent reports.

## 2. Goal
Harden the EduOS homework and teacher workflow to provide a deterministic demo of an AI Homework/Curriculum Generator.
This ensures a teacher or academic coordinator can quickly see pending homework, view AI-generated drafts, approve or reject feedback, and generate reports—while enforcing strict rules that no action is taken without teacher approval.

## 3. User Value
- **Teachers:** Save time drafting feedback, quizzes, and vocabulary lists. Ensure no draft is sent to parents automatically without a final human check.
- **Academic Coordinators:** Monitor which classes are missing homework or need grading. Ensure CEFR standards are followed.
- **Center Owners:** Demonstrate high-tech teaching support for parents while maintaining 100% control over the output.

## 4. Changed Routes/Files
- `apps/web/src/app/homework/page.tsx` (Refactored to client workspace)
- `apps/web/src/app/homework/HomeworkWorkspaceClient.tsx` (New interactive dashboard)
- `apps/web/src/lib/homeworkCurriculumDemoData.ts` (Mock data)
- `apps/web/src/lib/curriculumGenerator.ts` (Local deterministic helper)
- `docs/EDUOS_PRODUCT_GAP_ROADMAP.md` (Updated next phases)

## 5. Homework Demo Data Model
We added a `MockHomeworkSubmission` interface defining assignment types, CEFR levels, draft statuses, and risk notes. The mock data securely demonstrates how EduOS manages student data locally without exposing actual student identities or phone numbers.

## 6. Deterministic Curriculum Generator
A `generateDemoCurriculum` function simulates what a real AI integration would output:
- CEFR-tagged vocabulary lists.
- Multiple-choice quiz questions and cloze tests.
- Writing prompts and teacher note drafts.
*No real LLM API is called; this is purely deterministic to satisfy the sandbox requirement.*

## 7. AI Draft Grading Workflow
The `/homework` workspace now has an "AI chấm nháp" tab highlighting the strict `TEACHER_APPROVAL_REQUIRED` condition. It displays draft scores, strengths, weaknesses, and a suggested comment that the teacher must explicitly approve.

## 8. Parent Report Draft Workflow
The "Báo cáo phụ huynh nháp" tab shows draft messages intended for Zalo/Facebook, visibly tagged with `DRAFT_ONLY`. Buttons are restricted to "Duyệt demo", confirming that no real connector dispatch happens.

## 9. Teacher Approval Matrix
- AI Draft Grade: `TEACHER_APPROVAL_REQUIRED`
- Generated Curriculum: `TEACHER_APPROVAL_REQUIRED`
- Parent Zalo Report: `ADMIN_APPROVAL_REQUIRED` / `TEACHER_APPROVAL_REQUIRED`

## 10. Demo Storyline
1. Teacher logs in and opens "Bài tập".
2. Overview shows 2 pending approvals and 1 draft report.
3. Teacher switches to "Tạo quiz demo" to instantly simulate a B1 Vocabulary quiz.
4. Teacher views "AI chấm nháp" and clicks "Duyệt demo" on a 7.5 IELTS Reading score.
5. Teacher views "Báo cáo phụ huynh nháp" to see the safe, localized Zalo draft ready for dispatch.

## 11. Manual QA Checklist
- [x] Login successfully
- [x] Navigate to `/homework`
- [x] Check Overview cards and list
- [x] Check AI Draft Grading tab shows `TEACHER_APPROVAL_REQUIRED`
- [x] Check Generator tab shows vocabulary and quizzes
- [x] Check Parent Report Draft tab shows `DRAFT_ONLY`
- [x] No real Zalo/Facebook API calls in Network tab
- [x] No external LLM calls

## 12. Still Not Implemented
- Real LLM integrations (OpenAI/Anthropic).
- True OCR/File parsing for student uploads.
- Real Zalo ZNS/Facebook Messenger dispatch.
- Real production worker processing.

## 13. Next Recommended Phase
**Phase 59:** Safe Data Pipeline / Connector Architecture Plan.
