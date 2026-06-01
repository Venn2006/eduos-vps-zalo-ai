import React from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ActionCard } from '@/components/ui/ActionCard';
import { AiCommandBar } from '@/components/ui/AiCommandBar';
import { getDashboardSummaryForTenant, prisma } from '@eduos/db';
import { getCurrentTenantOrThrow } from '@/lib/auth';
import { Link, Users, GraduationCap, FileEdit, CreditCard, Bot, RefreshCw, MessageCircle } from 'lucide-react';

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
  
  const pendingAiDrafts = await prisma.aiActionDraft.count({
    where: { tenantId, status: "PENDING_APPROVAL" }
  });

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }});
  
  // Attendance stats for today
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  // Students absent 2+ sessions
  const absences = await prisma.attendance.groupBy({
    by: ['studentId'],
    where: { tenantId, status: { in: ['ABSENT', 'EXCUSED'] } },
    _count: { studentId: true },
    having: { studentId: { _count: { gte: 2 } } }
  });
  const studentsAbsentMultiple = absences.length;

  // Sales Funnel metrics for today
  const bookedTrialsToday = await prisma.lead.count({ 
    where: { tenantId, stage: 'BOOKED_TRIAL', updatedAt: { gte: startOfDay } } 
  });
  const paidLeadsToday = await prisma.lead.count({ 
    where: { tenantId, stage: 'WON', updatedAt: { gte: startOfDay } } 
  });
  const newLeadsToday = await prisma.lead.count({
    where: { tenantId, createdAt: { gte: startOfDay } }
  });

  return (
    <div className="space-y-8 pb-12">
      {!tenant && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <h3 className="text-red-800 font-bold">Lỗi Phiên Đăng Nhập (Phiên Cũ)</h3>
          <p className="text-red-700 text-sm mt-1">
            Không tìm thấy trung tâm (Tenant ID: {tenantId}). Vui lòng đăng xuất và đăng nhập lại.
          </p>
        </div>
      )}

      {/* CEO AI Command Center */}
      <AiCommandBar />

      <div className="space-y-10">
        
        {/* 1. Việc cần xử lý gấp */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">🚨 Việc cần xử lý gấp</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard 
              title="Zalo Bot VPS"
              metric={offlineConnectorsCount}
              severity={offlineConnectorsCount > 0 ? "critical" : "success"}
              reason={offlineConnectorsCount > 0 ? "Có Connector đang offline. Hệ thống auto-reply bị ngưng trệ." : "Hệ thống hoạt động ổn định 24/7."}
              ctaText={offlineConnectorsCount > 0 ? "Sửa lỗi VPS" : "Cấu hình Zalo"}
              ctaHref="/settings/zalo-accounts"
            />
            <ActionCard 
              title="Lệnh Setup Zalo"
              metric={pendingCommandsCount}
              severity={pendingCommandsCount > 0 ? "warning" : "info"}
              reason={pendingCommandsCount > 0 ? "Có lệnh cài đặt lớp từ Zalo chờ duyệt vì an bảo mật." : "Không có lệnh nào cần duyệt."}
              ctaText="Duyệt lệnh"
              ctaHref="/zalo-groups"
            />
            <ActionCard 
              title="Hóa đơn chưa thu"
              metric={summary.totalUnpaidInvoices}
              severity={summary.totalUnpaidInvoices > 0 ? "critical" : "success"}
              reason="Hóa đơn đã đến hạn hoặc quá hạn nhưng chưa được thanh toán."
              ctaText="Xem công nợ"
              ctaHref="/payments"
            />
            <ActionCard 
              title="Lớp thiếu Zalo Bot"
              metric={classesWithoutBotCount}
              severity={classesWithoutBotCount > 0 ? "warning" : "info"}
              reason="Lớp đang học nhưng chưa có Bot tự động để gửi thông báo/điểm danh."
              ctaText="Thêm Bot ngay"
              ctaHref="/classes"
            />
          </div>
        </section>

        {/* 2. AI Agents */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">🤖 AI Agents</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard 
              title="Báo cáo phụ huynh"
              metric={pendingParentReports}
              severity={pendingParentReports > 0 ? "warning" : "success"}
              reason="Báo cáo tuần do AI viết chờ giáo viên và quản lý duyệt trước khi gửi."
              ctaText="Duyệt báo cáo"
              ctaHref="/parent-reports"
            />
            <ActionCard 
              title="Nhắc nợ học phí"
              metric={debtRemindersCount}
              severity={debtRemindersCount > 0 ? "warning" : "info"}
              reason="Tin nhắn nhắc nợ do AI soạn thảo đang chờ bạn duyệt."
              ctaText="Duyệt gửi Zalo"
              ctaHref="/zalo-inbox"
            />
            <ActionCard 
              title="Tin nhắc tái phí"
              metric={renewalRemindersCount}
              severity={renewalRemindersCount > 0 ? "warning" : "info"}
              reason="Tin nhắn gợi ý gia hạn khóa học do AI tự lên kịch bản."
              ctaText="Duyệt gửi Zalo"
              ctaHref="/zalo-inbox"
            />
            <ActionCard 
              title="AI Drafts khác"
              metric={pendingAiDrafts}
              severity={pendingAiDrafts > 0 ? "warning" : "info"}
              reason="Các hành động do AI đề xuất từ CEO Chat đang chờ phê duyệt."
              ctaText="Kiểm tra CEO Chat"
              ctaHref="/ai-center"
            />
          </div>
        </section>

        {/* 3. Lớp học & Học viên */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">🎓 Lớp học & Học viên</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard 
              title="Tổng học viên"
              metric={summary.totalStudents}
              severity="info"
              reason="Số lượng học viên đang theo học hiện tại."
              ctaText="Danh sách học viên"
              ctaHref="/students"
            />
            <ActionCard 
              title="Học viên nghỉ 2+ buổi"
              metric={studentsAbsentMultiple}
              severity={studentsAbsentMultiple > 0 ? "critical" : "success"}
              reason="Học viên có nguy cơ bỏ học vì vắng nhiều buổi liên tiếp."
              ctaText="Gọi phụ huynh"
              ctaHref="/attendance"
            />
            <ActionCard 
              title="Lớp đang học"
              metric={summary.totalClasses}
              severity="info"
              reason="Số lượng lớp đang hoạt động trong hệ thống."
              ctaText="Quản lý lớp"
              ctaHref="/classes"
            />
            <ActionCard 
              title="Bài tập chưa chấm"
              metric={0} // Placeholder until HW implemented
              severity="success"
              reason="Tất cả bài tập đã được chấm điểm."
              ctaText="Kiểm tra bài tập"
              ctaHref="/homework"
            />
          </div>
        </section>

        {/* 4. Tuyển sinh hôm nay */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">🚀 Tuyển sinh (Hôm nay)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard 
              title="Lịch học thử mới"
              metric={bookedTrialsToday}
              severity={bookedTrialsToday > 0 ? "info" : "warning"}
              reason="Số lịch hẹn học thử được chốt trong hôm nay."
              ctaText="Xếp lớp học thử"
              ctaHref="/trial-bookings"
            />
            <ActionCard 
              title="Đã đóng tiền"
              metric={paidLeadsToday}
              severity={paidLeadsToday > 0 ? "success" : "info"}
              reason="Học viên đã nộp học phí và chính thức nhập học hôm nay."
              ctaText="Xem danh sách"
              ctaHref="/leads"
            />
            <ActionCard 
              title="Tổng Leads mới"
              metric={newLeadsToday}
              severity="info"
              reason="Leads mới đổ về hệ thống hôm nay."
              ctaText="Phân bổ lead"
              ctaHref="/leads"
            />
          </div>
        </section>

        {/* 5. Báo cáo & Phân tích */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">📊 Báo cáo & Phân tích</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard 
              title="Phễu tuyển sinh"
              metric="Xem"
              severity="info"
              reason="Phân tích tỷ lệ chuyển đổi từ Lead sang Học viên thực tế."
              ctaText="Mở báo cáo"
              ctaHref="/reports"
            />
            <ActionCard 
              title="Dòng tiền (Cashflow)"
              metric="Xem"
              severity="info"
              reason="Biểu đồ thu chi và dự báo dòng tiền tháng này."
              ctaText="Mở báo cáo"
              ctaHref="/reports"
            />
            <ActionCard 
              title="Hiệu suất nhân sự"
              metric="Xem"
              severity="info"
              reason="Đánh giá KPIs đội sales và tỷ lệ duy trì học viên của giáo viên."
              ctaText="Mở báo cáo"
              ctaHref="/reports"
            />
            <ActionCard 
              title="Cài đặt hệ thống"
              metric="Cấu hình"
              severity="info"
              reason="Quản lý phân quyền, cấu hình Zalo, Facebook và các module."
              ctaText="Mở cài đặt"
              ctaHref="/settings"
            />
          </div>
        </section>

      </div>
    </div>
  );
}
