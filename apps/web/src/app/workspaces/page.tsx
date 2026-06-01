import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { 
  Briefcase, 
  Users, 
  GraduationCap, 
  BookOpen, 
  CreditCard, 
  MessageCircle, 
  Settings,
  Sparkles,
  ArrowRight,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Reusable card for Workspace
function WorkspaceCard({ 
  title, 
  description, 
  href, 
  icon: Icon, 
  disabled,
  badge
}: { 
  title: string, 
  description: string, 
  href: string, 
  icon: any, 
  disabled?: boolean,
  badge?: string
}) {
  return (
    <div className={cn(
      "flex flex-col p-5 rounded-xl border transition-all duration-200 h-full",
      disabled 
        ? "bg-slate-50 border-slate-200 opacity-75" 
        : "bg-white border-slate-200 hover:border-primary/50 hover:shadow-md hover:-translate-y-1"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shadow-sm",
          disabled ? "bg-slate-200 text-slate-400" : "bg-primary/10 text-primary"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        {badge && (
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-500">
            {badge}
          </span>
        )}
      </div>
      
      <h3 className={cn("text-base font-bold mb-1.5", disabled ? "text-slate-500" : "text-slate-900")}>
        {title}
      </h3>
      <p className="text-sm text-slate-500 flex-1 mb-5">
        {description}
      </p>

      {disabled ? (
        <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mt-auto cursor-not-allowed">
          <Lock className="w-4 h-4" />
          Không có quyền / Sắp ra mắt
        </div>
      ) : (
        <Link href={href} className="mt-auto">
          <button className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
            Mở Workspace <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      )}
    </div>
  );
}

// AI Prompt pill
function AiPrompt({ text }: { text: string }) {
  return (
    <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full transition-colors border border-indigo-100">
      <Sparkles className="w-3 h-3" />
      "{text}"
    </button>
  );
}

export default async function WorkspacesPage() {
  const session = await getSession();
  const role = session?.role || "UNKNOWN";

  // Role checking helpers
  const isOwner = role === "OWNER" || role === "ADMIN";
  const isSale = isOwner || role === "SALE";
  const isTeacher = isOwner || role === "TEACHER";
  const isAccountant = isOwner || role === "ACCOUNTANT";

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Danh mục công việc</h1>
        <p className="text-slate-500 mt-2">
          Chọn không gian làm việc theo đúng vai trò của bạn. Phần mềm sẽ tự động lọc các tính năng cần thiết.
        </p>
      </div>

      <div className="space-y-12">
        {/* GROUP 1: BAN GIÁM ĐỐC */}
        <section className={cn(!isOwner && "opacity-50 grayscale pointer-events-none")}>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-slate-400" />
              1. Ban Giám Đốc (CEO / Admin)
            </h2>
            <div className="flex gap-2 mt-2 flex-wrap">
              <AiPrompt text="Doanh thu hôm nay bao nhiêu?" />
              <AiPrompt text="Có cảnh báo nào cần xử lý gấp không?" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <WorkspaceCard 
              title="Tổng quan CEO" 
              description="Bảng điều khiển chiến lược, các chỉ số nóng và phê duyệt AI." 
              href="/dashboard" 
              icon={Briefcase} 
              disabled={!isOwner}
            />
            <WorkspaceCard 
              title="Trung tâm AI" 
              description="Trợ lý ảo phân tích trung tâm, soạn thảo kịch bản và ra quyết định." 
              href="/ai-center" 
              icon={Sparkles} 
              disabled={!isOwner}
            />
            <WorkspaceCard 
              title="Báo cáo tổng hợp" 
              description="Xem tất cả báo cáo thu chi, tuyển sinh, và học thuật." 
              href="/reports" 
              icon={Briefcase} 
              disabled={!isOwner}
            />
          </div>
        </section>

        {/* GROUP 2: TUYỂN SINH */}
        <section className={cn(!isSale && "opacity-50 grayscale pointer-events-none")}>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" />
              2. Tư vấn Tuyển Sinh (Sales)
            </h2>
            <div className="flex gap-2 mt-2 flex-wrap">
              <AiPrompt text="Hôm nay cần gọi lead nào?" />
              <AiPrompt text="Có bao nhiêu lịch học thử tuần này?" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <WorkspaceCard 
              title="Leads & Khách hàng" 
              description="Chăm sóc danh sách tiềm năng, cập nhật trạng thái phễu." 
              href="/leads" 
              icon={Users} 
              disabled={!isSale}
            />
            <WorkspaceCard 
              title="Học thử" 
              description="Sắp xếp lịch, đánh giá học thử và làm thủ tục nhập học." 
              href="/trial-bookings" 
              icon={BookOpen} 
              disabled={!isSale}
            />
            <WorkspaceCard 
              title="Tổng quan Tuyển sinh" 
              description="Bảng điều khiển các chỉ số lead mới, lịch học thử và KPI sales." 
              href="/workspaces/sales" 
              icon={Briefcase} 
              disabled={!isSale}
            />
          </div>
        </section>

        {/* GROUP 3: GIÁO VIÊN & HỌC VỤ */}
        <section className={cn(!isTeacher && "opacity-50 grayscale pointer-events-none")}>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-slate-400" />
              3. Giáo viên & Học vụ
            </h2>
            <div className="flex gap-2 mt-2 flex-wrap">
              <AiPrompt text="Lớp nào chưa điểm danh?" />
              <AiPrompt text="Nhắc học sinh nộp bài tập" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <WorkspaceCard
              title="Tổng quan Giáo vụ"
              description="Bảng điều khiển quản lý lớp học, điểm danh, chấm bài tập."
              icon={Briefcase}
              href="/workspaces/teacher"
              disabled={!isTeacher}
            />
            <WorkspaceCard 
              title="Lớp học của tôi" 
              description="Xem lịch dạy, giáo trình và sĩ số lớp." 
              href="/classes" 
              icon={Users} 
              disabled={!isTeacher}
            />
            <WorkspaceCard 
              title="Điểm danh" 
              description="Điểm danh học viên nhanh chóng theo từng ca học." 
              href="/attendance" 
              icon={GraduationCap} 
              disabled={!isTeacher}
            />
            <WorkspaceCard 
              title="Bài tập & Điểm" 
              description="Chấm bài tập, cập nhật bảng điểm định kỳ." 
              href="/homework" 
              icon={BookOpen} 
              disabled={!isTeacher}
            />
            <WorkspaceCard 
              title="Học viên" 
              description="Tra cứu thông tin, lịch sử học tập của học viên." 
              href="/students" 
              icon={Users} 
              disabled={!isTeacher}
            />
          </div>
        </section>

        {/* GROUP 4: TÀI CHÍNH */}
        <section className={cn(!isAccountant && "opacity-50 grayscale pointer-events-none")}>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-400" />
              4. Kế toán & Tài chính
            </h2>
            <div className="flex gap-2 mt-2 flex-wrap">
              <AiPrompt text="Ai chưa đóng tiền?" />
              <AiPrompt text="Ai sắp hết hạn khóa học?" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <WorkspaceCard 
              title="Thu học phí" 
              description="Lập phiếu thu, xuất hóa đơn, quản lý công nợ." 
              href="/payments" 
              icon={CreditCard} 
              disabled={!isAccountant}
            />
            <WorkspaceCard 
              title="Gia hạn (Tái phí)" 
              description="Danh sách học viên sắp hết buổi cần đóng thêm tiền." 
              href="/renewals" 
              icon={CreditCard} 
              disabled={!isAccountant}
            />
            <WorkspaceCard 
              title="Chi tiêu" 
              description="Lập phiếu chi, trả lương và mua sắm vật tư." 
              href="#" 
              icon={CreditCard} 
              disabled={true}
              badge="Sắp ra mắt"
            />
          </div>
        </section>

        {/* GROUP 5: TIN NHẮN */}
        <section className={cn(!isOwner && !isSale && "opacity-50 grayscale pointer-events-none")}>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-slate-400" />
              5. Tin nhắn & CSKH
            </h2>
            <div className="flex gap-2 mt-2 flex-wrap">
              <AiPrompt text="Tin nhắn nào cần phản hồi ngay?" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <WorkspaceCard 
              title="Fanpage Inbox" 
              description="Nhắn tin với khách hàng từ Facebook Messenger." 
              href="/fanpage-inbox" 
              icon={MessageCircle} 
              disabled={!isOwner && !isSale}
            />
            <WorkspaceCard 
              title="Hộp thư Zalo" 
              description="Chăm sóc phụ huynh qua Zalo OA & Zalo cá nhân." 
              href="/zalo-inbox" 
              icon={MessageCircle} 
              disabled={!isOwner && !isSale}
            />
            <WorkspaceCard 
              title="Nhóm Zalo" 
              description="Quản lý đồng loạt các nhóm lớp học Zalo." 
              href="/zalo-groups" 
              icon={Users} 
              disabled={!isOwner && !isSale}
            />
          </div>
        </section>

        {/* GROUP 6: HỆ THỐNG */}
        <section className={cn(!isOwner && "opacity-50 grayscale pointer-events-none")}>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-400" />
              6. Cài đặt hệ thống
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <WorkspaceCard 
              title="Tài khoản Zalo" 
              description="Kết nối VPS và đồng bộ trạng thái Zalo." 
              href="/zalo-accounts" 
              icon={Settings} 
              disabled={!isOwner}
            />
            <WorkspaceCard 
              title="Cài đặt chung" 
              description="Phân quyền, cấu hình chi nhánh và hóa đơn." 
              href="/settings" 
              icon={Settings} 
              disabled={!isOwner}
            />
          </div>
        </section>

      </div>
    </div>
  );
}
