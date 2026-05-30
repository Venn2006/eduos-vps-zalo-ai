import { logger } from "@eduos/logger";
import fs from "fs";
import path from "path";

const CLOUD_API_URL = process.env.CLOUD_API_URL || "http://localhost:3001";
const CONNECTOR_TOKEN = process.env.CONNECTOR_TOKEN || "mock-token-for-dev";
const ACCOUNT_ID = process.env.CONNECTOR_ACCOUNT_ID || "mock-account";
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_SECONDS || "10", 10);
const MOCK_MODE = process.env.MOCK_MODE === "true" || true;

logger.info("Starting Zalo VPS Connector...", { accountId: ACCOUNT_ID, mockMode: MOCK_MODE });

const mockMessagesPath = path.join(__dirname, "mock", "zalo-group-messages.json");
let mockMessageIndex = 0;
let mockMessages: any[] = [];

try {
  mockMessages = JSON.parse(fs.readFileSync(mockMessagesPath, "utf-8"));
} catch (e: any) {
  logger.warn("Failed to load mock messages", { error: e.message });
}

async function fetchApi(endpoint: string, method: string, body?: any) {
  try {
    const res = await fetch(`${CLOUD_API_URL}/api/connectors${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CONNECTOR_TOKEN}`
      },
      body: body ? JSON.stringify(body) : undefined
    });
    return await res.json();
  } catch (e: any) {
    logger.error(`API Error on ${endpoint}`, { error: e.message });
    return null;
  }
}

async function heartbeat() {
  logger.info(`Sending heartbeat...`);
  await fetchApi("/zalo/heartbeat", "POST");
}

async function pollOutbox() {
  logger.info("Polling outbox...");
  const data = (await fetchApi("/zalo/outbox", "GET")) as any;
  if (data && data.messages && data.messages.length > 0) {
    for (const msg of data.messages) {
      logger.info(`[OUTBOX] Sending to Group ${msg.targetGroupId}: ${msg.text}`);
      await fetchApi(`/zalo/outbox/${msg.id}/status`, "POST", { status: "SENT" });
    }
  }
}

async function simulateInboundMessage() {
  if (mockMessageIndex < mockMessages.length) {
    const msg = mockMessages[mockMessageIndex];
    logger.info(`[INBOUND] Pushing mock message from group ${msg.groupId}: ${msg.text}`);
    
    await fetchApi("/zalo/inbound/group-message", "POST", {
      groupId: msg.groupId,
      text: msg.text,
      senderId: "mock-teacher-id",
      messageId: `mock-${Date.now()}-${mockMessageIndex}`,
    });
    
    mockMessageIndex++;
  }
}

const interval = setInterval(async () => {
  await heartbeat();
  await pollOutbox();
  await simulateInboundMessage();
}, POLL_INTERVAL * 1000);

process.on("SIGTERM", () => {
  clearInterval(interval);
  logger.info("Connector shut down.");
  process.exit(0);
});
