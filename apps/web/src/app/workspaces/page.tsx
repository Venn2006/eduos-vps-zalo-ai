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
  Lock,
  PhoneCall,
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  FileBarChart,
  Bot,
  Inbox,
  Clock,
  PiggyBank,
  Wallet,
  TrendingUp,
  Percent,
  Banknote
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Reusable card for Workspace Module
function ModuleCard({ 
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
      <p className="text-sm text-slate-500 flex-1 mb-5 leading-snug">
        {description}
      </p>

      {disabled ? (
        <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mt-auto cursor-not-allowed">
          <Lock className="w-4 h-4" />
          Sắp có
        </div>
      ) : (
        <Link href={href} className="mt-auto">
          <button className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
            Mở <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      )}
    </div>
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
    <div className="space-y-12 pb-16">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">EduOS Launcher</h1>
        <p className="text-slate-500 mt-2 text-lg max-w-3xl">
          Hệ thống quản trị trung tâm toàn diện với trợ lý AI tích hợp. 
          Lựa chọn phân hệ nghiệp vụ để bắt đầu làm việc.
        </p>
      </div>

      <div className="space-y-16">
        
        {/* GROUP 1: TUYỂN SINH & CRM */}
        <section className={cn(!isSale && "opacity-50 grayscale pointer-events-none")}>
          <div className="mb-6 border-b pb-2 border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-500" />
              Tuyển sinh & CRM
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <ModuleCard 
              title="Lead & Data" 
              description="Quản lý phễu khách hàng tiềm năng." 
              href="/leads" 
              icon={Users} 
              disabled={!isSale}
            />
            <ModuleCard 
              title="Gọi điện tư vấn" 
              description="Hỗ trợ telesale và lên kịch bản." 
              href="/sales-calling" 
              icon={PhoneCall} 
              disabled={!isSale}
            />
            <ModuleCard 
              title="Học thử" 
              description="Quản lý lịch học thử và chốt deal." 
              href="/trial-bookings" 
              icon={BookOpen} 
              disabled={!isSale}
            />
            <ModuleCard 
              title="Tổng quan Tuyển sinh" 
              description="Báo cáo hiệu suất đội sales." 
              href="/workspaces/sales" 
              icon={LayoutDashboard} 
              disabled={!isSale}
            />
          </div>
        </section>

        {/* GROUP 2: ĐÀO TẠO */}
        <section className={cn(!isTeacher && "opacity-50 grayscale pointer-events-none")}>
          <div className="mb-6 border-b pb-2 border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-emerald-500" />
              Đào tạo
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <ModuleCard 
              title="Lớp học" 
              description="Quản lý danh sách lớp, giáo trình." 
              href="/classes" 
              icon={CalendarDays} 
              disabled={!isTeacher}
            />
            <ModuleCard 
              title="Điểm danh" 
              description="Ghi nhận chuyên cần hàng ngày." 
              href="/attendance" 
              icon={CheckSquare} 
              disabled={!isTeacher}
            />
            <ModuleCard 
              title="Bài tập & AI Chấm nháp" 
              description="Giao bài tập và duyệt điểm do AI đề xuất." 
              href="/homework" 
              icon={BookOpen} 
              disabled={!isTeacher}
            />
            <ModuleCard 
              title="Báo cáo phụ huynh" 
              description="Lịch sử gửi báo cáo định kỳ." 
              href="/parent-reports" 
              icon={FileBarChart} 
              disabled={true}
              badge="Sắp có"
            />
          </div>
        </section>

        {/* GROUP 3: TÀI CHÍNH */}
        <section className={cn(!isAccountant && "opacity-50 grayscale pointer-events-none")}>
          <div className="mb-6 border-b pb-2 border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Banknote className="w-6 h-6 text-amber-500" />
              Tài chính
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <ModuleCard 
              title="Tổng quan Tài chính" 
              description="Bảng điều khiển học phí, công nợ." 
              href="/workspaces/finance" 
              icon={LayoutDashboard} 
              disabled={!isAccountant}
            />
            <ModuleCard 
              title="Thu Học phí" 
              description="Thu tiền và quản lý hóa đơn." 
              href="/payments" 
              icon={CreditCard} 
              disabled={!isAccountant}
            />
            <ModuleCard 
              title="Tái phí" 
              description="Quản lý học viên sắp hết hạn." 
              href="/renewals" 
              icon={TrendingUp} 
              disabled={!isAccountant}
            />
            <ModuleCard 
              title="Chi phí" 
              description="Quản lý phiếu chi, lương." 
              href="#" 
              icon={Wallet} 
              disabled={true}
              badge="Sắp có"
            />
            <ModuleCard 
              title="Lợi nhuận" 
              description="Báo cáo hiệu quả kinh doanh." 
              href="#" 
              icon={PiggyBank} 
              disabled={true}
              badge="Sắp có"
            />
            <ModuleCard 
              title="Hoa hồng sale" 
              description="Tính hoa hồng cho nhân viên." 
              href="#" 
              icon={Percent} 
              disabled={true}
              badge="Sắp có"
            />
          </div>
        </section>

        {/* GROUP 4: ZALO/FANPAGE & NHÂN VIÊN */}
        <section className={cn(!isOwner && !isSale && "opacity-50 grayscale pointer-events-none")}>
          <div className="mb-6 border-b pb-2 border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-blue-500" />
              Zalo/Fanpage & Nhân viên
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <ModuleCard 
              title="Fanpage Inbox" 
              description="Nhắn tin với khách hàng từ Facebook." 
              href="/fanpage-inbox" 
              icon={MessageCircle} 
              disabled={!isOwner && !isSale}
            />
            <ModuleCard 
              title="Zalo Inbox (OA & Cá nhân)" 
              description="Quản lý hộp thoại đa kênh Zalo." 
              href="/zalo-inbox" 
              icon={MessageCircle} 
              disabled={!isOwner && !isSale}
            />
            <ModuleCard 
              title="Nhóm lớp Zalo" 
              description="Quản lý các nhóm Zalo lớp học." 
              href="/zalo-groups" 
              icon={Users} 
              disabled={!isOwner && !isSale}
            />
            <ModuleCard 
              title="Tài khoản nhân viên" 
              description="Quản lý quyền và thiết bị kết nối." 
              href="/settings/zalo-accounts" 
              icon={Settings} 
              disabled={!isOwner}
            />
            <ModuleCard 
              title="Nhật ký tin nhắn" 
              description="Báo cáo và log chat an toàn." 
              href="/message-reports" 
              icon={Inbox} 
              disabled={true}
              badge="Sắp có"
            />
          </div>
        </section>

        {/* GROUP 5: TRỢ LÝ AI */}
        <section className={cn(!isOwner && "opacity-50 grayscale pointer-events-none")}>
          <div className="mb-6 border-b pb-2 border-slate-200 bg-indigo-50/50 -mx-4 px-4 pt-4 rounded-t-xl">
            <h2 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-500" />
              Trợ lý AI & Tự động hóa
            </h2>
            <p className="text-indigo-700 mt-1 mb-4">Các tính năng AI nâng cao hỗ trợ quản trị và tự động hóa.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <ModuleCard 
              title="Kho AI tự động hóa" 
              description="Bật/tắt các module AI tùy chỉnh cho trung tâm." 
              href="/ai-addons" 
              icon={Bot} 
              disabled={!isOwner}
            />
            <ModuleCard 
              title="Trung tâm AI (Chatbot)" 
              description="Hỏi đáp dữ liệu điều hành trung tâm." 
              href="/ai-center" 
              icon={Sparkles} 
              disabled={!isOwner}
            />
            <ModuleCard 
              title="Hàng đợi duyệt" 
              description="Duyệt các tin nhắn nháp do AI soạn." 
              href="/approval-queue" 
              icon={Clock} 
              disabled={!isOwner}
            />
            <ModuleCard 
              title="Mock Outbox (Sandbox)" 
              description="Hộp thư giả lập để test thử hệ thống." 
              href="/settings/mock-outbox" 
              icon={Inbox} 
              disabled={!isOwner}
            />
            <ModuleCard 
              title="Nhật ký hoạt động AI" 
              description="Kiểm soát toàn bộ lịch sử AI đã xử lý." 
              href="/settings/audit-log" 
              icon={CheckSquare} 
              disabled={true}
              badge="Sắp có"
            />
          </div>
        </section>

      </div>
    </div>
  );
}

