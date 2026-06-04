import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { prisma } from '@eduos/db';
import {  getCurrentTenantOrThrow , getSession } from '@/lib/auth';
import { CheckCircle2, Clock, Sparkles, FileEdit, MessageSquare } from 'lucide-react';

export default async function HomeworkPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/homework")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();

  const homeworks = await prisma.homework.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    include: {
      class: true,
      submissions: {
        include: {
          student: true,
          aiGradeDrafts: true
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Quản lý Bài tập" 
        description="Giao bài, chấm điểm và xem phản hồi AI"
        action={<Button><FileEdit className="w-4 h-4 mr-2" /> Giao bài mới</Button>}
      />

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
        <h3 className="font-bold text-blue-900 mb-2">
          Quy trình Bài tập & Chấm điểm (AI Draft)
        </h3>
        <div className="flex items-center gap-2 text-sm font-medium text-blue-800 flex-wrap">
          <span className="px-2 py-1 bg-white rounded shadow-sm border border-blue-100">1. Giáo viên giao bài</span>
          <span>➔</span>
          <span className="px-2 py-1 bg-white rounded shadow-sm border border-blue-100">2. Học viên nộp</span>
          <span>➔</span>
          <span className="px-2 py-1 bg-white rounded shadow-sm border border-blue-100 border-l-4 border-l-amber-400">3. AI chấm nháp</span>
          <span>➔</span>
          <span className="px-2 py-1 bg-white rounded shadow-sm border border-blue-100 border-l-4 border-l-emerald-400">4. Giáo viên duyệt</span>
          <span>➔</span>
          <span className="px-2 py-1 bg-white rounded shadow-sm border border-blue-100">5. Phụ huynh nhận báo cáo</span>
        </div>
        <p className="mt-3 text-sm text-blue-700 italic">
          * AI chỉ tạo bản nháp. Hệ thống không tự động chấm điểm cuối cùng hoặc tự động gửi cho phụ huynh. <strong>Cần giáo viên duyệt.</strong>
        </p>
      </div>

      {homeworks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            Chưa có bài tập nào được giao.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {homeworks.map(hw => (
            <Card key={hw.id} className="overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900">{hw.title}</h3>
                  <p className="text-sm text-slate-500">Lớp: {hw.class.classCode} • Hạn nộp: {hw.dueAt.toLocaleString("vi-VN")}</p>
                </div>
                <Badge variant={hw.status === "ASSIGNED" ? "default" : "secondary"}>{hw.status}</Badge>
              </div>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b">
                      <tr>
                        <th className="px-6 py-3 font-medium">Học viên</th>
                        <th className="px-6 py-3 font-medium">Trạng thái</th>
                        <th className="px-6 py-3 font-medium">Ngày nộp</th>
                        <th className="px-6 py-3 font-medium">AI Chấm điểm</th>
                        <th className="px-6 py-3 font-medium text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {hw.submissions.map(sub => {
                        const aiDraft = sub.aiGradeDrafts[0];
                        return (
                          <tr key={sub.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-medium text-slate-900">{sub.student.name}</td>
                            <td className="px-6 py-4">
                              {sub.status === "SUBMITTED" ? (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700">Đã nộp</Badge>
                              ) : sub.status === "AI_GRADED" ? (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-700">AI đã chấm</Badge>
                              ) : (
                                <Badge variant="outline">{sub.status}</Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              {sub.submittedAt.toLocaleString("vi-VN")}
                            </td>
                            <td className="px-6 py-4">
                              {aiDraft ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-emerald-600">{aiDraft.score}/10</span>
                                  <Sparkles className="w-4 h-4 text-amber-500" />
                                </div>
                              ) : (
                                <span className="text-slate-400">Đang chờ...</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {aiDraft && (
                                <>
                                  <Button variant="outline" size="sm" className="bg-white">
                                    Duyệt điểm & lưu báo cáo
                                  </Button>
                                  <div className="text-[10px] text-slate-400 mt-1">Chưa gửi Zalo thật</div>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {hw.submissions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                            Chưa có học viên nào nộp bài.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
