"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  CreditCard,
  RefreshCw,
  MessageSquare,
  PieChart,
  Settings,
  Sparkles,
  GraduationCap,
  Bell,
  Search,
  Wifi,
  Monitor,
  Menu,
  X,
  ClipboardList,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';

type AppLayoutSession = {
  email?: string;
  role?: string;
};

type SidebarItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
};

export function AppLayout({ children, session }: { children: React.ReactNode, session?: AppLayoutSession | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const role = session?.role || "UNKNOWN";
  const isOwner = role === "OWNER" || role === "ADMIN";
  const isSale = isOwner || role === "SALE";
  const hasAcademicAccess = isOwner || role === "TEACHER";
  const roleLabel = {
    OWNER: 'Chủ trung tâm',
    ADMIN: 'Quản trị',
    SALE: 'Tư vấn tuyển sinh',
    TEACHER: 'Giáo viên',
    ACCOUNTANT: 'Kế toán',
    UNKNOWN: 'Chưa có vai trò',
  }[role] || role;
  const accountLabel = isOwner ? 'Tài khoản quản trị' : (session?.email || 'Người dùng ẩn danh');

  // Build role-aware sidebar
  const sidebarItems: SidebarItem[] = [];

  if (isOwner) {
    sidebarItems.push({ href: '/dashboard', label: 'Tổng quan CEO', icon: LayoutDashboard });
    sidebarItems.push({ href: '/crm-command-center', label: 'Khách hàng & tin nhắn', icon: Monitor });
  }

  sidebarItems.push({ href: '/workspaces', label: 'Danh mục công việc', icon: CheckSquare });
  if (hasAcademicAccess) {
    sidebarItems.push({ href: '/students', label: 'Học viên', icon: Users });
    sidebarItems.push({ href: '/classes', label: 'Lớp học', icon: GraduationCap });
  }

  if (isOwner || isSale) {
    sidebarItems.push({ href: '/tasks', label: 'Giao việc', icon: ClipboardList });
    sidebarItems.push({ href: '/team-inbox', label: 'Tin nhắn & Zalo', icon: MessageSquare });
  }

  sidebarItems.push({ href: '/ai-center', label: 'Trợ lý điều hành', icon: Sparkles, highlight: true });

  if (isOwner) {
    sidebarItems.push({ href: '/reports', label: 'Báo cáo', icon: PieChart });
    sidebarItems.push({ href: '/settings', label: 'Cài đặt', icon: Settings });
  }

  sidebarItems.push({ href: '/docs', label: 'Hướng dẫn SD', icon: BookOpen });
  sidebarItems.push({ href: '/pricing', label: 'Gói dịch vụ', icon: CreditCard });

  if (pathname === '/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const handleGlobalSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = globalSearch.trim();
    router.push(query ? `/contacts?q=${encodeURIComponent(query)}` : '/contacts');
  };

  return (
    <div className="flex h-dvh min-w-0 flex-col overflow-hidden bg-slate-50 text-slate-900 font-sans">
      <Toaster position="top-center" richColors />
      {/* Trial Banner Removed */}

      <div className="relative flex h-full min-w-0 flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
        "fixed lg:relative inset-y-0 left-0 w-[min(86vw,18rem)] lg:w-72 bg-white text-slate-900 border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out z-50 shadow-2xl lg:shadow-none lg:translate-x-0 overflow-hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="relative z-10 flex items-center justify-between px-5 py-5 lg:px-6 lg:py-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center font-black text-white shadow-sm">
              E
            </div>
            <h1 className="text-[1.35rem] font-black tracking-tight text-slate-950">Edu<span className="text-indigo-600">OS</span></h1>
          </div>
          <button
            className="lg:hidden text-slate-500 hover:text-slate-900 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="relative z-10 flex-1 overflow-y-auto px-3 py-3 scrollbar-hide lg:px-4">
          <ul className="space-y-1.5">
            {sidebarItems.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3 overflow-hidden rounded-lg px-3.5 py-3 text-[0.93rem] font-semibold transition-all duration-200 lg:gap-4 lg:px-4",
                      isActive
                        ? "text-indigo-700 bg-indigo-50 border border-indigo-100"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                      item.highlight && !isActive && "text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 shrink-0 transition-transform group-hover:scale-105",
                      isActive ? "text-indigo-600" : (item.highlight ? "text-indigo-600" : "text-slate-500")
                    )} />
                    {item.label}
                    {item.highlight && (
                      <span className="ml-auto flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="relative z-10 p-3 lg:p-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center gap-3 shadow-sm transition-colors hover:bg-white">
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-bold shadow-sm">
              {session?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate text-slate-900" title={session?.email || undefined}>{accountLabel}</p>
              <p className="text-xs truncate font-medium text-slate-500">{roleLabel}</p>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-colors" title="Đăng xuất">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/85 px-3 shadow-[0_4px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl sm:px-4 lg:h-[4.5rem] lg:px-6 xl:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3 lg:gap-4">
            <button
              className="rounded-lg border border-slate-100 p-2 text-slate-600 shadow-sm transition-all hover:bg-white lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <form onSubmit={handleGlobalSearch} className="relative hidden w-full max-w-md md:block xl:max-w-xl">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                placeholder="Tìm học viên, phụ huynh, SĐT..."
                className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-medium shadow-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </form>
          </div>

          <div className="flex shrink-0 items-center gap-2 lg:gap-3">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-100 shadow-sm">
              <Wifi className="w-3.5 h-3.5" />
              Zalo: an toàn
            </div>
            <div className="hidden lg:flex px-4 py-2 border border-slate-200 rounded-lg bg-white text-xs font-bold text-slate-600 shadow-sm">
              Cơ sở: Cơ Sở Chính
            </div>
            <Link href="/ai-center" className="hidden sm:flex items-center bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all border-0 rounded-lg font-bold px-5 h-9 text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Trợ lý điều hành
            </Link>
            <div className="relative text-slate-500 bg-white border border-slate-200 shadow-sm h-9 w-9 flex items-center justify-center rounded-lg" title="Chưa có thông báo mới">
              <Bell className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="relative flex-1 overflow-y-auto bg-slate-50/70 p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
          <div className="h-full w-full min-w-0 max-w-none">
            {children}
          </div>
        </main>
      </div>
      </div>
    </div>
  );
}
