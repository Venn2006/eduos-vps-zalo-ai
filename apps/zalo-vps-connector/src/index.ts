import { logger } from "@eduos/logger";

const CLOUD_API_URL = process.env.CLOUD_API_URL || "http://localhost:3001";
const CONNECTOR_TOKEN = process.env.CONNECTOR_TOKEN;
const ACCOUNT_ID = process.env.CONNECTOR_ACCOUNT_ID;
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_SECONDS || "10", 10);
const MOCK_MODE = process.env.MOCK_MODE === "true";

logger.info("Starting Zalo VPS Connector...", { accountId: ACCOUNT_ID, mockMode: MOCK_MODE });

async function heartbeat() {
  logger.info(`Sending heartbeat to ${CLOUD_API_URL}/api/connectors/zalo/heartbeat`);
  // Mock API call
}

async function pollOutbox() {
  logger.info("Polling outbox placeholder...");
  // Mock API call
}

async function simulateInboundMessage() {
  logger.info("Pushing mock inbound group message placeholder...");
}

const interval = setInterval(() => {
  heartbeat();
  pollOutbox();
  simulateInboundMessage();
}, POLL_INTERVAL * 1000);

process.on("SIGTERM", () => {
  clearInterval(interval);
  logger.info("Connector shut down.");
  process.exit(0);
});
