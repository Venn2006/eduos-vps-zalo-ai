"use client";
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Search, Filter, MoreVertical, Paperclip, Smile, Send, Mic, 
  Image as ImageIcon, FileText, CheckCircle2, Clock, Info, 
  MessageCircle, Users, GraduationCap, CheckSquare, BrainCircuit,
  Tag, Phone, Mail, Calendar, Edit3, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- MOCK DATA ---
const filterTabs = [
  'Tất cả', 'Chưa đọc', 'Cần xử lý', 'Phụ huynh', 'Học viên', 'Giáo viên', 'Group lớp', 'Công nợ', 'Xin nghỉ'
];

const mockConversations = [
  { id: '1', name: 'Phụ huynh bé Na', type: 'Parent', lastMessage: 'Cô ơi cho bé Na nghỉ hôm nay nhé.', time: '10:30', unread: 1, labels: ['Xin nghỉ', 'Học viên lớp HSK1-A06'], avatar: 'PN' },
  { id: '2', name: 'Group HSK1-A06', type: 'Group', lastMessage: 'Student 1: Em nộp bài tập ạ', time: '09:15', unread: 3, labels: ['Group lớp', 'Chưa nộp bài'], avatar: 'G', isGroup: true },
  { id: '3', name: 'Nguyễn Văn A', type: 'Student', lastMessage: 'Cho em hỏi lịch thi HSK đợt tới', time: 'Hôm qua', unread: 0, labels: ['Học viên', 'Sắp tái phí'], avatar: 'A' },
  { id: '4', name: 'Trần Thị B', type: 'Lead', lastMessage: 'Mình muốn tìm hiểu khóa giao tiếp', time: 'Hôm qua', unread: 0, labels: ['Lead nóng', 'Chưa đóng phí'], avatar: 'B' },
];

const mockMessages = [
  { id: '1', sender: 'Phụ huynh bé Na', isMe: false, text: 'Chào trung tâm, cho hỏi lịch khai giảng lớp HSK1 khóa mới là bao giờ ạ?', time: '10:15' },
  { id: '2', sender: 'Admin', isMe: true, text: 'Dạ OMLIS xin chào ạ. Lớp HSK1 khóa mới dự kiến khai giảng vào ngày 15/06 này. Mình muốn đăng ký cho bé học thử không ạ?', time: '10:20', status: 'read' },
  { id: '3', sender: 'Phụ huynh bé Na', isMe: false, text: 'Có nhé. Sắp xếp cho bé học thử thứ 7 này nha.', time: '10:25' },
  { id: '4', sender: 'Admin', isMe: true, text: 'Dạ vâng, OMLIS đã ghi nhận thông tin ạ. Admin sẽ xếp lịch học thử cho bé vào 19:00 Thứ 7 tuần này. Em gửi thông tin lớp cho mình nhé.', time: '10:28', status: 'read' },
  { id: '5', sender: 'Phụ huynh bé Na', isMe: false, text: 'Cô ơi cho bé Na nghỉ hôm nay nhé, bé bị sốt.', time: '10:30' },
];

const quickReplies = [
  'Dạ em kiểm tra ngay ạ',
  'Em gửi thông tin lớp cho mình nhé',
  'OMLIS đã ghi nhận thông tin ạ',
  'Mình inbox riêng admin giúp em nhé'
];

import { analyzeConversation } from '@eduos/shared/src/lib/conversationIntelligence';
import { ConversationIntelligenceCard } from '@/components/conversation/ConversationIntelligenceCard';

export default function ZaloInboxPage() {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [activeChat, setActiveChat] = useState('1');

  const transcript = mockMessages.map(m => m.text).join('\n');
  const intelligenceResult = analyzeConversation(transcript, 'ZALO');

  return (
    <div className="h-[calc(100vh-8rem)] flex overflow-hidden border border-border rounded-xl bg-background shadow-sm mt-4">
      
      {/* 1. LEFT COLUMN: CONVERSATION LIST */}
      <div className="w-80 border-r border-border flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-border bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-800">Inbox</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><Plus className="w-4 h-4"/></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500"><Filter className="w-4 h-4"/></Button>
            </div>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-100 border-transparent focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary rounded-md outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x">
            {filterTabs.map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap snap-start transition-colors border",
                  activeTab === tab 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {mockConversations.map(conv => (
            <div 
              key={conv.id}
              onClick={() => setActiveChat(conv.id)}
              className={cn(
                "p-3 border-b border-border hover:bg-white cursor-pointer transition-colors flex gap-3 relative",
                activeChat === conv.id ? "bg-white border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
              )}
            >
              <div className="relative">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm",
                  conv.isGroup ? "bg-indigo-500" : "bg-teal-500"
                )}>
                  {conv.avatar}
                </div>
                {conv.isGroup && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Users className="w-3 h-3 text-slate-500" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h4 className="font-semibold text-slate-900 text-sm truncate pr-2">{conv.name}</h4>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{conv.time}</span>
                </div>
                <p className={cn(
                  "text-xs truncate", 
                  conv.unread > 0 ? "font-semibold text-slate-800" : "text-slate-500"
                )}>
                  {conv.lastMessage}
                </p>
                <div className="flex gap-1 mt-1.5 overflow-hidden">
                  {conv.labels.map(l => (
                    <span key={l} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-medium whitespace-nowrap">{l}</span>
                  ))}
                </div>
              </div>
              
              {conv.unread > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-danger rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                  {conv.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. MIDDLE COLUMN: CHAT THREAD */}
      <div className="flex-1 flex flex-col min-w-[400px] bg-white">
        {/* Chat Header */}
        <div className="h-16 border-b border-border flex items-center justify-between px-4 bg-white shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white shadow-sm">
                PN
             </div>
             <div>
               <h3 className="font-bold text-slate-900 text-base">Phụ huynh bé Na</h3>
               <p className="text-xs text-emerald-600 flex items-center gap-1">
                 <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online
               </p>
             </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Button variant="ghost" size="icon"><Search className="w-5 h-5"/></Button>
            <Button variant="ghost" size="icon"><Phone className="w-5 h-5"/></Button>
            <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5"/></Button>
          </div>
        </div>

        {/* Pinned Note */}
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-start gap-2 text-sm text-amber-800">
           <Tag className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
           <div className="flex-1">
             <span className="font-semibold">Note:</span> Đang cần xếp lớp học thử. Chờ phản hồi giờ học thứ 7.
           </div>
           <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1"><Edit3 className="w-3.5 h-3.5"/></Button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
          <div className="text-center"><span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Hôm nay</span></div>
          {mockMessages.map(msg => (
            <div key={msg.id} className={cn("flex max-w-[75%]", msg.isMe ? "ml-auto flex-row-reverse" : "")}>
               {!msg.isMe && (
                 <div className="w-8 h-8 rounded-full bg-teal-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1">
                   PN
                 </div>
               )}
               <div className={cn(
                 "flex flex-col",
                 msg.isMe ? "items-end" : "items-start"
               )}>
                 <div className={cn(
                   "px-4 py-2 rounded-2xl text-sm shadow-sm",
                   msg.isMe 
                     ? "bg-primary text-primary-foreground rounded-tr-sm" 
                     : "bg-white border border-slate-100 rounded-tl-sm text-slate-800"
                 )}>
                   {msg.text}
                 </div>
                 <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                   {msg.time}
                   {msg.isMe && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                 </div>
               </div>
            </div>
          ))}
        </div>

        {/* Quick Replies */}
        <div className="px-4 py-2 bg-white flex gap-2 overflow-x-auto scrollbar-hide border-t border-slate-100">
          {quickReplies.map(qr => (
             <button key={qr} className="px-3 py-1.5 bg-primary/5 text-primary hover:bg-primary/10 border border-primary/20 rounded-full text-xs whitespace-nowrap font-medium transition-colors">
               {qr}
             </button>
          ))}
        </div>

        {/* Composer */}
        <div className="p-3 bg-white border-t border-border">
          <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600"><Paperclip className="w-4 h-4"/></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600"><ImageIcon className="w-4 h-4"/></Button>
            <textarea 
              placeholder="Nhập tin nhắn..." 
              className="flex-1 max-h-32 min-h-[40px] resize-none bg-transparent outline-none text-sm py-2 px-1 scrollbar-hide"
              rows={1}
            />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600"><Smile className="w-4 h-4"/></Button>
            <Button size="icon" className="h-8 w-8 bg-primary text-white rounded-lg shadow-sm hover:shadow"><Send className="w-4 h-4"/></Button>
          </div>
        </div>
      </div>

      {/* 3. RIGHT COLUMN: CRM & AI PANEL */}
      <div className="w-80 border-l border-border flex flex-col bg-slate-50/50">
        
        {/* AI Panel */}
        <div className="p-4 border-b border-border bg-gradient-to-br from-slate-50 to-blue-50/20 space-y-3">
          <ConversationIntelligenceCard result={intelligenceResult} />
        </div>

        {/* CRM Panel */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">Thông tin CRM</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-uppercase">LEAD</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
               <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
               <div>
                 <p className="text-xs text-slate-500">Số điện thoại</p>
                 <p className="text-sm font-medium text-slate-900">0987 654 321</p>
               </div>
            </div>
            <div className="flex items-start gap-3">
               <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
               <div>
                 <p className="text-xs text-slate-500">Email</p>
                 <p className="text-sm font-medium text-slate-900">phuhuynh.na@example.com</p>
               </div>
            </div>
            <div className="flex items-start gap-3">
               <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
               <div>
                 <p className="text-xs text-slate-500">Nguồn</p>
                 <p className="text-sm font-medium text-slate-900">Zalo OA</p>
               </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
             <h4 className="text-xs font-semibold text-slate-500 mb-2 flex items-center justify-between">
               Nhãn (Tags) <Button variant="ghost" size="icon" className="h-5 w-5"><Plus className="w-3 h-3"/></Button>
             </h4>
             <div className="flex flex-wrap gap-1.5">
               <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-medium rounded">Xin nghỉ</span>
               <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">Lead nóng</span>
               <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded border border-dashed border-slate-300 hover:bg-slate-200 cursor-pointer">+ Thêm nhãn</span>
             </div>
          </div>

        </div>

      </div>

    </div>
  );
}
