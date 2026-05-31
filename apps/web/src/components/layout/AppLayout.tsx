"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
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
  Sparkles,
  Bell,
  Search,
  Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

const sidebarItems = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/contacts', label: 'CRM Liên hệ', icon: Users },
  { href: '/sales-calling', label: 'Gọi điện Sale', icon: MessageSquare },
  { href: '/leads', label: 'Tuyển sinh', icon: Users },
  { href: '/trial-bookings', label: 'Học thử', icon: BookOpen },
  { href: '/students', label: 'Học viên', icon: GraduationCap },
  { href: '/classes', label: 'Lớp học', icon: Users },
  { href: '/attendance', label: 'Điểm danh', icon: CheckSquare },
  { href: '/homework', label: 'Bài tập', icon: FileEdit },
  { href: '/payments', label: 'Học phí', icon: CreditCard },
  { href: '/renewals', label: 'Tái phí', icon: RefreshCw },
  { href: '/zalo-accounts', label: 'Tài khoản Zalo', icon: Wifi },
  { href: '/zalo-inbox', label: 'Hộp thư Zalo', icon: MessageCircle },
  { href: '/zalo-groups', label: 'Nhóm Zalo', icon: MessageSquare },
  { href: '/workflow-templates', label: 'Quy trình tự động', icon: PieChart },
  { href: '/message-reports', label: 'Báo cáo tin nhắn', icon: PieChart },
  { href: '/fanpage-inbox', label: 'Tin nhắn Fanpage', icon: MessageCircle },
  { href: '/reports', label: 'Báo cáo', icon: PieChart },
  { href: '/ai-center', label: 'Trung tâm AI', icon: Sparkles, highlight: true },
  { href: '/settings', label: 'Cài đặt', icon: Settings },
];

export function AppLayout({ children, session }: { children: React.ReactNode, session?: any }) {
  const pathname = usePathname();

  if (pathname === '/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar - Deep Navy */}
      <aside className="w-64 bg-secondary text-secondary-foreground flex flex-col transition-all shadow-xl z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white shadow-lg">
            E
          </div>
          <h1 className="text-xl font-bold tracking-tight">EduOS <span className="text-primary font-normal">SaaS</span></h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <ul className="space-y-1 px-3">
            {sidebarItems.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium",
                      isActive 
                        ? "bg-primary/10 text-primary shadow-sm" 
                        : "text-slate-300 hover:bg-white/5 hover:text-white",
                      item.highlight && !isActive && "text-primary hover:text-primary hover:bg-primary/10"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive ? "text-primary" : (item.highlight ? "text-primary" : "text-slate-400"))} />
                    {item.label}
                    {item.highlight && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white font-bold shadow-inner">
              {session?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{session?.email || 'Người dùng ẩn danh'}</p>
              <p className="text-xs text-slate-400 truncate font-semibold text-primary">{session?.role || 'CHƯA CÓ VAI TRÒ'}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors" title="Đăng xuất">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm học viên, lớp học..." 
                className="pl-9 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary rounded-full text-sm w-64 transition-all outline-none"
              />
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-success/15 text-success rounded-full text-xs font-bold border border-success/30 shadow-sm">
              <Wifi className="w-3.5 h-3.5 animate-pulse" />
              Zalo VPS: Online
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex px-3 border border-slate-200 rounded-md py-1 bg-slate-50 text-xs font-bold text-slate-600">
              Cơ sở: OMLIS Test
            </div>
            <Button size="sm" className="hidden sm:flex bg-gradient-to-r from-primary to-fuchsia-600 shadow-md hover:shadow-lg transition-all border-0">
              <Sparkles className="w-4 h-4 mr-2" />
              Trợ lý AI
            </Button>
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-white"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          <div className="w-full mx-auto h-full px-2 md:px-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
