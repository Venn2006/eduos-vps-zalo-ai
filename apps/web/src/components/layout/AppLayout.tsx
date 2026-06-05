"use client";
import React, { useState } from 'react';
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
  Wifi,
  Monitor,
  ShieldCheck,
  Menu,
  X,
  ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Toaster } from 'sonner';

export function AppLayout({ children, session }: { children: React.ReactNode, session?: any }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const role = session?.role || "UNKNOWN";
  const isOwner = role === "OWNER" || role === "ADMIN";
  const isSale = isOwner || role === "SALE";
  const isTeacher = isOwner || role === "TEACHER";
  const isAccountant = isOwner || role === "ACCOUNTANT";

  // Build role-aware sidebar
  const sidebarItems = [];
  
  if (isOwner) {
    sidebarItems.push({ href: '/dashboard', label: 'Tổng quan CEO', icon: LayoutDashboard });
    sidebarItems.push({ href: '/crm-command-center', label: 'CRM & Zalo/Fanpage', icon: Monitor });
  }
  
  sidebarItems.push({ href: '/tasks', label: 'Giao việc', icon: ClipboardList });
  sidebarItems.push({ href: '/workspaces', label: 'Danh mục công việc', icon: CheckSquare });
  
  if (isOwner || isSale) {
    sidebarItems.push({ href: '/team-inbox', label: 'Tin nhắn & Zalo', icon: MessageSquare });
    sidebarItems.push({ href: '/approval-queue', label: 'Việc cần duyệt', icon: CheckSquare });
  }

  sidebarItems.push({ href: '/ai-center', label: 'Trung tâm AI', icon: Sparkles, highlight: true });
  
  if (isOwner) {
    sidebarItems.push({ href: '/reports', label: 'Báo cáo', icon: PieChart });
    sidebarItems.push({ href: '/settings/safety-center', label: 'Trung tâm an toàn', icon: ShieldCheck });
    sidebarItems.push({ href: '/settings', label: 'Cài đặt', icon: Settings });
  }

  if (pathname === '/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <Toaster position="top-center" richColors />
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 w-72 bg-[#0B1121] text-white flex flex-col transition-transform duration-300 ease-in-out z-50 shadow-2xl lg:shadow-none lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-fuchsia-600 flex items-center justify-center font-bold text-white shadow-lg">
              E
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Edu<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-fuchsia-400">OS</span></h1>
          </div>
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide px-4">
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
                      "group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-sm font-medium relative overflow-hidden",
                      isActive 
                        ? "text-white bg-white/10 shadow-[inset_2px_0_0_0_rgba(168,85,247,1)]" 
                        : "text-slate-400 hover:bg-white/5 hover:text-white",
                      item.highlight && !isActive && "text-fuchsia-400 hover:text-fuchsia-300 hover:bg-fuchsia-400/10"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-fuchsia-500 rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                    )}
                    <Icon className={cn(
                      "w-5 h-5 transition-transform group-hover:scale-110", 
                      isActive ? "text-primary" : (item.highlight ? "text-fuchsia-400" : "text-slate-500")
                    )} />
                    {item.label}
                    {item.highlight && (
                      <span className="ml-auto flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 backdrop-blur-md">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-primary flex items-center justify-center text-white font-bold shadow-inner ring-2 ring-white/10">
              {session?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate text-white">{session?.email || 'Người dùng ẩn danh'}</p>
              <p className="text-xs truncate font-medium text-primary">{session?.role || 'CHƯA CÓ VAI TRÒ'}</p>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title="Đăng xuất">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm học viên, lớp học..." 
                className="pl-10 pr-4 py-2.5 bg-slate-100/50 border border-transparent focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/10 rounded-xl text-sm w-72 transition-all outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-5">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-200 shadow-sm">
              <Wifi className="w-3.5 h-3.5 animate-pulse" />
              Zalo VPS: Online
            </div>
            <div className="hidden lg:flex px-3 border border-slate-200 rounded-lg py-1.5 bg-white text-xs font-bold text-slate-600 shadow-sm">
              Cơ sở: OMLIS Test
            </div>
            <Button size="sm" className="hidden sm:flex bg-gradient-to-r from-primary to-fuchsia-600 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all border-0 rounded-lg font-semibold">
              <Sparkles className="w-4 h-4 mr-2" />
              Trợ lý AI
            </Button>
            <button className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative bg-slate-50/50">
          <div className="w-full max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
