import { getSession, getCurrentTenantOrThrow } from '@/lib/auth';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { prisma } from '@eduos/db';
import { Activity, Server, MessageSquare, Bot, CreditCard, Cpu } from 'lucide-react';

export default async function ConnectorCenterPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/settings")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  // Strictly OWNER/ADMIN
  if (authSession?.role !== 'OWNER' && authSession?.role !== 'ADMIN') {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();

  // Fetch Zalo Accounts
  const zaloAccounts = await prisma.zaloPersonalAccount.findMany({
    where: { tenantId },
    include: {
      sessions: {
        orderBy: { updatedAt: 'desc' },
        take: 1
      }
    }
  });

  // Fetch Facebook Pages
  const fbPages = await prisma.facebookPage.findMany({
    where: { tenantId }
  });

  return (
    <PageShell 
      title="Trung tâm kết nối" 
      description="Giám sát tình trạng kết nối các nền tảng bên ngoài (chỉ đọc)"
    >
      <div className="max-w-5xl space-y-6">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded text-sm text-amber-800">
          <p className="font-semibold mb-1">Lưu ý an toàn (Safety Guide):</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Đây là màn hình chỉ để giám sát (Read-only monitoring).</li>
            <li>Hệ thống <strong>không gửi tin nhắn</strong> từ trang này. Mọi tin nhắn tự động cần được CEO phê duyệt.</li>
            <li>Nếu trạng thái là "Cần kiểm tra", connector có thể đang ngoại tuyến hoặc hết phiên đăng nhập.</li>
          </ul>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Zalo VPS */}
          <div className="border rounded-lg p-5 bg-white shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Zalo Personal VPS</h3>
                <p className="text-xs text-slate-500">Tự động trả lời, gửi tin nhắn</p>
              </div>
            </div>
            
            <div className="flex-1 space-y-3">
              {zaloAccounts.length === 0 ? (
                <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  Chưa kết nối
                </div>
              ) : (
                zaloAccounts.map(account => {
                  const session = account.sessions[0];
                  const isOnline = account.isActive && session?.status === 'ONLINE';
                  return (
                    <div key={account.id} className="text-sm p-3 bg-slate-50 rounded border">
                      <div className="font-semibold text-slate-700">{account.displayName} ({account.phoneNumber})</div>
                      <div className={`flex items-center gap-2 mt-2 font-medium ${isOnline ? 'text-green-600' : 'text-orange-600'}`}>
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                        {isOnline ? 'Đang hoạt động' : 'Cần kiểm tra'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Fanpage Agent */}
          <div className="border rounded-lg p-5 bg-white shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Fanpage Agent</h3>
                <p className="text-xs text-slate-500">Tích hợp Facebook Messenger</p>
              </div>
            </div>
            
            <div className="flex-1 space-y-3">
              {fbPages.length === 0 ? (
                <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  Chưa kết nối
                </div>
              ) : (
                fbPages.map(page => (
                  <div key={page.id} className="text-sm p-3 bg-slate-50 rounded border">
                    <div className="font-semibold text-slate-700">{page.pageName}</div>
                    <div className={`flex items-center gap-2 mt-2 font-medium ${page.isActive ? 'text-green-600' : 'text-orange-600'}`}>
                      <div className={`w-2 h-2 rounded-full ${page.isActive ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                      {page.isActive ? 'Đang hoạt động' : 'Cần kiểm tra'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Center */}
          <div className="border rounded-lg p-5 bg-white shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">AI Center</h3>
                <p className="text-xs text-slate-500">LLM Core & Agents</p>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-sm font-medium text-green-600 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Đang hoạt động
              </div>
            </div>
          </div>

          {/* Payment / VietQR */}
          <div className="border rounded-lg p-5 bg-white shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Payment / VietQR</h3>
                <p className="text-xs text-slate-500">Thanh toán tự động</p>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                Chưa kết nối
              </div>
            </div>
          </div>

          {/* Worker Queue */}
          <div className="border rounded-lg p-5 bg-white shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Worker Queue</h3>
                <p className="text-xs text-slate-500">Tác vụ chạy ngầm</p>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                Chưa đủ dữ liệu
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageShell>
  );
}
