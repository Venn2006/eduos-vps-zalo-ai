import React from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AiSuggestionCard } from '@/components/ui/AiSuggestionCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Bot, RefreshCw, FileText, CheckCircle } from 'lucide-react';

export default function AiCenterPage() {
  return (
    <div className="space-y-8 pb-10">
      <SectionHeader 
        title="AI Command Center" 
        description="Quản lý toàn bộ các tác vụ tự động và trợ lý ảo Zalo"
        action={<Button><RefreshCw className="w-4 h-4 mr-2" /> Làm mới dữ liệu</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main tasks list */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-primary/20">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <FileText className="w-5 h-5" /> Báo cáo cần duyệt (10)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {[1, 2, 3].map(i => (
                <AiSuggestionCard 
                  key={i}
                  type="draft"
                  title={`Báo cáo phụ huynh học sinh Nguyễn Văn ${i}`}
                  description="AI đã tổng hợp từ điểm số, điểm danh và đánh giá của giáo viên. Nhấn xem chi tiết để duyệt và gửi Zalo."
                  actionLabel="Duyệt gửi"
                  badges={["ai-generated", "needs-review"]}
                />
              ))}
              <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/10">Xem tất cả 10 báo cáo</Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-info/20">
            <CardHeader className="bg-info/5 border-b border-info/10">
              <CardTitle className="text-lg flex items-center gap-2 text-info">
                <Bot className="w-5 h-5" /> Đề xuất chăm sóc khách hàng (5)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {[1, 2].map(i => (
                <AiSuggestionCard 
                  key={i}
                  type="insight"
                  title="Follow-up học thử"
                  description="Lead Trần Thị B đã học thử bài 1 hôm qua. Đề xuất gửi tin nhắn Zalo hỏi thăm và tặng voucher 10%."
                  actionLabel="Duyệt gửi Zalo"
                  badges={["ai-generated"]}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* System Health */}
        <div className="space-y-6">
          <Card className="border-success/30 shadow-md">
            <CardHeader className="bg-success/5 border-b border-success/10">
              <CardTitle className="text-success flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Trạng thái Zalo VPS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Connector</span>
                  <span className="px-2 py-1 bg-success/15 text-success rounded text-xs font-bold border border-success/30">ONLINE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Lớp đã setup Bot</span>
                  <span className="font-extrabold text-lg">6<span className="text-slate-400 text-sm font-normal">/8</span></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Tin nhắn gửi hôm nay</span>
                  <span className="font-extrabold text-lg text-primary">42</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
