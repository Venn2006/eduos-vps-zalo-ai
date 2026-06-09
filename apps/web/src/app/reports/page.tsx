import { getSession } from '@/lib/auth';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { prisma, SalesQueries } from '@eduos/db';
import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, PhoneCall, BookOpen, CheckCircle, Percent } from 'lucide-react';

export default async function ReportsPage() {
  const authSession = await getSession();
  if (!authSession || !canAccessRoute(authSession.role, "/reports")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = authSession.activeTenantId;

  const salesQueries = new SalesQueries(prisma);
  const data = await salesQueries.getSalesReportsForTenant(tenantId);

  return (
    <PageShell 
      title="Báo Cáo Telesale & Tuyển Sinh" 
      description="Theo dõi hiệu suất gọi điện và tỷ lệ chuyển đổi (Conversion Rates)."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Tỷ lệ Contact" value={`${data.contactRate}%`} description={`${data.contactedLeads}/${data.totalLeads} data`} icon={<PhoneCall />} color="text-blue-600" />
        <MetricCard title="Tỷ lệ Đặt hẹn" value={`${data.trialRate}%`} description={`${data.bookedTrials}/${data.contactedLeads} người nghe máy`} icon={<BookOpen />} color="text-indigo-600" />
        <MetricCard title="Tỷ lệ Đến học thử" value={`${data.showRate}%`} description={`${data.attendedTrials}/${data.bookedTrials} lịch hẹn`} icon={<Users />} color="text-purple-600" />
        <MetricCard title="Tỷ lệ Chốt Sale (Win)" value={`${data.winRate}%`} description={`${data.wonLeads}/${data.attendedTrials} người học thử`} icon={<CheckCircle />} color="text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Phễu Chuyển Đổi</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-end justify-between gap-4 pt-4 px-6 pb-6 border-b">
            {[
              { label: 'Data', value: data.totalLeads, color: 'bg-slate-300' },
              { label: 'Đã liên hệ', value: data.contactedLeads, color: 'bg-blue-400' },
              { label: 'Hẹn lịch', value: data.bookedTrials, color: 'bg-indigo-400' },
              { label: 'Đến học', value: data.attendedTrials, color: 'bg-purple-400' },
              { label: 'Đã nộp tiền', value: data.wonLeads, color: 'bg-emerald-400' }
            ].map((step, i) => (
              <div key={i} className="w-full flex flex-col items-center justify-end h-full group">
                <div className="absolute -translate-y-8 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-2">
                  {step.value}
                </div>
                <div 
                  className={`w-full ${step.color} hover:brightness-90 rounded-t-md transition-all relative`}
                  style={{ height: `${data.totalLeads > 0 ? Math.max((step.value / data.totalLeads) * 100, 5) : 5}%` }}
                />
                <p className="text-xs text-zinc-500 text-center mt-2 h-6">{step.label}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Hiệu Suất Nhân Viên</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500">
                <tr>
                  <th className="p-3">Nhân viên</th>
                  <th className="p-3 text-right">Data</th>
                  <th className="p-3 text-right">Đã liên hệ</th>
                  <th className="p-3 text-right">Chốt Sale (Win)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data.staffPerformance.map((staff: any) => (
                  <tr key={staff.id}>
                    <td className="p-3 font-medium">{staff.name}</td>
                    <td className="p-3 text-right">{staff.total}</td>
                    <td className="p-3 text-right text-blue-600">{staff.contacted}</td>
                    <td className="p-3 text-right text-emerald-600 font-bold">{staff.won}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Nguồn & Chiến dịch hiệu quả</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500">
                <tr>
                  <th className="p-3">Nguồn / Chiến dịch</th>
                  <th className="p-3 text-right">Data</th>
                  <th className="p-3 text-right">Chốt Sale (Win)</th>
                  <th className="p-3 text-right">Tỷ lệ chuyển đổi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data.sourcePerformance.map((source: any) => (
                  <tr key={source.id}>
                    <td className="p-3 font-medium">{source.name}</td>
                    <td className="p-3 text-right">{source.total}</td>
                    <td className="p-3 text-right text-emerald-600 font-bold">{source.won}</td>
                    <td className="p-3 text-right text-indigo-600">{source.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

function MetricCard({ title, value, description, icon, color }: any) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-5 flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-slate-50 ${color}`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
