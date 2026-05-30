export interface FacebookAdapter {
  replyMessage(pageId: string, userId: string, text: string): Promise<void>;
}

export class MockFacebookAdapter implements FacebookAdapter {
  async replyMessage(pageId: string, userId: string, text: string) {
    console.log(`[MOCK FB] Reply to ${userId} on page ${pageId}: ${text}`);
  }
}

// TODO: Implement OfficialFacebookAdapter using Meta API
export class OfficialFacebookAdapter implements FacebookAdapter {
  async replyMessage(pageId: string, userId: string, text: string) {
    throw new Error("Not implemented");
  }
}
