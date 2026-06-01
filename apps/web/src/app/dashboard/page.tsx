import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ActionCard } from '@/components/ui/ActionCard';
import { AiCommandBar } from '@/components/ui/AiCommandBar';
import { getDashboardSummaryForTenant, prisma } from '@eduos/db';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import { 
  getCriticalAlertsSummary, 
  getTodayAdmissionsSummary, 
  getSalesPerformanceToday, 
  getFinanceRiskSummary, 
  getAcademicRiskSummary, 
  getParentReportPendingSummary, 
  getZaloFacebookHealthSummary, 
  getAiDraftsPendingApproval 
} from '@eduos/ai/src/fetchers/ceo-chat';
import { Link, Users, GraduationCap, FileEdit, CreditCard, Bot, RefreshCw, MessageCircle } from 'lucide-react';

export default async function DashboardPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/dashboard")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const session = await getSession();
  const tenantId = await getCurrentTenantOrThrow();

  
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }});
  
  // Fetch from Phase 9 CEO Chat deterministic fetchers
  const [
    criticalAlerts,
    admissionsToday,
    salesToday,
    financeRisk,
    academicRisk,
    parentReports,
    health,
    aiDrafts
  ] = await Promise.all([
    getCriticalAlertsSummary(tenantId),
    getTodayAdmissionsSummary(tenantId),
    getSalesPerformanceToday(tenantId),
    getFinanceRiskSummary(tenantId),
    getAcademicRiskSummary(tenantId),
    getParentReportPendingSummary(tenantId),
    getZaloFacebookHealthSummary(tenantId),
    getAiDraftsPendingApproval(tenantId)
  ]);

  // A few manual queries for metrics not covered by fetchers
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  
  const classesToday = await prisma.classSession.count({
    where: { tenantId, startTime: { gte: startOfDay } }
  });

  const studentsAbsentMultiple = await prisma.attendance.groupBy({
    by: ['studentId'],
    where: { tenantId, status: { in: ['ABSENT', 'EXCUSED'] } },
    _count: { studentId: true },
    having: { studentId: { _count: { gte: 2 } } }
  }).then(res => res.length);

  const pendingCommandsCount = await prisma.classBootstrapCommand.count({
    where: { tenantId, status: "NEEDS_REVIEW" }
  });

  const renewalRemindersCount = await prisma.zaloOutboxMessage.count({
    where: { tenantId, status: "PENDING_APPROVAL", text: { contains: "tái phí" } }
  });

  const debtRemindersCount = await prisma.zaloOutboxMessage.count({
    where: { tenantId, status: "PENDING_APPROVAL", text: { contains: "học phí" } }
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

      {/* TÓM TẮT HÔM NAY & CEO AI COMMAND CENTER */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-xl">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-slate-300 mb-2">Tóm tắt hôm nay</h2>
          <ul className="space-y-2">
            {criticalAlerts.criticalCount > 0 && <li className="flex gap-2">🚨 <span className="font-semibold text-red-400">{criticalAlerts.criticalCount} cảnh báo nghiêm trọng</span> cần xử lý ngay.</li>}
            {aiDrafts.pendingDrafts > 0 && <li className="flex gap-2">🤖 <span className="font-semibold text-yellow-400">{aiDrafts.pendingDrafts} AI drafts</span> đang chờ CEO duyệt.</li>}
            <li className="flex gap-2">🚀 Tuyển sinh: <span className="font-semibold text-green-400">{admissionsToday.newLeads} leads mới</span> và <span className="font-semibold text-green-400">{admissionsToday.newTrials} lịch hẹn học thử</span>.</li>
            <li className="flex gap-2">💰 Tài chính: Ghi nhận <span className="font-semibold text-emerald-400">{(salesToday.revenueToday / 1000000).toFixed(1)}Tr</span> doanh thu, tuy nhiên còn <span className="font-semibold text-red-400">{financeRisk.unpaidInvoices} hóa đơn</span> chưa thu.</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">CEO Command Center</h3>
          <AiCommandBar />
        </div>
      </section>

      <div className="space-y-10">
        
        {/* ROW 1: Việc cần xử lý gấp */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">🚨 Việc cần xử lý gấp</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <ActionCard 
              title="Cảnh báo nghiêm trọng"
              metric={criticalAlerts.criticalCount}
              severity={criticalAlerts.criticalCount > 0 ? "critical" : "success"}
              reason="Tổng số vấn đề ngắt mạch hoạt động trung tâm."
              ctaText="Xem chi tiết"
              ctaHref="/ai-center"
            />
            <ActionCard 
              title="Cần phê duyệt"
              metric={aiDrafts.pendingDrafts}
              severity={aiDrafts.pendingDrafts > 0 ? "warning" : "info"}
              reason="Hành động nhạy cảm do AI đề xuất chờ bạn duyệt."
              ctaText="Duyệt AI Drafts"
              ctaHref="/ai-center"
            />
            <ActionCard 
              title="Zalo Offline"
              metric={health.offlineConnectors}
              severity={health.offlineConnectors > 0 ? "critical" : "success"}
              reason="Connector mất kết nối, hệ thống auto-reply ngưng trệ."
              ctaText="Sửa lỗi VPS"
              ctaHref="/settings/zalo-accounts"
            />
            <ActionCard 
              title="Chưa điểm danh"
              metric={academicRisk.needsReviewAttendance}
              severity={academicRisk.needsReviewAttendance > 0 ? "warning" : "success"}
              reason="Giáo viên quên điểm danh, cần nhắc nhở."
              ctaText="Quản lý điểm danh"
              ctaHref="/attendance"
            />
            <ActionCard 
              title="Hóa đơn quá hạn"
              metric={financeRisk.overdueInvoices}
              severity={financeRisk.overdueInvoices > 0 ? "critical" : "success"}
              reason="Học viên chưa đóng tiền dù đã quá hạn."
              ctaText="Xem công nợ"
              ctaHref="/payments"
            />
            <ActionCard 
              title="Báo cáo chờ duyệt"
              metric={parentReports.pendingReports}
              severity={parentReports.pendingReports > 0 ? "warning" : "success"}
              reason="Báo cáo phụ huynh do AI viết chưa được gửi."
              ctaText="Duyệt báo cáo"
              ctaHref="/parent-reports"
            />
          </div>
        </section>

        {/* ROW 2: Tuyển sinh hôm nay */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">🚀 Tuyển sinh (Hôm nay)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <ActionCard 
              title="Leads mới"
              metric={admissionsToday.newLeads}
              severity="info"
              reason="Data mới đổ về hệ thống hôm nay."
              ctaText="Chia lead"
              ctaHref="/leads"
            />
            <ActionCard 
              title="Đã gọi (Telesale)"
              metric="Chưa có dữ liệu"
              severity="info"
              reason="Tính năng Telesale đang phát triển."
              ctaText="Xem lịch sử gọi"
              ctaHref="/leads"
            />
            <ActionCard 
              title="Đặt lịch học thử"
              metric={admissionsToday.newTrials}
              severity={admissionsToday.newTrials > 0 ? "success" : "info"}
              reason="Số lịch hẹn học thử được chốt."
              ctaText="Xếp lớp"
              ctaHref="/trial-bookings"
            />
            <ActionCard 
              title="Đã tới học thử"
              metric={admissionsToday.attendedTrials}
              severity={admissionsToday.attendedTrials > 0 ? "success" : "info"}
              reason="Học viên đã tham gia buổi học thử hôm nay."
              ctaText="Đánh giá"
              ctaHref="/trial-bookings"
            />
            <ActionCard 
              title="Đã chốt (WON)"
              metric={salesToday.wonLeads}
              severity={salesToday.wonLeads > 0 ? "success" : "info"}
              reason="Khách hàng đã đồng ý mua khóa học."
              ctaText="Làm thủ tục"
              ctaHref="/leads"
            />
            <ActionCard 
              title="Leads tiềm năng"
              metric="Chưa có dữ liệu"
              severity="info"
              reason="Tính năng chấm điểm Lead nóng đang phát triển."
              ctaText="Chăm sóc ngay"
              ctaHref="/leads"
            />
          </div>
        </section>

        {/* ROW 3: Tài chính */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">💰 Tài chính</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <ActionCard 
              title="Doanh thu hôm nay"
              metric={`${(salesToday.revenueToday / 1000000).toFixed(1)}Tr`}
              severity="success"
              reason="Tiền thực nhận trong ngày hôm nay."
              ctaText="Báo cáo thu chi"
              ctaHref="/reports"
            />
            <ActionCard 
              title="Chưa thanh toán"
              metric={financeRisk.unpaidInvoices}
              severity={financeRisk.unpaidInvoices > 0 ? "warning" : "success"}
              reason="Số hóa đơn đã phát hành nhưng chưa thu tiền."
              ctaText="Truy thu"
              ctaHref="/payments"
            />
            <ActionCard 
              title="Tổng nợ quá hạn"
              metric={`${(financeRisk.totalOverdueAmount / 1000000).toFixed(1)}Tr`}
              severity={financeRisk.totalOverdueAmount > 0 ? "critical" : "success"}
              reason="Tiền cần thu hồi gấp."
              ctaText="Xem danh sách"
              ctaHref="/payments"
            />
            <ActionCard 
              title="Sắp hết hạn khóa"
              metric="Chưa đủ dữ liệu"
              severity="info"
              reason="Học viên cần tư vấn tái phí khóa mới."
              ctaText="Danh sách tái phí"
              ctaHref="/renewals"
            />
            <ActionCard 
              title="Tin nhắc nợ chờ duyệt"
              metric={debtRemindersCount + renewalRemindersCount}
              severity={(debtRemindersCount + renewalRemindersCount) > 0 ? "warning" : "success"}
              reason="Finance AI đã soạn tin nhắc nhở qua Zalo chờ bạn duyệt."
              ctaText="Duyệt gửi Zalo"
              ctaHref="/zalo-inbox"
            />
          </div>
        </section>

        {/* ROW 4: Lớp học & học viên */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">🎓 Lớp học & Học viên</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <ActionCard 
              title="Ca học hôm nay"
              metric={classesToday}
              severity="info"
              reason="Số buổi học diễn ra trong ngày hôm nay."
              ctaText="Quản lý lịch"
              ctaHref="/classes"
            />
            <ActionCard 
              title="Lỗi điểm danh"
              metric={academicRisk.needsReviewAttendance}
              severity={academicRisk.needsReviewAttendance > 0 ? "warning" : "success"}
              reason="Giáo viên chưa điểm danh hoặc điểm danh lỗi."
              ctaText="Xử lý ngay"
              ctaHref="/attendance"
            />
            <ActionCard 
              title="Vắng 2+ buổi"
              metric={studentsAbsentMultiple}
              severity={studentsAbsentMultiple > 0 ? "critical" : "success"}
              reason="Học viên có nguy cơ nghỉ hẳn."
              ctaText="Gọi phụ huynh"
              ctaHref="/attendance"
            />
            <ActionCard 
              title="Bài tập chưa chấm"
              metric={academicRisk.missingHomeworks}
              severity={academicRisk.missingHomeworks > 0 ? "warning" : "success"}
              reason="Giáo viên chưa chấm bài tập cho học sinh."
              ctaText="Nhắc giáo viên"
              ctaHref="/homework"
            />
            <ActionCard 
              title="Học viên yếu kém"
              metric="Chưa đủ dữ liệu"
              severity="info"
              reason="Cảnh báo học sinh điểm thấp cần kèm thêm."
              ctaText="Xem điểm thi"
              ctaHref="/reports"
            />
          </div>
        </section>

        {/* ROW 5: AI Agents */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">🤖 AI Agents</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <ActionCard 
              title="CEO Agent"
              metric="Online"
              severity="success"
              reason="Sẵn sàng tư vấn quản trị trung tâm."
              ctaText="Mở CEO Chat"
              ctaHref="/ai-center"
            />
            <ActionCard 
              title="Zalo Group Agent"
              metric={health.offlineConnectors > 0 ? "Offline" : "Online"}
              severity={health.offlineConnectors > 0 ? "critical" : "success"}
              reason="Hỗ trợ trả lời câu hỏi phụ huynh trên nhóm Zalo."
              ctaText="Cấu hình Zalo"
              ctaHref="/settings/zalo-accounts"
            />
            <ActionCard 
              title="Sales Agent"
              metric="Online"
              severity="success"
              reason="Chấm điểm lead và đề xuất kịch bản sale."
              ctaText="Xem CRM"
              ctaHref="/leads"
            />
            <ActionCard 
              title="Finance Agent"
              metric={(debtRemindersCount + renewalRemindersCount) > 0 ? "Chờ duyệt" : "Online"}
              severity={(debtRemindersCount + renewalRemindersCount) > 0 ? "warning" : "success"}
              reason="Tự động thu hồi công nợ và gia hạn tái phí."
              ctaText="Duyệt lệnh"
              ctaHref="/zalo-inbox"
            />
            <ActionCard 
              title="Parent Report Agent"
              metric={parentReports.pendingReports > 0 ? "Chờ duyệt" : "Online"}
              severity={parentReports.pendingReports > 0 ? "warning" : "success"}
              reason="Tổng hợp nhận xét học tập tự động gửi phụ huynh."
              ctaText="Duyệt báo cáo"
              ctaHref="/parent-reports"
            />
            <ActionCard 
              title="Fanpage Agent"
              metric={health.totalFacebookPages === 0 ? "Chưa cấu hình" : (health.offlineFacebookPages > 0 ? "Offline" : "Online")}
              severity={health.totalFacebookPages === 0 ? "info" : (health.offlineFacebookPages > 0 ? "critical" : "success")}
              reason="Tự động CSKH qua Facebook Messenger."
              ctaText={health.totalFacebookPages === 0 ? "Cài đặt ngay" : "Xem Fanpage Inbox"}
              ctaHref={health.totalFacebookPages === 0 ? "/settings" : "/fanpage-inbox"}
            />
          </div>
        </section>

      </div>
    </div>
  );
}
