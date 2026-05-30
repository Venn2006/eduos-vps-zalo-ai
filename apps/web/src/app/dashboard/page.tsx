import React from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatCard } from '@/components/ui/StatCard';
import { ModuleCard } from '@/components/ui/ModuleCard';
import { AiSuggestionCard, AiBadgeType } from '@/components/ui/AiSuggestionCard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  CheckSquare, 
  FileEdit, 
  CreditCard, 
  RefreshCw, 
  MessageCircle, 
  MessageSquare, 
  PieChart, 
  Settings,
  Plus,
  UserPlus,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { getDashboardSummaryForTenant, prisma } from '@eduos/db';
import { getCurrentTenantOrThrow } from '@/lib/auth';

export default async function DashboardPage() {
  const tenantId = await getCurrentTenantOrThrow();
  const summary = await getDashboardSummaryForTenant(prisma, tenantId);

  const classesWithoutBotCount = await prisma.class.count({
    where: { tenantId, status: "ACTIVE", zaloGroup: null }
  });

  const pendingCommandsCount = await prisma.classBootstrapCommand.count({
    where: { tenantId, status: "NEEDS_REVIEW" }
  });

  const offlineConnectorsCount = await prisma.zaloConnectorSession.count({
    where: { tenantId, status: "OFFLINE" }
  });

  return (
    <div className="space-y-10 pb-12">
      
      {/* 1. Executive KPIs */}
      <section>
        <SectionHeader 
          title="Tổng quan hoạt động" 
          description="Các chỉ số quan trọng trong tháng này"
          action={<Button variant="outline" size="sm" className="hidden sm:flex border-primary text-primary hover:bg-primary/5">Tải báo cáo <ArrowUpRight className="w-4 h-4 ml-2"/></Button>}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard title="Học viên" value={summary.totalStudents.toString()} trend="neutral" description="Đang theo học" icon={<GraduationCap className="w-5 h-5 text-purple-600" />} />
          <StatCard title="Lớp học" value={summary.totalClasses.toString()} trend="neutral" description="Đang hoạt động" icon={<Users className="w-5 h-5 text-fuchsia-600" />} />
          <StatCard title="Lead mới tháng này" value={summary.totalLeads.toString()} trend="up" description="Chưa chuyển đổi" icon={<Users className="w-5 h-5 text-blue-600" />} />
          <StatCard title="Học thử tuần này" value={summary.totalTrialBookings.toString()} trend="neutral" description="Đã đặt lịch" icon={<BookOpen className="w-5 h-5 text-indigo-600" />} />
          <StatCard title="Hóa đơn chưa thu" value={summary.totalUnpaidInvoices.toString()} trend="down" description="Cần theo dõi" icon={<AlertTriangle className="w-5 h-5 text-warning" />} />
          <StatCard title="Tỷ lệ chuyên cần" value="95%" trend="up" description="Cao hơn trung bình" icon={<CheckSquare className="w-5 h-5 text-teal-600" />} />
          <StatCard title="Báo cáo phụ huynh" value="10" trend="neutral" description="Đang chờ duyệt gửi" icon={<FileEdit className="w-5 h-5 text-fuchsia-600" />} />
          <StatCard title="Zalo Bot VPS" value="Online" description="Hoạt động ổn định 24/7" icon={<CheckCircle2 className="w-5 h-5 text-success" />} />
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="xl:col-span-2 space-y-10">
          
          {/* 2. Quick Actions */}
          <section>
            <div className="flex items-center space-x-2 mb-5">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Thao tác nhanh</h3>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button className="shadow-md hover:shadow-lg"><UserPlus className="w-4 h-4 mr-2"/>Tạo lead mới</Button>
              <Button variant="secondary" className="shadow-md hover:shadow-lg"><Plus className="w-4 h-4 mr-2"/>Mở lớp mới</Button>
              <Button variant="outline" className="bg-white hover:bg-slate-50"><CheckSquare className="w-4 h-4 mr-2 text-emerald-600"/>Điểm danh nhanh</Button>
              <Button variant="outline" className="bg-white hover:bg-slate-50"><CreditCard className="w-4 h-4 mr-2 text-rose-600"/>Thu học phí</Button>
            </div>
          </section>

          {/* 3. Module Launcher Grid */}
          <section>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-5">Quản lý trung tâm</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <ModuleCard href="/leads" title="Tuyển sinh" description="Quản lý phễu" icon={<Users className="w-10 h-10"/>} bgColor="bg-blue-100 text-blue-600" />
              <ModuleCard href="/trial-bookings" title="Học thử" description="Xếp lịch & Đánh giá" icon={<BookOpen className="w-10 h-10"/>} bgColor="bg-indigo-100 text-indigo-600" />
              <ModuleCard href="/students" title="Học viên" description="Hồ sơ & Lịch sử" icon={<GraduationCap className="w-10 h-10"/>} bgColor="bg-purple-100 text-purple-600" />
              <ModuleCard href="/classes" title="Lớp học" description="Thời khóa biểu" icon={<Users className="w-10 h-10"/>} bgColor="bg-fuchsia-100 text-fuchsia-600" />
              <ModuleCard href="/attendance" title="Điểm danh" description="Theo dõi sĩ số" icon={<CheckSquare className="w-10 h-10"/>} bgColor="bg-emerald-100 text-emerald-600" />
              <ModuleCard href="/homework" title="Bài tập" description="Giao & Chấm điểm" icon={<FileEdit className="w-10 h-10"/>} bgColor="bg-teal-100 text-teal-600" />
              <ModuleCard href="/payments" title="Học phí" description="Thu phí & Hóa đơn" icon={<CreditCard className="w-10 h-10"/>} bgColor="bg-rose-100 text-rose-600" />
              <ModuleCard href="/renewals" title="Tái phí" description="Gia hạn khóa" icon={<RefreshCw className="w-10 h-10"/>} bgColor="bg-orange-100 text-orange-600" />
              <ModuleCard href="/fanpage-inbox" title="Fanpage Inbox" description="Tin nhắn Facebook" icon={<MessageCircle className="w-10 h-10"/>} bgColor="bg-sky-100 text-sky-600" />
              <ModuleCard href="/zalo-groups" title="Zalo Groups" description="Quản lý nhóm Zalo" icon={<MessageSquare className="w-10 h-10"/>} bgColor="bg-blue-100 text-blue-600" />
              <ModuleCard href="/reports" title="Báo cáo" description="Phân tích dữ liệu" icon={<PieChart className="w-10 h-10"/>} bgColor="bg-slate-100 text-slate-600" />
              <ModuleCard href="/settings" title="Cài đặt" description="Cấu hình hệ thống" icon={<Settings className="w-10 h-10"/>} bgColor="bg-slate-100 text-slate-600" />
            </div>
          </section>

          {/* Polished Mock Charts */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Xu hướng tuyển sinh</CardTitle>
                <p className="text-xs text-slate-500">Số lượng lead mới trong 6 tháng qua</p>
              </CardHeader>
              <CardContent className="h-56 flex items-end justify-between gap-2 pt-4">
                {[40, 60, 45, 80, 55, 90].map((h, i) => (
                  <div key={i} className="w-full bg-primary/20 hover:bg-primary rounded-t-md transition-colors relative group" style={{ height: `${h}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{h} Leads</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Doanh thu khóa học</CardTitle>
                <p className="text-xs text-slate-500">So sánh doanh thu thực tế và dự kiến</p>
              </CardHeader>
              <CardContent className="h-56 flex items-end justify-between gap-4 pt-4">
                {[60, 80, 50, 95].map((h, i) => (
                  <div key={i} className="w-full flex gap-1 items-end h-full">
                    <div className="w-full bg-indigo-500 rounded-t-md hover:bg-indigo-600 transition-colors" style={{ height: `${h}%` }}></div>
                    <div className="w-full bg-emerald-400 rounded-t-md hover:bg-emerald-500 transition-colors" style={{ height: `${h-15}%` }}></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

        </div>

        {/* Side Column: AI Command Center & Feed */}
        <div className="space-y-8">
          
          <Card className="border-primary/20 shadow-lg shadow-primary/5 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0"></div>
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/10 pb-4 relative z-10">
              <CardTitle className="text-primary flex items-center gap-2 font-extrabold text-lg">
                <Sparkles className="w-5 h-5" /> AI Command Center
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1 font-medium">Trợ lý ảo tự động hóa trung tâm</p>
            </CardHeader>
            <CardContent className="p-5 space-y-5 relative z-10">
              {pendingCommandsCount > 0 && (
                <AiSuggestionCard 
                  type="alert"
                  title={`${pendingCommandsCount} Setup command cần duyệt`} 
                  description="Có lệnh cài đặt lớp từ Zalo nhưng người gửi chưa được xác thực."
                  actionLabel="Duyệt lệnh"
                  badges={["needs-review", "security"]}
                />
              )}
              {offlineConnectorsCount > 0 && (
                <AiSuggestionCard 
                  type="alert"
                  title={`${offlineConnectorsCount} Connector offline`} 
                  description="Trợ lý Zalo VPS đang mất kết nối. Vui lòng kiểm tra lại VPS hoặc mã đăng nhập."
                  actionLabel="Kiểm tra ngay"
                  badges={["urgent", "system"]}
                />
              )}
              {classesWithoutBotCount > 0 && (
                <AiSuggestionCard 
                  type="alert"
                  title={`${classesWithoutBotCount} Lớp chưa setup Zalo Bot`} 
                  description="Một số lớp đang hoạt động nhưng chưa thêm trợ lý Zalo vào nhóm."
                  actionLabel="Xem danh sách"
                  badges={["urgent", "automated"]}
                />
              )}
              <AiSuggestionCard 
                type="draft"
                title="10 Báo cáo phụ huynh" 
                description="AI đã tổng hợp nhận xét tuần qua. Chờ bạn duyệt để gửi vào Zalo cá nhân."
                actionLabel="Duyệt báo cáo"
                badges={["needs-review", "ai-generated"]}
              />
              <AiSuggestionCard 
                type="insight"
                title="Gợi ý follow-up" 
                description="Có 5 học viên đã học thử 24h trước. Trợ lý ảo đã lên nháp kịch bản chốt sale."
                actionLabel="Xem nháp"
                badges={["ai-generated"]}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-0.5 bg-slate-100 p-1.5 rounded-full"><Clock className="w-4 h-4 text-slate-500" /></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Thanh toán học phí thành công</p>
                    <p className="text-xs text-slate-500 mt-0.5">Nguyễn Văn A - Lớp IELTS-0{i} • 10 phút trước</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
