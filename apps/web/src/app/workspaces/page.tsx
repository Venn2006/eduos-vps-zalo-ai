import React from 'react';
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
  PhoneCall,
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  FileBarChart,
  Bot,
  Inbox,
  PiggyBank,
  Wallet,
  TrendingUp,
  Percent,
  Banknote,
  UsersRound
} from 'lucide-react';

import { ModuleCard } from './ModuleCard';

export default async function WorkspacesPage() {
  const session = await getSession();
  const role = session?.role || "UNKNOWN";

  // Role checking helpers
  const isOwner = role === "OWNER" || role === "ADMIN";
  const isSale = isOwner || role === "SALE";
  const isTeacher = isOwner || role === "TEACHER";
  const isAccountant = isOwner || role === "ACCOUNTANT";
  const roleLabel = {
    OWNER: 'Chủ trung tâm',
    ADMIN: 'Quản lý vận hành',
    SALE: 'Tư vấn tuyển sinh',
    TEACHER: 'Giáo viên',
    ACCOUNTANT: 'Kế toán',
    UNKNOWN: 'Nhân sự'
  }[role] || 'Nhân sự';

  return (
    <div className="space-y-10 pb-16">
      <div className="border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700">
          <Sparkles className="w-4 h-4" /> Trung tâm điều hành
        </div>
        <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">Không gian làm việc</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              Chọn đúng luồng vận hành cần xử lý hôm nay: tuyển sinh, chăm sóc lớp học, tài chính hoặc AI hỗ trợ.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm">
            Vai trò hiện tại: {roleLabel}
          </div>
        </div>
      </div>

      <div className="space-y-12 max-w-7xl mx-auto px-0">

        {/* GÓC DÀNH CHO CEO & QUẢN LÝ */}
        {isOwner && (
          <section>
            <div className="mb-8 border-b pb-4 border-slate-200">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg"><Briefcase className="w-6 h-6 text-indigo-600" /></div>
                Góc dành cho CEO & Quản lý
              </h2>
              <p className="text-slate-600 mt-2 font-medium">Trung tâm điều hành và báo cáo tổng quan toàn diện.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <ModuleCard
                title="Điều hành khách hàng"
                description="Một nơi để xem khách mới, tin nhắn và việc cần xử lý."
                href="/crm-command-center"
                icon={<LayoutDashboard className="w-7 h-7" />}
                gradient="from-rose-100 to-rose-200"
              />
              <ModuleCard
                title="Tổng quan Tuyển sinh"
                description="Báo cáo hiệu suất đội sales."
                href="/workspaces/sales"
                icon={<TrendingUp className="w-7 h-7" />}
                gradient="from-cyan-100 to-cyan-200"
              />
              <ModuleCard
                title="Tổng quan Tài chính"
                description="Bảng điều khiển học phí, công nợ."
                href="/workspaces/finance"
                icon={<Wallet className="w-7 h-7" />}
                gradient="from-amber-100 to-amber-200"
              />
              <ModuleCard
                title="Kho AI tự động hóa"
                description="Bật/tắt các module AI tùy chỉnh cho trung tâm."
                href="/ai-addons"
                icon={<Bot className="w-7 h-7" />}
                gradient="from-purple-100 to-purple-200"
              />
              <ModuleCard
                title="Trung tâm AI (Chatbot)"
                description="Hỏi đáp dữ liệu điều hành trung tâm."
                href="/ai-center"
                icon={<Sparkles className="w-7 h-7" />}
                gradient="from-fuchsia-100 to-fuchsia-200"
              />
              <ModuleCard
                title="Tài khoản nhân viên"
                description="Quản lý quyền và thiết bị kết nối."
                href="/settings/zalo-accounts"
                icon={<Settings className="w-7 h-7" />}
                gradient="from-slate-200 to-slate-300"
              />
            </div>
          </section>
        )}

        {/* GÓC DÀNH CHO TƯ VẤN VIÊN & LỄ TÂN */}
        {isSale && (
          <section>
            <div className="mb-8 border-b pb-4 border-slate-200">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg"><Users className="w-6 h-6 text-blue-600" /></div>
                Góc dành cho Tư vấn & Lễ tân
              </h2>
              <p className="text-slate-600 mt-2 font-medium">Quản lý lead, học thử và giao tiếp khách hàng.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <ModuleCard
                title="Hộp thư khách hàng"
                description="Quản lý hội thoại đa kênh."
                href="/team-inbox"
                icon={<MessageCircle className="w-7 h-7" />}
                gradient="from-blue-100 to-indigo-200"
              />
              <ModuleCard
                title="Khách tiềm năng"
                description="Quản lý phễu khách hàng tiềm năng."
                href="/leads"
                icon={<Users className="w-7 h-7" />}
                gradient="from-sky-100 to-sky-200"
              />
              <ModuleCard
                title="Học thử"
                description="Quản lý lịch học thử và chốt deal."
                href="/trial-bookings"
                icon={<BookOpen className="w-7 h-7" />}
                gradient="from-indigo-100 to-indigo-200"
              />
              <ModuleCard
                title="Gọi điện tư vấn"
                description="Hỗ trợ telesale và lên kịch bản."
                href="/workspaces/sales/calling"
                icon={<PhoneCall className="w-7 h-7" />}
                gradient="from-blue-100 to-blue-200"
              />
              <ModuleCard
                title="Fanpage Inbox"
                description="Nhắn tin với khách hàng từ Facebook."
                href="/fanpage-inbox"
                icon={<MessageCircle className="w-7 h-7" />}
                gradient="from-pink-100 to-pink-200"
              />
              <ModuleCard
                title="Hàng đợi duyệt (AI)"
                description="Duyệt tin nhắn nháp do AI soạn."
                href="/approval-queue"
                icon={<CheckSquare className="w-7 h-7" />}
                gradient="from-rose-100 to-orange-200"
              />
            </div>
          </section>
        )}

        {/* GÓC DÀNH CHO GIÁO VIÊN & HỌC VỤ */}
        {isTeacher && (
          <section>
            <div className="mb-8 border-b pb-4 border-slate-200">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg"><GraduationCap className="w-6 h-6 text-emerald-600" /></div>
                Góc dành cho Giáo viên & Học vụ
              </h2>
              <p className="text-slate-600 mt-2 font-medium">Quản lý lớp học, điểm danh và giao tiếp nhóm lớp.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <ModuleCard
                title="Lớp học"
                description="Quản lý danh sách lớp, giáo trình."
                href="/classes"
                icon={<CalendarDays className="w-7 h-7" />}
                gradient="from-emerald-100 to-emerald-200"
              />
              <ModuleCard
                title="Điểm danh"
                description="Ghi nhận chuyên cần hàng ngày."
                href="/attendance"
                icon={<CheckSquare className="w-7 h-7" />}
                gradient="from-teal-100 to-teal-200"
              />
              <ModuleCard
                title="Bài tập & AI Chấm nháp"
                description="Giao bài tập và duyệt điểm do AI đề xuất."
                href="/homework"
                icon={<BookOpen className="w-7 h-7" />}
                gradient="from-green-100 to-green-200"
              />
              <ModuleCard
                title="Nhóm lớp Zalo"
                description="Quản lý các nhóm Zalo lớp học."
                href="/zalo-groups"
                icon={<UsersRound className="w-7 h-7" />}
                gradient="from-violet-100 to-violet-200"
              />
            </div>
          </section>
        )}

        {/* GÓC DÀNH CHO KẾ TOÁN */}
        {isAccountant && (
          <section>
            <div className="mb-8 border-b pb-4 border-slate-200">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg"><Banknote className="w-6 h-6 text-amber-600" /></div>
                Góc dành cho Kế toán
              </h2>
              <p className="text-slate-600 mt-2 font-medium">Quản lý học phí, hóa đơn và công nợ.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <ModuleCard
                title="Thu Học phí"
                description="Thu tiền và quản lý hóa đơn."
                href="/payments"
                icon={<CreditCard className="w-7 h-7" />}
                gradient="from-orange-100 to-orange-200"
              />
              <ModuleCard
                title="Tái phí"
                description="Quản lý học viên sắp hết hạn."
                href="/renewals"
                icon={<TrendingUp className="w-7 h-7" />}
                gradient="from-yellow-100 to-yellow-200"
              />
            </div>
          </section>
        )}

        {/* BÁO CÁO & KIỂM SOÁT NÂNG CAO */}
        {isOwner && (
          <section>
            <div className="mb-8 border-b pb-4 border-slate-200">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-slate-200 rounded-lg"><FileBarChart className="w-6 h-6 text-slate-600" /></div>
                Báo cáo & kiểm soát nâng cao
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <ModuleCard
                title="Nhật ký tin nhắn"
                description="Báo cáo và log chat an toàn."
                href="/message-reports"
                icon={<Inbox className="w-7 h-7" />}
                badge="Đang dùng"
              />
              <ModuleCard
                title="Chi phí"
                description="Quản lý phiếu chi, lương."
                href="/workspaces/finance"
                icon={<Wallet className="w-7 h-7" />}
                badge="Dữ liệu thật"
              />
              <ModuleCard
                title="Lợi nhuận"
                description="Báo cáo hiệu quả kinh doanh."
                href="/workspaces/finance"
                icon={<PiggyBank className="w-7 h-7" />}
                badge="Dữ liệu thật"
              />
              <ModuleCard
                title="Hoa hồng sale"
                description="Tính hoa hồng cho nhân viên."
                href="/workspaces/finance"
                icon={<Percent className="w-7 h-7" />}
                badge="Tạm tính"
              />
              <ModuleCard
                title="Báo cáo phụ huynh"
                description="Lịch sử gửi báo cáo định kỳ."
                href="/parent-reports"
                icon={<FileBarChart className="w-7 h-7" />}
                badge="Đang dùng"
              />
              <ModuleCard
                title="Lịch sử trợ lý"
                description="Xem lại các thao tác quan trọng đã xử lý."
                href="/settings/audit-log?category=ai"
                icon={<CheckSquare className="w-7 h-7" />}
                badge="Lịch sử"
              />
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
