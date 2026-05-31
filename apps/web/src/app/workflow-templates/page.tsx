"use client";
import React, { useState } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Zap, Clock, MessageSquare, CheckSquare, BrainCircuit, 
  Settings2, Eye, Plus, ChevronRight, FileEdit, CreditCard, RefreshCw, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- MOCK DATA ---
const categories = [
  { id: 'all', label: 'Tất cả templates' },
  { id: 'ops', label: 'Lớp học & Vận hành' },
  { id: 'sales', label: 'Tuyển sinh & Học thử' },
  { id: 'academic', label: 'Bài tập & AI chấm bài' },
  { id: 'finance', label: 'Học phí & Tái phí' },
  { id: 'zalo', label: 'Zalo Group Automation' }
];

const mockTemplates = [
  {
    id: 't1',
    title: 'Nhắc lịch học trước 1 tiếng',
    category: 'ops',
    difficulty: 'Dễ',
    steps: 2,
    trigger: 'Trước lịch học 60 phút',
    modules: ['Lớp học', 'Zalo Group'],
    icon: <Clock className="w-5 h-5 text-blue-500" />,
    bg: 'bg-blue-50'
  },
  {
    id: 't2',
    title: 'Điểm danh bằng "Có mặt"',
    category: 'zalo',
    difficulty: 'Dễ',
    steps: 3,
    trigger: 'Tin nhắn chứa "Có mặt"',
    modules: ['Điểm danh', 'Zalo Group', 'AI Parser'],
    icon: <CheckSquare className="w-5 h-5 text-emerald-500" />,
    bg: 'bg-emerald-50'
  },
  {
    id: 't3',
    title: 'Nhắc giáo viên giao bài sau buổi học',
    category: 'academic',
    difficulty: 'Trung bình',
    steps: 2,
    trigger: 'Kết thúc ca học 30 phút',
    modules: ['Bài tập', 'Zalo Personal'],
    icon: <FileEdit className="w-5 h-5 text-teal-500" />,
    bg: 'bg-teal-50'
  },
  {
    id: 't4',
    title: 'Nhắc học viên nộp bài',
    category: 'academic',
    difficulty: 'Dễ',
    steps: 2,
    trigger: 'Trước hạn nộp 24h',
    modules: ['Bài tập', 'Zalo Group'],
    icon: <Clock className="w-5 h-5 text-orange-500" />,
    bg: 'bg-orange-50'
  },
  {
    id: 't5',
    title: 'AI chấm nháp bài tập',
    category: 'academic',
    difficulty: 'Khó',
    steps: 4,
    trigger: 'Học viên gửi ảnh/bài',
    modules: ['Bài tập', 'AI Vision', 'Zalo Group'],
    icon: <BrainCircuit className="w-5 h-5 text-fuchsia-500" />,
    bg: 'bg-fuchsia-50'
  },
  {
    id: 't6',
    title: 'Báo cáo phụ huynh cuối tuần',
    category: 'ops',
    difficulty: 'Trung bình',
    steps: 3,
    trigger: '19:00 Thứ 7 hàng tuần',
    modules: ['Báo cáo', 'Zalo Personal', 'AI Text'],
    icon: <MessageSquare className="w-5 h-5 text-indigo-500" />,
    bg: 'bg-indigo-50'
  },
  {
    id: 't7',
    title: 'Nhắc phí trước hạn 7 ngày',
    category: 'finance',
    difficulty: 'Dễ',
    steps: 2,
    trigger: 'Trước hạn nộp 7 ngày',
    modules: ['Học phí', 'Zalo Personal'],
    icon: <CreditCard className="w-5 h-5 text-rose-500" />,
    bg: 'bg-rose-50'
  },
  {
    id: 't8',
    title: 'Chăm sóc sau học thử 24h',
    category: 'sales',
    difficulty: 'Trung bình',
    steps: 3,
    trigger: 'Sau khi kết thúc học thử 24h',
    modules: ['Tuyển sinh', 'Zalo Personal'],
    icon: <Users className="w-5 h-5 text-cyan-500" />,
    bg: 'bg-cyan-50'
  },
  {
    id: 't9',
    title: 'Setup nhóm lớp mới bằng /setup',
    category: 'zalo',
    difficulty: 'Khó',
    steps: 5,
    trigger: 'Tin nhắn /setup',
    modules: ['Lớp học', 'Zalo Group', 'Bảo mật'],
    icon: <Zap className="w-5 h-5 text-amber-500" />,
    bg: 'bg-amber-50'
  }
];

export default function WorkflowTemplatesPage() {
  const [activeTab, setActiveTab] = useState('all');

  const filteredTemplates = activeTab === 'all' 
    ? mockTemplates 
    : mockTemplates.filter(t => t.category === activeTab);

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader 
        title="Thư viện Workflow Templates" 
        description="Các kịch bản tự động hóa Zalo được cấu hình sẵn cho trung tâm ngoại ngữ"
        action={
          <Button size="sm" className="shadow-md">
            <Plus className="w-4 h-4 mr-2" /> Tạo Workflow mới
          </Button>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shadow-sm border",
              activeTab === cat.id 
                ? "bg-primary text-white border-primary" 
                : "bg-white text-slate-600 border-border hover:bg-slate-50"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="border-border shadow-sm hover:shadow-md transition-shadow group flex flex-col">
            <CardHeader className="pb-3 flex-row items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", template.bg)}>
                  {template.icon}
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors">
                    {template.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 flex-1 flex flex-col">
              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Kích hoạt:</span>
                  <span className="font-semibold text-slate-700">{template.trigger}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Số bước thực hiện:</span>
                  <span className="font-semibold text-slate-700">{template.steps} bước</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Mức độ thiết lập:</span>
                  <span className={cn(
                    "font-bold px-2 py-0.5 rounded text-xs",
                    template.difficulty === 'Dễ' ? "bg-emerald-100 text-emerald-700" :
                    template.difficulty === 'Trung bình' ? "bg-amber-100 text-amber-700" :
                    "bg-rose-100 text-rose-700"
                  )}>
                    {template.difficulty}
                  </span>
                </div>
              </div>

              <div className="mt-auto">
                <p className="text-xs font-semibold text-slate-400 mb-2">Modules liên kết:</p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {template.modules.map(m => (
                    <span key={m} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium border border-slate-200">
                      {m}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 text-primary border-primary/30 hover:bg-primary/5">
                    <Eye className="w-4 h-4 mr-2" /> Xem trước
                  </Button>
                  <Button className="flex-1 shadow-md">
                    <Settings2 className="w-4 h-4 mr-2" /> Cài đặt <ChevronRight className="w-4 h-4 ml-1 opacity-50" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
