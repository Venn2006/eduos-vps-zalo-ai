export interface AiProvider {
  classifyLead(text: string): Promise<{ intent: string }>;
  suggestReply(text: string): Promise<{ reply: string }>;
  summarizeConversation(messages: string[]): Promise<string>;
  generateParentReport(studentData: any): Promise<string>;
  gradeHomework(mediaUrl: string): Promise<{ score: number, comment: string }>;
  answerCeoQuery(query: string, tenantId: string): Promise<{
    answer: string;
    evidenceJson: any;
    suggestedActionsJson: any;
    severity: string;
    sourceModule: string;
    rawResultJson: any;
  }>;
  processFanpageTask(inputStr: string): Promise<string>;
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

  async processFanpageTask(inputStr: string) {
    const input = JSON.parse(inputStr);
    return JSON.stringify({
      intent: "TRIAL_BOOKING", 
      urgency: "HIGH",
      needsHandoff: true,
      suggestedReply: `Chào bạn, trung tâm ${input.pageName || 'chúng tôi'} đã nhận được tin nhắn của bạn. Bạn muốn đăng ký học thử cho bé đúng không ạ? Bạn vui lòng để lại số điện thoại nhé!`,
      studentName: "Bé", 
      parentName: "Khách hàng FB",
      courseInterest: "Tiếng Anh",
    });
  }

  async answerCeoQuery(query: string, tenantId: string) {
    const q = query.toLowerCase();
    let answer = "Không đủ dữ liệu";
    let evidenceJson: any = null;
    let suggestedActionsJson: any = null;
    let severity = "LOW";
    let sourceModule = "GENERAL";
    let rawResultJson: any = null;

    if (q.includes("nghiêm trọng") || q.includes("lỗi") || q.includes("vấn đề")) {
      const { getCriticalAlertsSummary } = await import("./src/fetchers/ceo-chat");
      const data = await getCriticalAlertsSummary(tenantId);
      sourceModule = "SYSTEM";
      rawResultJson = data;
      evidenceJson = { criticalCount: data.criticalCount, health: data.health };
      
      if (data.criticalCount > 0) {
        severity = "CRITICAL";
        answer = `Hệ thống ghi nhận ${data.criticalCount} vấn đề nghiêm trọng: ${data.finance.overdueInvoices} hóa đơn quá hạn, ${data.health.offlineConnectors} Zalo bị mất kết nối, và ${data.health.failedZaloMessages} tin nhắn gửi lỗi.`;
        suggestedActionsJson = [{ actionType: "FLAG_RISK", payload: { type: "SYSTEM_HEALTH" } }];
      } else {
        answer = "Hôm nay không có vấn đề gì nghiêm trọng. Các hệ thống Zalo/Facebook và tài chính đều ổn định.";
      }
    } 
    else if (q.includes("tuyển") || q.includes("lead") || q.includes("sale")) {
      const { getSalesPerformanceToday, getTodayAdmissionsSummary } = await import("./src/fetchers/ceo-chat");
      const data = await getTodayAdmissionsSummary(tenantId);
      const sales = await getSalesPerformanceToday(tenantId);
      sourceModule = "SALES";
      rawResultJson = { admissions: data, sales };
      evidenceJson = { newLeads: data.newLeads, newTrials: data.newTrials, wonLeads: sales.wonLeads, revenue: sales.revenueToday };
      
      answer = `Hôm nay tuyển được ${data.newLeads} leads mới, có ${data.newTrials} lịch học thử. Đã chốt thành công (WON) ${sales.wonLeads} học viên và ghi nhận ${sales.revenueToday.toLocaleString('vi-VN')} VND doanh thu.`;
    }
    else if (q.includes("rủi ro") || q.includes("nghỉ") || q.includes("lớp")) {
      const { getAcademicRiskSummary } = await import("./src/fetchers/ceo-chat");
      const data = await getAcademicRiskSummary(tenantId);
      sourceModule = "ACADEMIC";
      rawResultJson = data;
      evidenceJson = data;
      
      if (data.needsReviewAttendance > 0 || data.missingHomeworks > 0) {
        severity = "MEDIUM";
        answer = `Có ${data.needsReviewAttendance} buổi điểm danh cần xem xét (có thể học viên nghỉ nhiều) và ${data.missingHomeworks} bài tập chưa được chấm/nộp đầy đủ. Xin hãy nhắc nhở giáo viên.`;
        suggestedActionsJson = [{ actionType: "SEND_ZALO", payload: { type: "REMIND_TEACHER" } }];
      } else {
        answer = "Hiện tại không phát hiện rủi ro học thuật đáng kể. Học viên đi học và nộp bài đều.";
      }
    }
    else if (q.includes("tiền") || q.includes("tái phí") || q.includes("nợ")) {
      const { getFinanceRiskSummary } = await import("./src/fetchers/ceo-chat");
      const data = await getFinanceRiskSummary(tenantId);
      sourceModule = "FINANCE";
      rawResultJson = data;
      evidenceJson = data;
      
      if (data.overdueInvoices > 0) {
        severity = "HIGH";
        answer = `Có ${data.overdueInvoices} hóa đơn quá hạn với tổng số tiền nợ là ${data.totalOverdueAmount.toLocaleString('vi-VN')} VND. Có ${data.unpaidInvoices} hóa đơn chưa thanh toán.`;
        suggestedActionsJson = [{ actionType: "CREATE_REMINDER", payload: { type: "DEBT_REMINDER" } }];
      } else {
        answer = "Không có hóa đơn nào quá hạn. Tình hình thu học phí đang rất tốt.";
      }
    }
    else if (q.includes("báo cáo") || q.includes("duyệt")) {
      const { getParentReportPendingSummary, getAiDraftsPendingApproval } = await import("./src/fetchers/ceo-chat");
      const data = await getParentReportPendingSummary(tenantId);
      const aiData = await getAiDraftsPendingApproval(tenantId);
      sourceModule = "REPORTS";
      rawResultJson = { reports: data, aiDrafts: aiData };
      evidenceJson = { pendingReports: data.pendingReports, draftReports: data.draftReports, pendingDrafts: aiData.pendingDrafts };
      
      answer = `Hiện có ${data.pendingReports} báo cáo phụ huynh đang chờ admin duyệt, và ${aiData.pendingDrafts} hành động AI đang chờ CEO duyệt.`;
    }

    return {
      answer,
      evidenceJson,
      suggestedActionsJson,
      severity,
      sourceModule,
      rawResultJson
    };
  }
}
