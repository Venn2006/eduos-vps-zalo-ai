# Phase 9: AI Command Center Core + CEO Chat Handover

This document serves as the final handover report for Phase 9 of the EduOS SaaS Zalo/AI integration. It outlines the architectural implementations, APIs, DB behavior, safety constraints, known limitations, and a smoke test matrix.

## 1. What Phase 9 Implemented
*   **Prisma Models / Migration:** Created the foundation for AI interaction with tracked migration `20260601105000_phase9_ai_command_center/migration.sql`. Models include `AiCommandThread`, `AiCommandMessage`, `AiCommandRun`, `AiAgentFinding`, and `AiActionDraft`.
*   **Deterministic Data Fetchers:** Implemented specific Prisma DB fetchers inside `packages/ai/src/fetchers/ceo-chat.ts` to retrieve tenant-scoped metrics accurately.
*   **MockAiProvider:** Created an orchestration provider inside `packages/ai/index.ts` to parse intent using exact substring matching and resolve responses deterministically, without involving a live LLM.
*   **CEO Chat API (`POST /api/ai/ceo-chat`):** Built a dedicated endpoint inside `apps/api/src/routes/ai-center.ts` handling thread resolution, DB persistence, and mapping MockAiProvider actions.
*   **OWNER/ADMIN RBAC:** Secured the endpoint explicitly ensuring that any caller not matching `OWNER` or `ADMIN` is rejected with `403 Forbidden`.
*   **UI / Dashboard Integration:** Developed the React interface at `apps/web/src/app/ai-center/page.tsx` displaying interactive AI chats, severity badges, and embedded a quick link to this center via `apps/web/src/app/dashboard/page.tsx`.
*   **Automated Tests:** Injected full test coverage (`apps/api/src/tests/ai-command-center.test.ts`) validating RBAC, deterministic mapping, and DB records.

## 2. Exact Commit
The complete logic for Phase 9 was merged in commit:
`0f0ad0c feat(phase9): implement AI command center and CEO chat foundation`

## 3. API Contract

*   **Endpoint:** `POST /api/ai/ceo-chat`
*   **Request Shape:**
    ```json
    {
      "message": "Hôm nay có vấn đề gì nghiêm trọng không?",
      "threadId": "optional-uuid"
    }
    ```
*   **Response Shape:**
    ```json
    {
      "threadId": "uuid",
      "message": {
        "id": "uuid",
        "role": "ASSISTANT",
        "content": "string",
        "evidence": {},
        "suggestedActions": [],
        "severity": "string"
      }
    }
    ```
*   **Sample Response:**
    ```json
    {
      "threadId": "cmpuqylbp0005ullqxmyrt0n7",
      "message": {
        "id": "cmpuqylbv0006ullq7k3c4z78",
        "role": "ASSISTANT",
        "content": "⚠️ Hệ thống cảnh báo: Trợ lý Zalo VPS đang mất kết nối. \n\nSố class setup chưa duyệt: 0",
        "evidence": {
          "offlineConnectors": 1,
          "pendingSetupCommands": 0
        },
        "suggestedActions": [
          {
            "actionType": "FLAG_RISK",
            "payload": {
              "type": "SYSTEM_HEALTH"
            }
          }
        ],
        "severity": "CRITICAL"
      }
    }
    ```

## 4. DB Persistence Behavior
Upon a successful query, the backend deterministically records:
*   **`AiCommandThread`**: Retains conversation grouping and metadata. Resolves or creates a new one if `threadId` is omitted.
*   **`AiCommandMessage`**: Logs both the user input and the resolved system output along with stringified `evidenceJson` and `suggestedActionsJson`.
*   **`AiCommandRun`**: Generates a record defining the `sourceModule` (e.g., `SYSTEM`, `SALES`) that resolved the data.
*   **`AiAgentFinding`**: Specifically creates logs if the AI flags high-severity conditions (`severity > LOW`).
*   **`AiActionDraft`**: Automatically iterates through `suggestedActions` returned by the provider and persists them.
*   **`PENDING_APPROVAL` Behavior**: Any created `AiActionDraft` is explicitly hardcoded to initialize with `status: "PENDING_APPROVAL"`. No action is ever auto-executed.

## 5. Safety Rules

Phase 9 establishes the foundational safety parameters for the AI center:
*   **No Live LLM:** The orchestration uses mocked logic to prevent hallucination out of the gate.
*   **No Auto-Send / Spam:** The Zalo/Facebook send functions are completely blocked and disconnected from the AI command center.
*   **No Sensitive Automation:** No finance, debt, parent communication, or private feedback is sent automatically.
*   **Drafts Only:** Any sensitive execution defaults strictly to `AiActionDraft` creation.

## 6. Known Limitations
*   Uses `MockAiProvider` exclusively.
*   Requires exact phrase/substring matching (e.g., must contain "vấn đề gì").
*   No live LLM exists yet to process fuzzy language.
*   Action drafts populate the UI as `Chờ duyệt` but cannot be actively approved or resolved from the frontend yet.
*   Sample runtime proofs during implementation focused heavily on the `SYSTEM` branch.
*   The Fanpage Agent subsystem is currently not implemented.

## 7. Recommended Smoke Test Matrix for Next Time
When extending or validating the AI behavior, run these specific queries mapping to their internal branches:
*   `“Hôm nay có vấn đề gì nghiêm trọng không?”` → **SYSTEM**
*   `“Hôm nay tuyển được bao nhiêu?”` → **SALES/ADMISSIONS**
*   `“Ai chưa đóng tiền?”` → **FINANCE**
*   `“Lớp nào có rủi ro học viên nghỉ?”` → **ACADEMIC**
*   `“Báo cáo phụ huynh nào chờ duyệt?”` → **PARENT_REPORTS**
*   `“Có draft AI nào đang chờ duyệt không?”` → **AI_ACTIONS**
