import React from 'react';
import { getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { AI_ADDON_CATALOG } from '@eduos/shared/src/lib/aiAddonCatalog';
import { Bot } from 'lucide-react';
import { AiAddonsWrapperClient } from './AiAddonsWrapperClient';

export const metadata = {
  title: 'Kho AI Tự Động Hóa - EduOS',
};

export default async function AIAddonsPage() {
  const authSession = await getSession();

  // Strict RBAC check - Only Owner/Admin can purchase or configure add-ons
  if (!canAccessRoute(authSession?.role, "/ai-addons") || (authSession?.role !== 'OWNER' && authSession?.role !== 'ADMIN')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const groupedAddons = AI_ADDON_CATALOG.reduce((acc, addon) => {
    if (!acc[addon.category]) acc[addon.category] = [];
    acc[addon.category].push(addon);
    return acc;
  }, {} as Record<string, typeof AI_ADDON_CATALOG>);

  return (
    <div className="space-y-12 pb-20">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md border border-white/20">
              Module Mở Rộng
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-3 flex items-center gap-3">
            <Bot className="w-8 h-8 opacity-90" />
            Kho Tính Năng AI Mở Rộng
          </h1>
          <p className="text-indigo-100 max-w-2xl text-lg leading-relaxed">
            Tham khảo các trợ lý AI chuyên biệt, chi phí và cơ chế an toàn trước khi kích hoạt pilot. Việc bật module thật đi qua Billing, đối soát thủ công và cấu hình kết nối an toàn.
          </p>
        </div>
      </div>

      {/* WRAPPER FOR SIMULATOR, COST DASHBOARD, AND CATALOG */}
      <AiAddonsWrapperClient catalog={AI_ADDON_CATALOG} groupedAddons={groupedAddons} />
    </div>
  );
}
