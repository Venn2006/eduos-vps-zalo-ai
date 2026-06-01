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

  const debtRemindersCount = await prisma.zaloOutboxMessage.count({
    where: { tenantId, status: "PENDING_APPROVAL", text: { contains: "học phí" } }
  });

  const renewalRemindersCount = await prisma.zaloOutboxMessage.count({
    where: { tenantId, status: "PENDING_APPROVAL", text: { contains: "tái phí" } }
  });

  const pendingParentReports = await prisma.weeklyParentReport.count({
    where: { tenantId, status: { in: ["PENDING_TEACHER_REVIEW", "PENDING_ADMIN_APPROVAL"] } }
  });

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }});
  
  if (!tenant) {
    console.error(`[Dashboard] Tenant not found for activeTenantId: ${tenantId}`);
  }

  // Developer diagnostic logs
  console.log(`[Diagnostic] activeTenantId: ${tenantId}`);
  console.log(`[Diagnostic] tenantName: ${tenant?.name || 'NOT FOUND'}`);
  console.log(`[Diagnostic] studentCount: ${summary.totalStudents}`);
  console.log(`[Diagnostic] classCount: ${summary.totalClasses}`);
  console.log(`[Diagnostic] leadCount: ${summary.totalLeads}`);
  console.log(`[Diagnostic] invoiceCount: ${summary.totalUnpaidInvoices}`);

  // Attendance stats for today
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const todaySessions = await prisma.classSession.findMany({
    where: { tenantId, startTime: { gte: startOfDay, lte: endOfDay } },
    include: { attendances: true }
  });

  let totalPresent = 0;
  let totalAttendances = 0;
  let studentsAbsentToday = 0;

  todaySessions.forEach(session => {
    totalAttendances += session.attendances.length;
    session.attendances.forEach(a => {
      if (a.status === "PRESENT") totalPresent++;
      if (a.status === "ABSENT" || a.status === "EXCUSED") studentsAbsentToday++;
    });
  });

  const attendanceRate = totalAttendances > 0 ? Math.round((totalPresent / totalAttendances) * 100) + "%" : "N/A";
  const scheduledReminders = await prisma.scheduledTaskRun.count({
    where: { tenantId, taskName: { endsWith: "_CLASS_REMINDER_60M" }, createdAt: { gte: startOfDay } }
  });

  // Students absent 2+ sessions
  const absences = await prisma.attendance.groupBy({
    by: ['studentId'],
    where: { tenantId, status: { in: ['ABSENT', 'EXCUSED'] } },
    _count: { studentId: true },
    having: { studentId: { _count: { gte: 2 } } }
  });
  const studentsAbsentMultiple = absences.length;

  // Sales Funnel metrics
  const totalLeads = await prisma.lead.count({ where: { tenantId } });
  const contactedLeads = await prisma.lead.count({ where: { tenantId, stage: { notIn: ['NEW'] } } });
  const bookedLeads = await prisma.lead.count({ where: { tenantId, stage: { in: ['BOOKED_TRIAL', 'ATTENDED_TRIAL', 'WON'] } } });
  const paidLeads = await prisma.lead.count({ where: { tenantId, stage: 'WON' } });

  return (
    <div className="space-y-10 pb-12">
      {!tenant && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <h3 className="text-red-800 font-bold">Lỗi Phiên Đăng Nhập (Phiên Cũ)</h3>
          <p className="text-red-700 text-sm mt-1">
            Không tìm thấy trung tâm (Tenant ID: {tenantId}). Dữ liệu của bạn có thể đã được reset. 
            Vui lòng <a href="/api/auth/logout" className="underline font-bold text-blue-600">bấm vào đây để đăng xuất</a> và đăng nhập lại.
          </p>
        </div>
      )}
      
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
          <StatCard title="Học viên vắng (Hôm nay)" value={studentsAbsentToday.toString()} trend="up" description="Cần follow-up" icon={<AlertTriangle className="w-5 h-5 text-rose-600" />} />
          <StatCard title="Vắng 2+ buổi" value={studentsAbsentMultiple.toString()} trend="up" description="Nguy cơ bỏ học" icon={<AlertTriangle className="w-5 h-5 text-rose-800" />} />
          <StatCard title="Báo cáo cần duyệt" value={pendingParentReports.toString()} trend="neutral" description="AI gửi phụ huynh" icon={<FileEdit className="w-5 h-5 text-purple-600" />} />
          <StatCard title="Lớp chưa giao BT" value="1" trend="up" description="Cần nhắc GV" icon={<FileEdit className="w-5 h-5 text-amber-600" />} />
          <StatCard title="Nhắc lịch tự động" value={scheduledReminders.toString()} trend="up" description="Đã đặt lịch hôm nay" icon={<Clock className="w-5 h-5 text-blue-600" />} />
          <StatCard title="Tỷ lệ chuyên cần" value={attendanceRate} trend="neutral" description="Hôm nay" icon={<CheckSquare className="w-5 h-5 text-teal-600" />} />
          <StatCard title="Hóa đơn chưa thu" value={summary.totalUnpaidInvoices.toString()} trend="down" description="Cần theo dõi" icon={<AlertTriangle className="w-5 h-5 text-warning" />} />
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

          {/* Sales Funnel Chart */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Phễu Tuyển sinh</CardTitle>
                <p className="text-xs text-slate-500">Data &rarr; Đã gọi &rarr; Học thử &rarr; Đã nộp tiền</p>
              </CardHeader>
              <CardContent className="h-56 flex items-end justify-between gap-4 pt-4 px-6 pb-6">
                {[
                  { label: 'Tổng Data', value: totalLeads },
                  { label: 'Đã liên hệ', value: contactedLeads },
                  { label: 'Đặt lịch thử', value: bookedLeads },
                  { label: 'Đã nộp tiền', value: paidLeads }
                ].map((step, i) => (
                  <div key={i} className="w-full flex flex-col items-center justify-end h-full group">
                    <div className="absolute -translate-y-8 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-2">
                      {step.value}
                    </div>
                    <div 
                      className="w-full bg-primary hover:bg-primary/80 rounded-t-md transition-colors relative" 
                      style={{ height: `${totalLeads > 0 ? Math.max((step.value / totalLeads) * 100, 5) : 5}%` }}
                    />
                    <p className="text-xs text-zinc-500 text-center mt-2 h-6">{step.label}</p>
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
              <CardTitle className="text-primary flex items-center justify-between font-extrabold text-lg">
                <span className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> AI Command Center</span>
                <a href="/ai-center" className="text-sm font-medium bg-primary text-white px-3 py-1 rounded-md hover:bg-primary/90 transition-colors shadow-sm">Mở CEO Chat</a>
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
              {(debtRemindersCount > 0 || renewalRemindersCount > 0) && (
                <AiSuggestionCard 
                  type="draft"
                  title={`${debtRemindersCount} Nhắc nợ & ${renewalRemindersCount} Tái phí`} 
                  description="AI đã tạo tin nhắn tự động nhắc nhở công nợ và gia hạn học phí. Chờ bạn duyệt để gửi vào Zalo cá nhân."
                  actionLabel="Duyệt nhắc nhở"
                  badges={["system", "needs-review"]}
                />
              )}
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
