import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckSquare, AlertCircle, Clock, Users } from 'lucide-react';
import { prisma } from '@eduos/db';
import {  getCurrentTenantOrThrow , getSession } from '@/lib/auth';

export default async function AttendancePage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/attendance")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  // Fetch today's sessions
  const todaySessions = await prisma.classSession.findMany({
    where: {
      tenantId,
      startTime: { gte: startOfDay, lte: endOfDay }
    },
    include: {
      class: true,
      attendances: {
        include: { student: true }
      }
    },
    orderBy: { startTime: 'asc' }
  });

  // Calculate stats
  let totalExpected = 0;
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalLate = 0;
  let totalNeedsReview = 0;

  todaySessions.forEach(session => {
    totalExpected += session.attendances.length; // Actually we should count enrollments for expected, but attendances are created for all matched so far.
    // For a real app, totalExpected = enrollments.
    session.attendances.forEach(a => {
      if (a.status === 'PRESENT') totalPresent++;
      if (a.status === 'ABSENT' || a.status === 'EXCUSED') totalAbsent++;
      if (a.status === 'LATE') totalLate++;
      if (a.status === 'NEEDS_REVIEW') totalNeedsReview++;
    });
  });

  return (
    <PageShell 
      title="Điểm danh" 
      description="Quản lý điểm danh Zalo tự động"
      primaryAction="Xuất báo cáo"
    >
      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Có mặt" value={totalPresent.toString()} icon={<CheckSquare className="w-5 h-5 text-emerald-600" />} />
          <StatCard title="Vắng mặt" value={totalAbsent.toString()} icon={<AlertCircle className="w-5 h-5 text-rose-600" />} />
          <StatCard title="Đi trễ" value={totalLate.toString()} icon={<Clock className="w-5 h-5 text-orange-600" />} />
          <StatCard title="Cần Review" value={totalNeedsReview.toString()} trend={totalNeedsReview > 0 ? "down" : "neutral"} icon={<Users className="w-5 h-5 text-amber-600" />} />
        </div>

        {/* Sessions List */}
        <SectionHeader title="Ca học hôm nay" />
        
        {todaySessions.length === 0 ? (
          <p className="text-slate-500">Không có ca học nào trong ngày hôm nay.</p>
        ) : (
          <div className="space-y-6">
            {todaySessions.map(session => {
              const present = session.attendances.filter(a => a.status === 'PRESENT').length;
              const absent = session.attendances.filter(a => a.status === 'ABSENT' || a.status === 'EXCUSED').length;
              const review = session.attendances.filter(a => a.status === 'NEEDS_REVIEW').length;
              
              return (
                <Card key={session.id} className="border-slate-200">
                  <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between py-3">
                    <div>
                      <CardTitle className="text-lg text-indigo-700">{session.class.classCode}</CardTitle>
                      <p className="text-xs text-slate-500">{session.startTime.toLocaleTimeString()} - {session.endTime.toLocaleTimeString()}</p>
                    </div>
                    <div className="flex gap-4 text-sm font-medium">
                      <span className="text-emerald-600">{present} Có mặt</span>
                      <span className="text-rose-600">{absent} Vắng</span>
                      {review > 0 && <span className="text-amber-600">{review} Cần xem xét</span>}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase border-b">
                        <tr>
                          <th className="px-6 py-3">Học viên</th>
                          <th className="px-6 py-3">Trạng thái</th>
                          <th className="px-6 py-3">Nguồn</th>
                          <th className="px-6 py-3 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {session.attendances.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-slate-500 italic">Chưa có dữ liệu điểm danh.</td>
                          </tr>
                        ) : (
                          session.attendances.map(record => (
                            <tr key={record.id} className="hover:bg-slate-50/50">
                              <td className="px-6 py-3 font-medium text-slate-900">{record.student.name}</td>
                              <td className="px-6 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                  ${record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' : 
                                    record.status === 'ABSENT' ? 'bg-rose-100 text-rose-700' : 
                                    record.status === 'LATE' ? 'bg-orange-100 text-orange-700' :
                                    record.status === 'EXCUSED' ? 'bg-blue-100 text-blue-700' :
                                    'bg-amber-100 text-amber-700'}`}
                                >
                                  {record.status === 'PRESENT' ? 'Có mặt' : 
                                   record.status === 'ABSENT' ? 'Vắng' : 
                                   record.status === 'LATE' ? 'Đi trễ' :
                                   record.status === 'EXCUSED' ? 'Có phép' :
                                   'Cần kiểm tra'}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-slate-500 text-xs">
                                {record.sourceMessageId ? "Zalo" : "Manual"}
                              </td>
                              <td className="px-6 py-3 text-right">
                                <Button variant="ghost" size="sm" className="text-indigo-600 h-8">Chỉnh sửa</Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
