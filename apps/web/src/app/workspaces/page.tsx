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
      "flex flex-col p-6 rounded-2xl border transition-all duration-300 h-full relative overflow-hidden group",
      disabled 
        ? "bg-slate-50 border-slate-200 opacity-70" 
        : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1"
    )}>
      {!disabled && <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>}
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300",
            disabled ? "bg-slate-200 text-slate-400" : "bg-gradient-to-br from-indigo-100 to-blue-50 text-indigo-600 group-hover:scale-110"
          )}>
            <Icon className="w-6 h-6" />
          </div>
          {badge && (
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-500 shadow-sm border border-slate-200">
              {badge}
            </span>
          )}
        </div>
        
        <h3 className={cn("text-lg font-bold mb-2 tracking-tight", disabled ? "text-slate-500" : "text-slate-900 group-hover:text-indigo-900 transition-colors")}>
          {title}
        </h3>
        <p className="text-sm text-slate-500 flex-1 mb-6 leading-relaxed">
          {description}
        </p>

        {disabled ? (
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 mt-auto cursor-not-allowed bg-slate-100 w-fit px-3 py-1.5 rounded-lg">
            <Lock className="w-4 h-4" />
            Sắp ra mắt
          </div>
        ) : (
          <Link href={href} className="mt-auto">
            <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg w-fit group-hover:shadow-sm">
              Mở ứng dụng <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        )}
      </div>
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
    <div className="space-y-16 pb-20">
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 -mx-4 md:-mx-8 -mt-8 px-8 pt-16 pb-12 rounded-b-[2.5rem] shadow-2xl relative overflow-hidden text-white mb-10">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay"></div>
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md border border-white/10 mb-6">
            <Sparkles className="w-4 h-4 text-indigo-300" /> Trung tâm điều hành
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">EduOS <span className="text-indigo-400">Workspace</span></h1>
          <p className="text-indigo-100/80 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Hệ thống quản trị Zalo CRM toàn diện với trợ lý AI. 
            Chọn một phân hệ nghiệp vụ để bắt đầu công việc của bạn hôm nay.
          </p>
        </div>
      </div>

      <div className="space-y-20 max-w-7xl mx-auto px-4 md:px-0">
        
        {/* GROUP 1: TUYỂN SINH & CRM */}
        <section className={cn(!isSale && "opacity-50 grayscale pointer-events-none")}>
          <div className="mb-8 border-b pb-4 border-slate-200">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg"><Users className="w-6 h-6 text-indigo-600" /></div>
              Tuyển sinh & CRM
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="mb-8 border-b pb-4 border-slate-200">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg"><GraduationCap className="w-6 h-6 text-emerald-600" /></div>
              Đào tạo
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="mb-8 border-b pb-4 border-slate-200">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg"><Banknote className="w-6 h-6 text-amber-600" /></div>
              Tài chính
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="mb-8 border-b pb-4 border-slate-200">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><MessageCircle className="w-6 h-6 text-blue-600" /></div>
              Zalo/Fanpage & Giao tiếp đa kênh
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <ModuleCard 
              title="CRM Command Center" 
              description="Trạm điều khiển đa kênh toàn diện cho Giám đốc." 
              href="/crm-command-center" 
              icon={LayoutDashboard} 
              disabled={!isOwner}
            />
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
          <div className="mb-8 border-b pb-4 border-slate-200">
            <h2 className="text-2xl font-black tracking-tight text-indigo-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg"><Sparkles className="w-6 h-6 text-indigo-600" /></div>
              Trợ lý AI & Tự động hóa
            </h2>
            <p className="text-indigo-700 mt-2 mb-2 font-medium">Các tính năng AI nâng cao hỗ trợ quản trị và tự động hóa toàn diện.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

