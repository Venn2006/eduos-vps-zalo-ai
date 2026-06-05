import React from 'react';
import Link from 'next/link';
import { canAccessRoute } from '@/lib/rbac';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { getSession } from '@/lib/auth';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ActionCard } from '@/components/ui/ActionCard';
import { 
  demoKpiData, 
  demoCommandFeed, 
  demoStaffWorkload, 
  demoAiInsights, 
  demoUrgentAlerts 
} from '@/lib/ceoCommandDemoData';
import { 
  Wallet, 
  UserPlus, 
  MessageSquareWarning, 
  ListTodo, 
  UserX, 
  BadgeDollarSign,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Bot
} from 'lucide-react';

export default async function DashboardPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/dashboard")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  // Calculate currency format
  const formattedRevenue = `${(demoKpiData.revenueMonth / 1000000).toFixed(1)} Tr`;
  const formattedDebt = `${(demoKpiData.outstandingDebt / 1000000).toFixed(1)} Tr`;

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* 1. HERO HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Tổng quan CEO</h1>
          <p className="text-slate-400">
            Hôm nay trung tâm có gì cần xử lý? Dữ liệu demo từ hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status="warning" label="Demo: Chưa gửi thật" />
        </div>
      </div>

      {/* URGENT ALERTS */}
      {demoUrgentAlerts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col gap-3">
          {demoUrgentAlerts.map(alert => (
            <div key={alert.id} className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span className="font-medium">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard 
          title="Doanh thu tháng này"
          value={formattedRevenue}
          icon={<Wallet className="w-5 h-5" />}
          trend="up"
          trendValue="12%"
        />
        <MetricCard 
          title="Lead mới"
          value={demoKpiData.newLeadsToday}
          icon={<UserPlus className="w-5 h-5" />}
          trend="up"
          trendValue="5%"
        />
        <MetricCard 
          title="Tin nhắn chưa trả lời"
          value={demoKpiData.unreadMessages}
          icon={<MessageSquareWarning className="w-5 h-5" />}
          color="warning"
        />
        <MetricCard 
          title="Công nợ cần chú ý"
          value={formattedDebt}
          icon={<BadgeDollarSign className="w-5 h-5" />}
          color="danger"
        />
        <MetricCard 
          title="Việc quá hạn"
          value={demoKpiData.overdueTasks}
          icon={<ListTodo className="w-5 h-5" />}
          color="warning"
        />
        <MetricCard 
          title="Học viên rủi ro"
          value={demoKpiData.atRiskStudents}
          icon={<UserX className="w-5 h-5" />}
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* LEFT COLUMN (2/3 width) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* 3. TODAY COMMAND FEED */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-xl">
            <div className="px-6 py-5 border-b border-slate-800">
              <h2 className="text-xl font-semibold text-white">Việc cần xử lý hôm nay</h2>
            </div>
            <div className="divide-y divide-slate-800/50">
              {demoCommandFeed.map(cmd => (
                <div key={cmd.id} className="p-6 hover:bg-slate-800/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge 
                          status={cmd.priority === 'urgent' ? 'danger' : cmd.priority === 'high' ? 'warning' : 'info'} 
                          label={cmd.owner} 
                        />
                        <h3 className="text-lg font-medium text-white">{cmd.title}</h3>
                      </div>
                      <p className="text-slate-400">{cmd.description}</p>
                    </div>
                    <Link 
                      href={cmd.relatedRoute}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
                    >
                      Xử lý ngay <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. AI INSIGHTS PANEL */}
          <section className="bg-gradient-to-br from-indigo-950/40 to-slate-900/50 border border-indigo-500/20 rounded-xl overflow-hidden backdrop-blur-xl relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <BrainCircuit className="w-32 h-32 text-indigo-400" />
            </div>
            <div className="px-6 py-5 border-b border-slate-800 relative z-10 flex items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-400" />
              <h2 className="text-xl font-semibold text-white">AI gợi ý ưu tiên</h2>
            </div>
            <div className="p-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoAiInsights.map(insight => (
                  <div key={insight.id} className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-5">
                    <h3 className="text-white font-medium mb-2">{insight.title}</h3>
                    <p className="text-slate-400 text-sm mb-4">{insight.reason}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                        {insight.safetyMode}
                      </span>
                      <Link href={insight.route} className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                        {insight.suggestedAction} &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN (1/3 width) */}
        <div className="space-y-8">
          
          {/* 5. QUICK ACTIONS */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Lối tắt CEO</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/fanpage-inbox" className="bg-slate-800 hover:bg-slate-700 p-3 rounded-lg text-center transition-colors border border-slate-700">
                <span className="block text-sm font-medium text-slate-200">Mở Inbox</span>
              </Link>
              <Link href="#" className="bg-slate-800 hover:bg-slate-700 p-3 rounded-lg text-center transition-colors border border-slate-700 opacity-60 cursor-not-allowed" title="Giao việc chưa khả dụng">
                <span className="block text-sm font-medium text-slate-200">Giao việc</span>
              </Link>
              <Link href="/crm-command-center" className="bg-slate-800 hover:bg-slate-700 p-3 rounded-lg text-center transition-colors border border-slate-700">
                <span className="block text-sm font-medium text-slate-200">Xem CRM</span>
              </Link>
              <Link href="/workspaces/finance" className="bg-slate-800 hover:bg-slate-700 p-3 rounded-lg text-center transition-colors border border-slate-700">
                <span className="block text-sm font-medium text-slate-200">Tài chính</span>
              </Link>
            </div>
          </section>

          {/* 6. STAFF WORKLOAD PANEL */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-xl">
            <div className="px-6 py-5 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">Nhân viên đang xử lý</h2>
            </div>
            <div className="divide-y divide-slate-800/50">
              {demoStaffWorkload.map(staff => (
                <div key={staff.id} className="p-5 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold">
                          {staff.staffName.charAt(0)}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${staff.isOnline ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">{staff.staffName}</div>
                        <div className="text-xs text-slate-400">{staff.role}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-slate-800/50 rounded p-2 text-center">
                      <div className="text-xs text-slate-400 mb-1">Leads</div>
                      <div className="font-semibold text-white">{staff.activeLeads}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded p-2 text-center">
                      <div className="text-xs text-slate-400 mb-1">Tin nhắn</div>
                      <div className="font-semibold text-white">{staff.conversations}</div>
                    </div>
                    <div className={`rounded p-2 text-center ${staff.overdueTasks > 0 ? 'bg-red-500/10' : 'bg-slate-800/50'}`}>
                      <div className="text-xs text-slate-400 mb-1">Quá hạn</div>
                      <div className={`font-semibold ${staff.overdueTasks > 0 ? 'text-red-400' : 'text-white'}`}>{staff.overdueTasks}</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 bg-slate-800/30 p-2 rounded">
                    <span className="font-medium text-slate-300">Tiếp theo:</span> {staff.nextAction}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
