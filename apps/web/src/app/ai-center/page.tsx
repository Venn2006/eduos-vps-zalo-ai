import React from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AiSuggestionCard } from '@/components/ui/AiSuggestionCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Bot, RefreshCw, FileText, CheckCircle } from 'lucide-react';
import { prisma } from '@eduos/db';
import { getCurrentTenantOrThrow } from '@/lib/auth';

export default async function AiCenterPage() {
  const tenantId = await getCurrentTenantOrThrow();
  const drafts = await prisma.aiGradeDraft.findMany({
    where: { tenantId, isApproved: false },
    include: {
      submission: {
        include: {
          student: true,
          homework: true
        }
      }
    }
  });

  const pendingMessages = await prisma.zaloOutboxMessage.findMany({
    where: { tenantId, status: "PENDING_APPROVAL" }
  });

  const debtReminders = pendingMessages.filter(m => m.text.includes("học phí"));
  const renewalReminders = pendingMessages.filter(m => m.text.includes("tái phí"));

  const parentReports = await prisma.weeklyParentReport.findMany({
    where: { tenantId, status: { in: ["PENDING_TEACHER_REVIEW", "PENDING_ADMIN_APPROVAL", "DRAFT"] } },
    include: { student: true }
  });

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader 
        title="AI Command Center" 
        description="Quản lý toàn bộ các tác vụ tự động và trợ lý ảo Zalo"
        action={<Button><RefreshCw className="w-4 h-4 mr-2" /> Làm mới dữ liệu</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main tasks list */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-primary/20">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <FileText className="w-5 h-5" /> Báo cáo cần duyệt ({parentReports.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {parentReports.map(report => {
                let risks: any[] = [];
                try { risks = JSON.parse(report.riskFlagsJson || "[]"); } catch(e){}
                const hasHighRisk = risks.some(r => r.severity === "HIGH");

                return (
                  <AiSuggestionCard
                    key={report.id}
                    type={hasHighRisk ? "alert" : "draft"}
                    title={`Báo cáo phụ huynh học sinh ${report.student.name}`}
                    description={`Trạng thái: ${report.status}. AI đã tổng hợp từ điểm số, điểm danh. Nhấn xem chi tiết để duyệt và gửi Zalo.`}
                    actionLabel="Duyệt gửi"
                    badges={["ai-generated", "needs-review"]}
                  />
                );
              })}
              <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/10">Xem tất cả 10 báo cáo</Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-info/20">
            <CardHeader className="bg-info/5 border-b border-info/10">
              <CardTitle className="text-lg flex items-center gap-2 text-info">
                <Bot className="w-5 h-5" /> Đề xuất chăm sóc khách hàng (5)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {[1, 2].map(i => (
                <AiSuggestionCard 
                  key={i}
                  type="insight"
                  title="Follow-up học thử"
                  description="Lead Trần Thị B đã học thử bài 1 hôm qua. Đề xuất gửi tin nhắn Zalo hỏi thăm và tặng voucher 10%."
                  actionLabel="Duyệt gửi Zalo"
                  badges={["ai-generated"]}
                />
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-purple-500/20">
            <CardHeader className="bg-purple-50 border-b border-purple-100">
              <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
                <FileText className="w-5 h-5" /> AI Chấm bài tập (Chờ duyệt)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {drafts.length === 0 && (
                <div className="text-sm text-slate-500 py-4 text-center">Không có bài nào đang chờ duyệt.</div>
              )}
              {drafts.map(draft => (
                <AiSuggestionCard 
                  key={draft.id}
                  type="draft"
                  title={`${draft.submission.homework.title} - ${draft.submission.student.name}`}
                  description={`AI đã chấm điểm ${draft.score}/10. Nhận xét: ${draft.comment}. Chờ giáo viên duyệt để gửi.`}
                  actionLabel="Duyệt & Gửi"
                  badges={["ai-generated", "needs-review"]}
                />
              ))}
            </CardContent>
          </Card>

          {/* Finance Reminders */}
          <Card className="shadow-sm border-warning-strong/20">
            <CardHeader className="bg-warning/5 border-b border-warning/10">
              <CardTitle className="text-lg flex items-center gap-2 text-warning-strong">
                <Bot className="w-5 h-5" /> Nhắc nhở Công nợ & Tái phí (Chờ duyệt)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {debtReminders.length === 0 && renewalReminders.length === 0 && (
                <div className="text-sm text-slate-500 py-4 text-center">Không có tin nhắn nhắc nhở nào đang chờ duyệt.</div>
              )}
              {debtReminders.map(msg => (
                <AiSuggestionCard 
                  key={msg.id}
                  type="draft"
                  title="Tin nhắn Nhắc nợ (Zalo Cá nhân)"
                  description={msg.text}
                  actionLabel="Duyệt gửi Zalo"
                  badges={["system", "needs-review"]}
                />
              ))}
              {renewalReminders.map(msg => (
                <AiSuggestionCard 
                  key={msg.id}
                  type="draft"
                  title="Tư vấn Tái phí (Zalo Cá nhân)"
                  description={msg.text}
                  actionLabel="Duyệt gửi Zalo"
                  badges={["system", "needs-review"]}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* System Health */}
        <div className="space-y-6">
          <Card className="border-success/30 shadow-md">
            <CardHeader className="bg-success/5 border-b border-success/10">
              <CardTitle className="text-success flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Trạng thái Zalo VPS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Connector</span>
                  <span className="px-2 py-1 bg-success/15 text-success rounded text-xs font-bold border border-success/30">ONLINE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Lớp đã setup Bot</span>
                  <span className="font-extrabold text-lg">6<span className="text-slate-400 text-sm font-normal">/8</span></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Tin nhắn gửi hôm nay</span>
                  <span className="font-extrabold text-lg text-primary">42</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
