"use client";
import React from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Download, MessageSquare, Clock, AlertTriangle, Sparkles, 
  Users, BarChart3, TrendingUp, Calendar, PieChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MessageReportsPage() {
  return (
    <div className="space-y-8 pb-10">
      <SectionHeader 
        title="Message Analytics" 
        description="Báo cáo hiệu suất tương tác và chăm sóc khách hàng qua Zalo"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white">
              <Calendar className="w-4 h-4 mr-2" /> Tuần này
            </Button>
            <Button size="sm" className="shadow-md">
              <Download className="w-4 h-4 mr-2" /> Xuất báo cáo
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard 
          title="Tổng tin nhắn" 
          value="1,245" 
          trend="up" 
          description="So với tuần trước" 
          icon={<MessageSquare className="w-5 h-5 text-blue-500" />} 
        />
        <StatCard 
          title="Chưa đọc" 
          value="12" 
          trend="down" 
          description="Cần xử lý ngay" 
          icon={<AlertTriangle className="w-5 h-5 text-rose-500" />} 
        />
        <StatCard 
          title="Hội thoại cần xử lý" 
          value="8" 
          trend="neutral" 
          description="Đang pending" 
          icon={<Clock className="w-5 h-5 text-amber-500" />} 
        />
        <StatCard 
          title="Thời gian phản hồi" 
          value="15p" 
          trend="down" 
          description="Trung bình" 
          icon={<TrendingUp className="w-5 h-5 text-emerald-500" />} 
        />
        <StatCard 
          title="Tin AI hỗ trợ" 
          value="450" 
          trend="up" 
          description="Tiết kiệm 12h làm việc" 
          icon={<Sparkles className="w-5 h-5 text-fuchsia-500" />} 
        />
        <StatCard 
          title="Group hoạt động nhất" 
          value="HSK1-A06" 
          trend="neutral" 
          description="120 tin/ngày" 
          icon={<Users className="w-5 h-5 text-indigo-500" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Tin nhắn theo ngày */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2 border-b border-border/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Lưu lượng tin nhắn theo ngày</CardTitle>
                <p className="text-xs text-slate-500 mt-1">Inbound vs Outbound trong 7 ngày qua</p>
              </div>
              <BarChart3 className="w-5 h-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="h-72 flex items-end justify-between gap-4 pt-8 pb-4">
            {/* Mock Bar Chart */}
            {[
              { in: 40, out: 60, label: 'T2' },
              { in: 50, out: 70, label: 'T3' },
              { in: 30, out: 50, label: 'T4' },
              { in: 80, out: 90, label: 'T5' },
              { in: 45, out: 65, label: 'T6' },
              { in: 95, out: 100, label: 'T7' },
              { in: 20, out: 30, label: 'CN' }
            ].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end gap-1 h-full relative group">
                <div className="w-full flex gap-1 items-end justify-center h-full pb-6 relative">
                  {/* Inbound bar */}
                  <div className="w-1/3 bg-blue-400 rounded-t-sm hover:bg-blue-500 transition-colors" style={{ height: `${d.in}%` }}></div>
                  {/* Outbound bar */}
                  <div className="w-1/3 bg-indigo-500 rounded-t-sm hover:bg-indigo-600 transition-colors" style={{ height: `${d.out}%` }}></div>
                  
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl pointer-events-none flex flex-col items-center">
                    <span className="font-bold text-blue-300">In: {d.in * 10}</span>
                    <span className="font-bold text-indigo-300">Out: {d.out * 10}</span>
                  </div>
                </div>
                <div className="text-center text-xs text-slate-500 font-medium border-t border-slate-100 pt-2">{d.label}</div>
              </div>
            ))}
          </CardContent>
          <div className="flex justify-center gap-6 pb-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium"><span className="w-3 h-3 rounded-sm bg-blue-400"></span> Tin nhắn nhận (Inbound)</div>
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium"><span className="w-3 h-3 rounded-sm bg-indigo-500"></span> Tin nhắn gửi (Outbound)</div>
          </div>
        </Card>

        {/* Chart 2: Phân bổ kênh */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2 border-b border-border/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Phân bổ tương tác</CardTitle>
                <p className="text-xs text-slate-500 mt-1">Nguồn hội thoại & Tỷ lệ xử lý bởi AI</p>
              </div>
              <PieChart className="w-5 h-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center p-6 gap-8">
            {/* Mock Donut Chart using CSS conic-gradient */}
            <div className="relative w-48 h-48 rounded-full shadow-inner" style={{ background: 'conic-gradient(#3b82f6 0% 45%, #8b5cf6 45% 75%, #10b981 75% 90%, #f59e0b 90% 100%)' }}>
              <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]">
                <span className="text-2xl font-black text-slate-800">1.2K</span>
                <span className="text-xs font-semibold text-slate-500">Tin nhắn</span>
              </div>
            </div>
            
            {/* Legend */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-blue-500 shadow-sm"></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Zalo Cá Nhân</p>
                  <p className="text-xs text-slate-500">45% (540 tin)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-purple-500 shadow-sm"></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Zalo Group Lớp</p>
                  <p className="text-xs text-slate-500">30% (360 tin)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-emerald-500 shadow-sm"></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Fanpage Facebook</p>
                  <p className="text-xs text-slate-500">15% (180 tin)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-amber-500 shadow-sm"></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Khác (Zalo OA)</p>
                  <p className="text-xs text-slate-500">10% (120 tin)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart 3: Thời gian phản hồi */}
        <Card className="border-border shadow-sm col-span-1 lg:col-span-2">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-base font-bold text-slate-800">Hiệu suất nhân sự & Tốc độ phản hồi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Nhân sự / Kênh</th>
                  <th className="px-6 py-3">Tin đã xử lý</th>
                  <th className="px-6 py-3">Thời gian phản hồi (Avg)</th>
                  <th className="px-6 py-3 text-center">Đánh giá CSKH</th>
                  <th className="px-6 py-3">AI Support Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { name: 'OMLIS Admin', handled: 420, respTime: '5 phút', rating: '4.8/5', ai: '60%', status: 'text-emerald-600' },
                  { name: 'OMLIS Support', handled: 380, respTime: '12 phút', rating: '4.5/5', ai: '45%', status: 'text-blue-600' },
                  { name: 'OMLIS Marketing', handled: 250, respTime: '25 phút', rating: '4.2/5', ai: '30%', status: 'text-amber-600' },
                  { name: 'Zalo Bot Auto-reply', handled: 195, respTime: '< 1 phút', rating: 'N/A', ai: '100%', status: 'text-fuchsia-600' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-800">{row.name}</td>
                    <td className="px-6 py-4 text-slate-600">{row.handled}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{row.respTime}</td>
                    <td className="px-6 py-4 text-center font-semibold text-amber-500">{row.rating}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={cn("font-bold", row.status)}>{row.ai}</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={cn("h-full", row.status.replace('text-', 'bg-'))} style={{ width: row.ai }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
