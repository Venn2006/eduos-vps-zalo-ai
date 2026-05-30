export interface ZaloAdapter {
  receiveGroupMessage(payload: any): Promise<void>;
  sendGroupMessage(groupId: string, text: string): Promise<void>;
  sendDirectMessage(userId: string, text: string): Promise<void>;
  getSessionStatus(): Promise<{ status: "ONLINE" | "OFFLINE" }>;
  getHeartbeatStatus(): Promise<{ lastPing: string }>;
}

export class MockZaloAdapter implements ZaloAdapter {
  async receiveGroupMessage(payload: any) {}
  async sendGroupMessage(groupId: string, text: string) {
    console.log(`[MOCK ZALO] Group ${groupId}: ${text}`);
  }
  async sendDirectMessage(userId: string, text: string) {
    console.log(`[MOCK ZALO] DM to ${userId}: ${text}`);
  }
  async getSessionStatus() { return { status: "ONLINE" as const }; }
  async getHeartbeatStatus() { return { lastPing: new Date().toISOString() }; }
}

// TODO: Implement ZaloPersonalVpsAdapter using Puppeteer
// SAFETY NOTE: Real implementation must NOT bypass OTP, CAPTCHA, login, encryption, anti-bot systems, or platform security.
export class ZaloPersonalVpsAdapter implements ZaloAdapter {
  async receiveGroupMessage(payload: any) { throw new Error("Not implemented"); }
  async sendGroupMessage(groupId: string, text: string) { throw new Error("Not implemented"); }
  async sendDirectMessage(userId: string, text: string) { throw new Error("Not implemented"); }
  async getSessionStatus(): Promise<{ status: "ONLINE" | "OFFLINE" }> { throw new Error("Not implemented"); }
  async getHeartbeatStatus(): Promise<{ lastPing: string }> { throw new Error("Not implemented"); }
}
