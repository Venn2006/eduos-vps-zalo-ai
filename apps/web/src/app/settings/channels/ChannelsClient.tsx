"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageCircle, Save } from 'lucide-react';
import { toast } from 'sonner';

type ChannelConfig = {
  zaloOaAppId: string | null;
  hasZaloOaToken: boolean;
};

export function ChannelsClient({ initialConfig }: { initialConfig: ChannelConfig }) {
  const [config, setConfig] = useState({
    zaloOaAppId: initialConfig?.zaloOaAppId || '',
    zaloOaToken: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/settings/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        toast.success('Lưu cấu hình Zalo thành công');
      } else {
        toast.error('Lỗi khi lưu cấu hình');
      }
    } catch {
      toast.error('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Kết nối Kênh</h2>
      </div>

      <Card className="shadow-sm border-blue-500/20">
        <CardHeader className="bg-blue-50/50 border-b border-blue-100">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
            <MessageCircle className="w-5 h-5" /> Zalo Official Account (Zalo OA)
          </CardTitle>
          <p className="text-sm text-slate-500 mt-2">
            Lưu thông tin kết nối Zalo OA cho tenant. Việc gửi thật vẫn phải qua kiểm tra Production Readiness và quy trình duyệt riêng.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Zalo App ID</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ví dụ: 123456789012345678"
                value={config.zaloOaAppId}
                onChange={e => setConfig({...config, zaloOaAppId: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Zalo OA Access Token</label>
              {initialConfig.hasZaloOaToken && (
                <p className="mb-2 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                  Token đang được lưu bảo mật. Để trống nếu không muốn thay đổi token hiện tại.
                </p>
              )}
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-xs"
                placeholder={initialConfig.hasZaloOaToken ? 'Nhập token mới nếu cần thay thế...' : 'Nhập Access Token...'}
                value={config.zaloOaToken}
                onChange={e => setConfig({...config, zaloOaToken: e.target.value})}
              />
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Đang lưu...' : 'Lưu cấu hình'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
