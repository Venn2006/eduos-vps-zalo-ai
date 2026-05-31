import React from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { prisma } from '@eduos/db';
import { getCurrentTenantOrThrow } from '@/lib/auth';
import { CheckCircle2, Clock, Sparkles, FileEdit, MessageSquare } from 'lucide-react';

export default async function HomeworkPage() {
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
                                <Button variant="outline" size="sm" className="bg-white">
                                  Duyệt & Gửi
                                </Button>
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
