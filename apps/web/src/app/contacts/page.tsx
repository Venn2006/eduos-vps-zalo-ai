"use client";
import React, { useState } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Search, Filter, Download, Plus, MoreHorizontal, User, 
  MessageSquare, Mail, Phone, Tag, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- MOCK DATA ---
const mockContacts = [
  {
    id: '1',
    name: 'Nguyễn Văn Học Viên',
    phone: '0987 111 222',
    role: 'STUDENT',
    linkedEntity: 'Lớp HSK1-A06',
    labels: ['Chưa nộp bài', 'Sắp tái phí'],
    lastInteraction: 'Hôm nay, 09:15',
    assignedStaff: 'Admin',
    source: 'Zalo Group',
    avatarColor: 'bg-indigo-500'
  },
  {
    id: '2',
    name: 'Phụ huynh bé Na',
    phone: '0987 654 321',
    role: 'GUARDIAN',
    linkedEntity: 'Bé Na',
    labels: ['Xin nghỉ'],
    lastInteraction: 'Hôm nay, 10:30',
    assignedStaff: 'Admin',
    source: 'Zalo Personal',
    avatarColor: 'bg-teal-500'
  },
  {
    id: '3',
    name: 'Trần Thị B',
    phone: '0912 345 678',
    role: 'LEAD',
    linkedEntity: '-',
    labels: ['Lead nóng', 'Đã học thử'],
    lastInteraction: 'Hôm qua, 15:20',
    assignedStaff: 'OMLIS Marketing',
    source: 'Fanpage',
    avatarColor: 'bg-rose-500'
  },
  {
    id: '4',
    name: 'Cô Giáo C',
    phone: '0909 000 111',
    role: 'TEACHER',
    linkedEntity: 'HSK1-A06, TOPIK-B02',
    labels: ['Cần nhắc giao bài'],
    lastInteraction: '2 ngày trước',
    assignedStaff: 'Admin',
    source: 'Zalo Personal',
    avatarColor: 'bg-amber-500'
  }
];

const roleConfig: Record<string, { label: string, bg: string, text: string }> = {
  STUDENT: { label: 'Học viên', bg: 'bg-blue-100', text: 'text-blue-700' },
  GUARDIAN: { label: 'Phụ huynh', bg: 'bg-teal-100', text: 'text-teal-700' },
  LEAD: { label: 'Khách tiềm năng', bg: 'bg-fuchsia-100', text: 'text-fuchsia-700' },
  TEACHER: { label: 'Giáo viên', bg: 'bg-amber-100', text: 'text-amber-700' },
};

export default function ContactsPage() {
  return (
    <div className="space-y-6 pb-10">
      <SectionHeader 
        title="Danh bạ khách hàng (CRM)" 
        description="Quản lý tập trung Lead, Học viên, Phụ huynh và Giáo viên"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="w-4 h-4 mr-2" /> Xuất Excel
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" /> Thêm liên hệ
            </Button>
          </div>
        }
      />

      <Card className="flex-1 flex flex-col shadow-sm">
        <div className="p-4 border-b border-border flex items-center justify-between gap-4 flex-wrap">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm theo tên, SĐT, nhãn..." 
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-md text-sm w-full outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white">
              <Filter className="w-4 h-4 mr-2 text-slate-500" /> Phân loại
            </Button>
            <Button variant="outline" size="sm" className="bg-white">
              <Tag className="w-4 h-4 mr-2 text-slate-500" /> Nhãn (Labels)
            </Button>
          </div>
        </div>
        
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">Liên hệ</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Liên kết (Lớp/HS)</th>
                <th className="px-6 py-4">Nhãn (Labels)</th>
                <th className="px-6 py-4">Tương tác cuối</th>
                <th className="px-6 py-4 text-center">Nguồn</th>
                <th className="px-6 py-4 text-right rounded-tr-xl">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockContacts.map((contact) => {
                const roleData = roleConfig[contact.role];
                return (
                  <tr key={contact.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm", contact.avatarColor)}>
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{contact.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {contact.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2.5 py-1 rounded-md text-xs font-bold", roleData.bg, roleData.text)}>
                        {roleData.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-700 font-medium">{contact.linkedEntity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {contact.labels.map(l => (
                          <span key={l} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium whitespace-nowrap">
                            {l}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs">{contact.lastInteraction}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Bởi: {contact.assignedStaff}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                        {contact.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5" title="Nhắn tin">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" title="Hồ sơ">
                          <User className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" title="Thêm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
