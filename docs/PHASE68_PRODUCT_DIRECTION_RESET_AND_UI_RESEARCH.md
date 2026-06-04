# Phase 68: Product Direction Reset and UI Research

## 1. User Feedback Summary
- The Safety Center and Approval Queue are too complicated and technical for a real center owner to understand at a glance.
- The product lacks a clear "Task Management" module for staff assignment.
- The product lacks a "Team Inbox" module to view and manage Zalo/Facebook messages.
- Center owners (CEOs) want visibility into what staff are messaging and handling.
- There is a desire to monitor staff personal Zalo accounts, but this violates privacy and technical boundaries.

## 2. What is wrong with current UI/product framing
- The app feels like a technical compliance sandbox rather than an operating system (SaaS) for running a business.
- Navigation is cluttered with backend concepts (e.g., "Mock Outbox", "Safety Center") instead of business value ("Lead", "Inbox", "Finance").
- Visually, the app lacks the clean, modern aesthetic expected of a 2026 B2B SaaS platform (glassmorphism, clean cards, workflow-centric navigation).

## 3. New Product Positioning
- **EduOS = Trung tâm điều hành cho chủ trung tâm ngoại ngữ** (Command Center for Language Center Owners).
- Key capabilities: Lead management, Omnichannel Team Inbox, Staff Task Management, Teacher/Academic tools, Finance tracking, and AI-assisted workflows (drafting, warnings) rather than pure AI automation.
- Interface must look like a premium SaaS dashboard, optimized for both desktop and mobile.

## 4. Public Research Summary
- **SaaS Dashboards:** Moving toward "Calm Design", workflow-centric navigation, and "hero metrics". Dashboards prioritize one or two primary KPIs above the fold to provide instant context. Modular and customizable widgets.
- **Team Inboxes (CRM):** Centralized "Command Center" view collating multiple channels. Integrated CRM context alongside messages. Clear ownership and accountability (assignments). Internal collaboration notes. Intelligent automated tagging.
- **Zalo OA:** Zalo provides official APIs (Zalo OpenAPI) and solutions (Zalo Business Solutions, ZNS) for businesses to automate messages and manage interactions programmatically without scraping personal accounts.
- **Meta Business Suite:** Offers a unified inbox with role-based access control, allowing secure delegation of message handling without sharing personal credentials.

## 5. UI/UX Inspiration Principles
- Clean cards with rounded corners.
- Strong sidebar for navigation.
- Gradients and glassmorphism (light shadows, translucency) for depth.
- Mobile-first responsive layouts (stacking panes, bottom nav or collapsible sidebar).
- Dashboard hero metrics and at-a-glance summaries.
- Split-pane inbox (List | Detail/CRM).
- Kanban-style task boards.
- Clean typography and clear action drawers.

## 6. Modules to simplify
- **Safety Center:** Rename to "Kiểm soát an toàn" or "Trạng thái demo". Hide under Settings. Keep it simple for demos.
- **Approval Queue:** Rename to "Việc cần duyệt". Frame it as a business workflow step, not a technical queue.

## 7. Modules to hide from main demo
- Deep technical safety configurations.
- Mock outbox internals.
- Protocol/connector matrices.

## 8. Modules to build next
- **Bundle A:** SaaS UI Visual Redesign Foundation (Global app shell polish).
- **Bundle B:** CEO Command Center (Dashboard with hero metrics, today's feed, staff workload).
- **Bundle C:** Task Management / Giao Việc Module (Kanban board, staff assignment).
- **Bundle D:** Zalo Team Inbox (Shared omnichannel inbox, conversation assignment).
- **Bundle E:** Mobile Responsive Product Polish (Ensure 375px+ screens work perfectly).
- **Bundle F:** Product Completion Audit.

## 9. Safe Zalo/team inbox strategy
- For demo: Use deterministic mock UI showing a unified inbox for Zalo Hotline, Fanpage, etc.
- For production: Use official Zalo OA and Meta APIs for business channels. For staff accounts, rely on transparent, consent-based company policies (e.g., company-provided business accounts, manual exports) rather than scraping or spyware.

## 10. What not to implement
- No scraping of personal Zalo/Facebook accounts.
- No credential collection or spyware.
- No bypassing rate limits or login gates.
- No automated real sending in demo modes.

## 11. Desktop responsive principles
- Split panes (e.g., 30/70 or 25/50/25) for inboxes and CRM.
- Grid layouts (2, 3, or 4 columns) for dashboard metrics.
- Sidebars remain fixed.

## 12. Mobile responsive principles
- Hide horizontal overflows.
- Stack cards vertically.
- Transform sidebars into hamburger menus or bottom navigation bars.
- Ensure touch targets are large and accessible.
- Convert multi-pane views (inbox) into drill-down navigation (list view -> tap -> detail view).

## 13. Next implementation plan
- Proceed with Bundle A: Refactor `AppLayout.tsx`, standard components, and typography/colors to reflect modern SaaS UI.
- Bundle B: Create the CEO dashboard view.
- Bundle C: Build the Task management UI.
- Bundle D: Build the Team Inbox UI.
- Bundle E: Refine mobile layouts across all key routes.
- Bundle F: Conduct final audit.
