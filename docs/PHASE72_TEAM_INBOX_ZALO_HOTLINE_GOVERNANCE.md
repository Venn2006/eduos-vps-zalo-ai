# Phase 72: Team Inbox / Zalo Hotline Governance Demo

## 1. Context
Following the completion of the Task Management workspace in Phase 71, Phase 72 introduces a critical operating module: Team Inbox (Tin nhắn & Zalo). In many language centers, handling parent/student communication across multiple channels (Fanpage, Zalo OA, Personal Work Zalo) is chaotic and lacks CEO oversight.

## 2. User Need
CEOs and center managers need to answer:
- Trung tâm đang có bao nhiêu hội thoại chưa xử lý?
- Nhân viên nào đang trả lời khách nào?
- Hội thoại nào quá SLA/chưa ai nhận?
- CEO có thể xem workload, phân quyền, chuyển người phụ trách ở đâu?
- Làm sao quản trị Zalo hotline chia sẻ chung an toàn?

## 3. Safe Framing
This module is strictly a **Mock/Demo** environment. 
- It does **not** scrape personal Zalo accounts.
- It operates under a "Work-channel / Hotline" permission-based framework.
- It avoids "spyware" framing, emphasizing transparent governance and workload balancing instead of covert monitoring.

## 4. What Changed
- Created `TeamInboxClient` to display a 3-pane team inbox layout.
- Designed a KPI dashboard specific to inbox operations (Unread, Unassigned, Overdue SLA).
- Added `teamInboxDemoData.ts` representing a deterministic set of mocked channels, staff profiles, conversations, and threads.
- Added a "CEO Oversight" panel demonstrating SLA tracking and workload summary.
- Displayed a clear Permission Model matrix explaining who can see what.
- Updated `AppLayout` to feature the new `Tin nhắn & Zalo` route.

## 5. Route Affected
- Added: `/team-inbox`

## 6. Demo Data Model
- **Channels**: Zalo Hotline trung tâm, Zalo OA demo, Fanpage.
- **Staff Profiles**: 10 staff members across roles (CEO, Quản lý, Sale, Giáo viên, Kế toán) with specific permission levels and SLA risks.
- **Conversations**: Deterministic statuses (Chưa nhận, Đang xử lý, Chờ duyệt nháp) with AI suggestions mapped safely.

## 7. Permission Model
- **CEO/Admin**: Xem toàn bộ, phân quyền, chuyển hội thoại.
- **Quản lý**: Xem team, phân việc, duyệt nháp.
- **Sale**: Xử lý lead/hotline được giao.
- **Giáo viên**: Xem học viên liên quan lớp.
- **Kế toán**: Xem hội thoại học phí.

## 8. Zalo Hotline / Shared Inbox Concept
Instead of connecting personal Zalo accounts directly to the system (which violates Zalo ToS and user privacy), the module promotes the use of designated "Work Channels" or a "Zalo Hotline Trung Tâm". This ensures compliance while enabling multi-agent collaboration.

## 9. What is Explicitly Not Implemented
- **No real Zalo/Facebook API connections.**
- **No credential scraping or automated login.**
- **No real message sending or DB persistence.**
- **No private inbox scraping.**

## 10. Future Lawful/Official Connector Path
Future implementation will rely solely on official Zalo OA APIs and authorized Facebook Graph APIs. Work profiles will require explicit OAuth consent flows rather than password sharing.

## 11. Manual QA Checklist
- [x] `/team-inbox` route renders correctly.
- [x] Sidebar navigation correctly points to new route.
- [x] 3-pane layout is responsive and collapses on mobile.
- [x] Selecting a conversation dynamically updates the right pane.
- [x] AI draft suggestions and system notes render clearly.
- [x] CEO oversight and Permission matrix are visible.
- [x] All buttons are labeled clearly as Demo and execute no network requests.

## 12. Next Recommended Phase
- `Phase 73 — Mobile Responsive Product Polish`
