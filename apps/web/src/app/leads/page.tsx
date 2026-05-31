import React from 'react';
import { prisma } from '@eduos/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { PageShell } from '@/components/layout/PageShell';
import { Search, Filter, Download } from 'lucide-react';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_super_secret_for_development");

export default async function LeadsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return <div>Unauthorized</div>;

  let session: any;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    session = payload;
  } catch {
    return <div>Invalid token</div>;
  }

  const leads = await prisma.lead.findMany({
    where: { tenantId: session.activeTenantId },
    orderBy: { createdAt: 'desc' },
    include: {
      batch: true,
      course: true,
      callAttempts: {
        orderBy: { calledAt: 'desc' },
        take: 1
      }
    },
    take: 50
  });

  // Calculate summary metrics for the header
  const totalLeads = await prisma.lead.count({ where: { tenantId: session.activeTenantId } });
  const wonLeads = await prisma.lead.count({ where: { tenantId: session.activeTenantId, stage: 'WON' } });
  const hotLeads = await prisma.lead.count({ where: { tenantId: session.activeTenantId, temperature: 'HOT' } });

  return (
    <PageShell 
      title="Quản lý Tuyển sinh (Leads)" 
      description="Tổng quan khách hàng tiềm năng, trạng thái và phân công."
      primaryAction="Nhập dữ liệu"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-sm">Tổng khách hàng</p>
          <p className="text-2xl font-bold">{totalLeads}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-sm">Khách hàng rất quan tâm (Hot)</p>
          <p className="text-2xl font-bold text-red-600">{hotLeads}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-sm">Đã chốt (Nộp học phí)</p>
          <p className="text-2xl font-bold text-green-600">{wonLeads}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-500 text-sm">Tỷ lệ chuyển đổi</p>
          <p className="text-2xl font-bold text-blue-600">
            {totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0}%
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input type="text" placeholder="Tìm kiếm khách hàng..." className="pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm w-64" />
            </div>
            <button className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm flex items-center gap-2 hover:bg-zinc-50">
              <Filter className="w-4 h-4" /> Lọc
            </button>
          </div>
          <button className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm flex items-center gap-2 hover:bg-zinc-50">
            <Download className="w-4 h-4" /> Xuất CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500">
              <tr>
                <th className="p-4 font-medium">Tên khách hàng</th>
                <th className="p-4 font-medium">Liên hệ</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium">Độ quan tâm</th>
                <th className="p-4 font-medium">Cuộc gọi cuối</th>
                <th className="p-4 font-medium">Nguồn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {leads.map(lead => (
                <tr key={lead.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="p-4">
                    <p className="font-medium text-blue-600 cursor-pointer">{lead.name}</p>
                    {lead.fullName && <p className="text-xs text-zinc-500">{lead.fullName}</p>}
                  </td>
                  <td className="p-4">
                    <p>{lead.phone || '-'}</p>
                    {lead.email && <p className="text-xs text-zinc-500">{lead.email}</p>}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-xs font-medium border border-zinc-200 dark:border-zinc-700">
                      {lead.stage}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      lead.temperature === 'HOT' ? 'bg-red-100 text-red-700' :
                      lead.temperature === 'WARM' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {lead.temperature}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-medium">{lead.lastCallOutcome || 'CHƯA GỌI'}</p>
                    <p className="text-xs text-zinc-500">
                      {lead.lastCallAt ? new Date(lead.lastCallAt).toLocaleString() : 'Chưa từng'}
                    </p>
                  </td>
                  <td className="p-4">
                    <p>{lead.batch?.name || 'Trực tiếp'}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
