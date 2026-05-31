import React from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { prisma } from '@eduos/db';
import { getCurrentTenantOrThrow } from '@/lib/auth';
import { Users, Clock, CheckSquare } from 'lucide-react';

export default async function ClassesPage() {
  const tenantId = await getCurrentTenantOrThrow();

  const classes = await prisma.class.findMany({
    where: { tenantId },
    include: {
      teacher: true,
      automationSetting: true,
      sessions: {
        include: { attendances: true }
      }
    }
  });

  return (
    <PageShell 
      title="Lớp học" 
      description="Quản lý danh sách lớp học và chuyên cần"
      primaryAction="Thêm lớp học"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {classes.map(cls => {
          let totalPresent = 0;
          let totalAttendances = 0;
          let nextSession: any = null;
          
          const now = new Date();
          
          cls.sessions.forEach(session => {
            if (session.startTime > now && (!nextSession || session.startTime < nextSession.startTime)) {
              nextSession = session;
            }
            
            totalAttendances += session.attendances.length;
            session.attendances.forEach(a => {
              if (a.status === 'PRESENT') totalPresent++;
            });
          });

          const rate = totalAttendances > 0 ? Math.round((totalPresent / totalAttendances) * 100) : null;

          return (
            <Card key={cls.id} className="border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between py-4">
                <div>
                  <CardTitle className="text-xl text-indigo-700">{cls.classCode}</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">Giáo viên: {cls.teacher?.name || 'Chưa phân công'}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${cls.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                    {cls.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center text-slate-600">
                    <CheckSquare className="w-4 h-4 mr-2" /> Tỷ lệ chuyên cần
                  </div>
                  <div className="font-semibold text-slate-900">
                    {rate !== null ? `${rate}%` : 'Chưa có dữ liệu'}
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center text-slate-600">
                    <Clock className="w-4 h-4 mr-2" /> Ca học tiếp theo
                  </div>
                  <div className="font-semibold text-slate-900">
                    {nextSession ? nextSession.startTime.toLocaleString('vi-VN') : 'Trống'}
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center text-slate-600">
                    <Users className="w-4 h-4 mr-2" /> Nhắc lịch lớp (Auto)
                  </div>
                  <div className="font-semibold text-slate-900">
                    {cls.automationSetting?.classReminderEnabled ? 
                      <span className="text-emerald-600">Đang bật (Trước 60p)</span> : 
                      <span className="text-slate-500">Đã tắt</span>
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
