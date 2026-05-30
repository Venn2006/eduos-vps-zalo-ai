export interface AiProvider {
  classifyLead(text: string): Promise<{ intent: string }>;
  suggestReply(text: string): Promise<{ reply: string }>;
  summarizeConversation(messages: string[]): Promise<string>;
  generateParentReport(studentData: any): Promise<string>;
  gradeHomework(mediaUrl: string): Promise<{ score: number, comment: string }>;
}

export class MockAiProvider implements AiProvider {
  async classifyLead(text: string) {
    return { intent: "trial_booking" };
  }
  async suggestReply(text: string) {
    return { reply: "Chào bạn, OMLIS rất vui được hỗ trợ!" };
  }
  async summarizeConversation(messages: string[]) {
    return "Summary of conversation";
  }
  async generateParentReport(studentData: any) {
    return "Bé học ngoan, tiến bộ.";
  }
  async gradeHomework(mediaUrl: string) {
    return { score: 9, comment: "Làm bài tốt" };
  }
}
