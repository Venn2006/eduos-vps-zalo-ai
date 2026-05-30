import React from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Filter, Search, Download } from 'lucide-react';

interface PageShellProps {
  title: string;
  description: string;
  primaryAction?: string;
  children?: React.ReactNode;
}

export function PageShell({ title, description, primaryAction, children }: PageShellProps) {
  return (
    <div className="space-y-6 pb-10 h-full flex flex-col">
      <SectionHeader 
        title={title} 
        description={description}
        action={
          <>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="w-4 h-4 mr-2" /> Xuất Excel
            </Button>
            {primaryAction && <Button size="sm">{primaryAction}</Button>}
          </>
        }
      />

      <Card className="flex-1 flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-border flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-md text-sm w-full outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" /> Lọc
          </Button>
        </div>
        
        <CardContent className="flex-1 p-0 relative">
          {children || (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">Chưa có dữ liệu</h3>
              <p className="text-sm">Chưa có bản ghi nào được tìm thấy hoặc module đang trong quá trình hoàn thiện.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
