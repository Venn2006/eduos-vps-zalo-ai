# Phase 55 — Student/Parent Timeline + Follow-up Task Center Hardening

## 1. Context
EduOS is evolving from a simple chatbot/CRM into a true SaaS / AI Operating System for Vietnamese language centers. Phase 54 laid the foundation with the Lead Kanban and CRM Command Center. Phase 55 deepens this by connecting the entire lifecycle from Lead -> Trial -> Student -> Parent -> Alumni, providing center owners with a comprehensive, transparent timeline and task center.

## 2. Goal
Build on Phase 54 to make EduOS an indispensable operating system for follow-up, parent care, and student lifecycle management. A center owner should instantly know:
- Ai đang có nguy cơ nghỉ học (Churn risk)
- Ai đang nợ học phí, nợ bài tập (Debt/Homework)
- Nhân viên nào phụ trách task nào (Staff accountability)
- Ai cần Admin/Teacher can thiệp (Approval handoffs)

## 3. User Value for Center Owner
By centralizing all interactions (Fanpage, Zalo, Call, In-center) into a single deterministic timeline, the owner spends less time chasing staff for updates. The AI proactively calculates churn risks and generates draft follow-ups, reducing manual overhead while strictly maintaining human-in-the-loop approvals.

## 4. Changed Routes/Files
- `apps/web/src/app/crm-command-center/CrmCommandCenterClient.tsx` (UI Hardening)
- `apps/web/src/lib/crmDemoData.ts` (Expanded mock lifecycle & events)
- `apps/web/src/lib/studentCareRisk.ts` (New deterministic churn logic)

## 5. Student/Parent Timeline Model
Timeline now encompasses rich events:
- **Lead Events**: Lead Created, Message Received, Staff Reply, Trial Booked.
- **Student Events**: Converted Student, Class Assigned, Attendance Absence, Homework Missing.
- **Care Events**: Parent Complaint, Tuition Reminder Draft, Churn Risk Alert.

## 6. Follow-up Task Workflow
Tasks are now filtered by categories: `Hôm nay`, `Quá hạn`, `Cần Admin Duyệt`, `Cần Giáo viên Xử lý`. Each task displays its automation rule (`STAFF_HANDOFF`, `ADMIN_APPROVAL_REQUIRED`), forcing accountability.

## 7. Care/Churn Risk Preview
Deterministic logic analyzes missing homework, absences, and parent sentiment to classify students:
- `Bình thường` (Normal)
- `Cần chú ý` (Needs Attention)
- `Nguy cơ nghỉ cao` (High Churn Risk)
- `Khiếu nại/Cần handoff` (Complaint/Handoff)

## 8. Approval/Safety Matrix
All actions strictly adhere to Sandbox policies. Tuition/payment messages require `ADMIN_APPROVAL_REQUIRED`. Complaints trigger `STAFF_HANDOFF`. No real messages are sent.

## 9. Demo Storyline
1. Owner opens "CEO Overview" and sees 1 High Risk Student and 1 task needing Admin Approval.
2. Owner switches to "Chăm sóc rủi ro" to view the student with high absences.
3. Owner opens the Timeline Drawer, sees the AI drafted a "Tuition Reminder" but it's waiting for approval.
4. Owner clicks "Soạn tin nhắn (Tạo nháp demo)".

## 10. Manual QA Checklist
- [x] Page renders without runtime errors.
- [x] Sandbox warning banner visible.
- [x] Tabs navigate smoothly between CEO Overview, Kanban, and Care.
- [x] Timeline Drawer displays detailed badges and history.
- [x] Demo buttons correctly labeled.

## 11. Still Not Implemented
- Real Database migrations for these states.
- Live Zalo/Facebook API calls.
- Real cron jobs for absence scanning.

## 12. Next Recommended Phase
`Phase 56 — Teacher/Học vụ Workspace + Scheduling Conflict Detection`
