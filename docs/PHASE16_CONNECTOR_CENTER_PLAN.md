# Phase 16 Connector Center Plan

## 1. Connector Model Audit
Based on the schema, EduOS supports the following integration models:
* **Zalo VPS Connector:** `ZaloPersonalAccount`, `ZaloConnectorSession`, `ConnectorHeartbeat`
* **Fanpage Agent:** `FacebookPage`, `FacebookConversation`, `WebhookEvent`
* **AI Center:** Internal to the system (`AiCommandRun`, `AiAgentFinding`)

## 2. Route Behavior (`/settings/connectors`)
The `/settings/connectors` route will act as a unified "Health Monitoring" dashboard for the CEO/Admin. 
It will query the existing models to determine connector status without making live external API calls to Facebook or Zalo.

Status mapping:
* **Zalo Personal VPS:** 
  * "Đang hoạt động" if `ZaloConnectorSession.status === 'ONLINE'`
  * "Cần kiểm tra" if `OFFLINE` or error
  * "Chưa kết nối" if no account exists
* **Fanpage Agent:**
  * "Đang hoạt động" if `FacebookPage.isActive === true`
  * "Chưa kết nối" if no page exists
* **AI Center:**
  * Internal safe status: Always "Đang hoạt động" for now.
* **Payment/VietQR & Worker Queue:**
  * No strict schema yet, hardcoded as "Chưa kết nối" or "Chưa đủ dữ liệu".

## 3. RBAC Rules
* OWNER and ADMIN are allowed to access this route.
* SALE, TEACHER, and ACCOUNTANT are blocked.

## 4. Future Production Hardening Plan
* Add real-time WebSocket subscriptions for heartbeat monitoring.
* Implement direct "Reconnect/Relogin" actions from this page for Zalo VPS.
* Integrate Fanpage webhook verification checks.
* No live external calls in Phase 16 (read-only from DB).
