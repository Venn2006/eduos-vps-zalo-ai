import React from 'react';
import { Search } from 'lucide-react';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface PageShellProps {
  title: string;
  description: string;
  primaryAction?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageShell({ title, description, primaryAction, action, children }: PageShellProps) {
  return (
    <div className="space-y-6 pb-10 h-full flex flex-col">
      <SectionHeader
        title={title}
        description={description}
        action={
          <>
            {action && action}
            {primaryAction && (
              typeof primaryAction === 'string' ? <Button size="sm">{primaryAction}</Button> : primaryAction
            )}
          </>
        }
      />

      <Card className="flex-1 flex flex-col min-h-[500px]">
        <CardContent className="flex-1 p-0 relative">
          {children || (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">Chưa có dữ liệu</h3>
              <p className="text-sm">Chưa có dữ liệu phù hợp. Hãy thử đổi bộ lọc hoặc thêm thông tin mới.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
