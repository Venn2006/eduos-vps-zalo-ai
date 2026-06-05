"use client";

import React, { useState } from 'react';
import { 
  MessageSquare, Users, AlertTriangle, ShieldCheck, 
  Send, Bot, Filter, Search, Phone, User, Clock, 
  CheckCircle2, Info, Lock, Play
} from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusType, StatusBadge } from '@/components/ui/StatusBadge';
import { 
  teamInboxSummaryMetrics, 
  mockChannelsAndAccounts, 
  mockStaffProfiles, 
  mockConversations, 
  mockMessageThreads, 
  mockAiSuggestions 
} from '@/lib/teamInboxDemoData';

const getStatusType = (status: string): StatusType => {
  if (status === 'Chưa nhận') return 'danger';
  if (status === 'Cần chuyển người') return 'warning';
  if (status === 'Đang xử lý') return 'primary';
  if (status === 'Chờ duyệt nháp') return 'info';
  if (status === 'Đã xử lý demo') return 'success';
  return 'neutral';
};

export function TeamInboxClient() {
  const [selectedConvId, setSelectedConvId] = useState<string | null>(mockConversations[0]?.id || null);
  const [filter, setFilter] = useState('ALL');
  
  const selectedConv = mockConversations.find(c => c.id === selectedConvId);
  const messages = selectedConvId ? mockMessageThreads[selectedConvId] || [] : [];
  const aiSuggestion = selectedConvId ? mockAiSuggestions[selectedConvId] : null;

  const filteredConversations = mockConversations.filter(c => {
    if (filter === 'UNREAD') return c.status === 'Chưa nhận';
    if (filter === 'OVERDUE') return c.slaStatus === 'Quá SLA';
    if (filter === 'DRAFT') return c.status === 'Chờ duyệt nháp';
    if (filter === 'HOTLINE') return c.channel === 'Zalo Hotline trung tâm';
    if (filter === 'FANPAGE') return c.sourceAccount === 'Fanpage';
    if (filter === 'HANDOFF') return c.status === 'Cần chuyển người';
    return true;
  });

  return (
    <div className="space-y-6 flex flex-col min-h-[calc(100vh-8rem)] lg:h-[calc(100vh-8rem)]">
      {/* Header & Badges */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-primary" />
            Tin nhắn & Zalo
          </h1>
          <p className="text-slate-500 mt-1">
            Quản lý hội thoại hotline, fanpage và tài khoản công việc của nhân viên trong một khung điều hành.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-full text-xs font-semibold border border-rose-200 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Demo: chưa gửi thật
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Không scrape Zalo cá nhân
          </div>
          <div className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold border border-blue-200 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Hotline/work-channel
          </div>
          <div className="px-3 py-1.5 bg-fuchsia-50 text-fuchsia-600 rounded-full text-xs font-semibold border border-fuchsia-200 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> Có phân quyền
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 shrink-0">
        <MetricCard title="Tin chưa đọc" value={teamInboxSummaryMetrics.totalUnread.toString()} trend="up" icon={<MessageSquare className="w-5 h-5" />} color="danger" />
        <MetricCard title="Chưa ai nhận" value={teamInboxSummaryMetrics.unassignedConversations.toString()} icon={<User className="w-5 h-5" />} color="warning" />
        <MetricCard title="Quá SLA" value={teamInboxSummaryMetrics.overdueSla.toString()} icon={<Clock className="w-5 h-5" />} color="danger" />
        <MetricCard title="Nhân viên online demo" value={teamInboxSummaryMetrics.activeStaff.toString()} icon={<Users className="w-5 h-5" />} color="success" />
        <MetricCard title="Hotline đang xử lý" value={teamInboxSummaryMetrics.hotlineThreads.toString()} icon={<Phone className="w-5 h-5" />} color="primary" />
        <MetricCard title="Nháp chờ duyệt" value={teamInboxSummaryMetrics.waitingApprovalDrafts.toString()} icon={<CheckCircle2 className="w-5 h-5" />} color="primary" />
      </div>

      {/* 3-Pane Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Left Pane: Channels & Staff */}
        <div className="w-full lg:w-72 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h3 className="font-bold text-slate-800 mb-3 text-sm">Kênh liên hệ</h3>
            <div className="space-y-2">
              {mockChannelsAndAccounts.map(c => (
                <div key={c.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${c.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    <span className="text-sm font-medium text-slate-700">{c.name}</span>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h3 className="font-bold text-slate-800 mb-3 text-sm flex justify-between items-center">
              Tài khoản công việc demo
              <span title="Chỉ hiển thị các tài khoản Zalo công việc hoặc Hotline dùng chung. Không hiển thị Zalo cá nhân.">
                <Info className="w-4 h-4 text-slate-400" />
              </span>
            </h3>
            <p className="text-xs text-slate-500 mb-3 bg-slate-50 p-2 rounded">Không giám sát cá nhân. Chỉ mô phỏng phân quyền.</p>
            <div className="space-y-3">
              {mockStaffProfiles.map(s => (
                <div key={s.id} className="flex flex-col gap-1 p-2 border border-slate-100 rounded-lg hover:border-primary/30 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${s.status === 'online' ? 'bg-emerald-500' : s.status === 'busy' ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                      <span className="text-sm font-semibold text-slate-800">{s.staffName}</span>
                    </div>
                    {s.unreadCount > 0 && (
                      <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {s.unreadCount} tin
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>{s.workChannelName}</span>
                    <span>{s.assignedConversations} hội thoại</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <h3 className="font-bold text-indigo-900 mb-2 text-sm flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Phân quyền xử lý hội thoại
            </h3>
            <ul className="text-xs text-indigo-800 space-y-1 list-disc pl-4">
              <li><strong>CEO/Admin:</strong> xem toàn bộ, phân quyền, chuyển hội thoại</li>
              <li><strong>Quản lý:</strong> xem team, phân việc, duyệt nháp</li>
              <li><strong>Sale:</strong> xử lý lead/hotline được giao</li>
              <li><strong>Giáo viên:</strong> xem học viên liên quan lớp</li>
              <li><strong>Kế toán:</strong> xem hội thoại học phí</li>
            </ul>
          </div>
        </div>

        {/* Middle Pane: Conversation List */}
        <div className="w-full lg:w-96 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Tìm tên, SĐT, tin nhắn..." className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              <button onClick={() => setFilter('ALL')} className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Tất cả</button>
              <button onClick={() => setFilter('UNREAD')} className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'UNREAD' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Chưa nhận</button>
              <button onClick={() => setFilter('OVERDUE')} className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'OVERDUE' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Quá SLA</button>
              <button onClick={() => setFilter('DRAFT')} className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'DRAFT' ? 'bg-fuchsia-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Chờ duyệt nháp</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map(conv => (
              <div 
                key={conv.id} 
                onClick={() => setSelectedConvId(conv.id)}
                className={`p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50 ${selectedConvId === conv.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-slate-900 text-sm">{conv.customerName}</h4>
                  <span className="text-[10px] text-slate-400">{conv.lastActivityLabel}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-slate-500">{conv.maskedPhone}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{conv.channel}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 mb-2">{conv.lastMessagePreview}</p>
                <div className="flex items-center justify-between mt-2">
                  <StatusBadge status={getStatusType(conv.status)} label={conv.status} />
                  <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                    <User className="w-3 h-3" /> {conv.assignedStaff}
                  </span>
                </div>
                {conv.slaStatus === 'Quá SLA' && (
                  <div className="mt-2 text-[10px] text-rose-600 flex items-center gap-1 font-medium bg-rose-50 px-2 py-1 rounded w-fit">
                    <Clock className="w-3 h-3" /> Cảnh báo: Quá SLA phản hồi
                  </div>
                )}
              </div>
            ))}
            {filteredConversations.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">Không tìm thấy hội thoại nào.</div>
            )}
          </div>
        </div>

        {/* Right Pane: Detail & Chat */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[500px] overflow-hidden">
          {selectedConv ? (
            <>
              {/* Detail Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col gap-3 shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{selectedConv.customerName}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {selectedConv.maskedPhone}</span>
                      {selectedConv.studentName && <span>Học viên: <span className="font-medium text-slate-700">{selectedConv.studentName}</span></span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50">Nhận xử lý (Demo)</button>
                    <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50">Chuyển nhân viên (Demo)</button>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-medium border border-indigo-100 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Nguồn: {selectedConv.channel}
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium flex items-center gap-1">
                    <User className="w-3 h-3" /> Phụ trách: {selectedConv.assignedStaff}
                  </span>
                  <StatusBadge status={getStatusType(selectedConv.status)} label={selectedConv.status} />
                  {selectedConv.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">#{tag}</span>
                  ))}
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-4 overflow-y-auto bg-slate-50/30 space-y-4">
                <div className="text-center text-xs text-slate-400 my-4">Bắt đầu hội thoại - {selectedConv.createdAtLabel}</div>
                
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col max-w-[80%] ${msg.senderType === 'parent' ? 'self-start' : msg.senderType === 'internal_note' ? 'self-center w-full max-w-full' : 'self-end items-end'}`}>
                    {msg.senderType === 'internal_note' ? (
                      <div className="bg-amber-50 border border-amber-100 text-amber-800 text-xs px-4 py-2 rounded-lg text-center mx-auto my-2 shadow-sm flex items-center gap-2">
                        <Lock className="w-3 h-3" /> Ghi chú nội bộ: {msg.message}
                      </div>
                    ) : (
                      <>
                        <div className={`px-4 py-2 rounded-2xl ${
                          msg.senderType === 'parent' 
                            ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none' 
                            : msg.draftOnly
                              ? 'bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-900 rounded-tr-none border-dashed'
                              : 'bg-primary text-white rounded-tr-none'
                        }`}>
                          {msg.draftOnly && <div className="text-[10px] font-bold text-fuchsia-600 mb-1 flex items-center gap-1"><Bot className="w-3 h-3" /> NHÁP AI CHỜ DUYỆT</div>}
                          <p className="text-sm">{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">{msg.time}</span>
                      </>
                    )}
                  </div>
                ))}

                {/* AI Suggestion Box */}
                {aiSuggestion && (
                  <div className="mt-6 bg-white border border-fuchsia-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-fuchsia-500"></div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-fuchsia-100 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-fuchsia-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-fuchsia-700 uppercase tracking-wider mb-1">AI Gợi Ý Phản Hồi</h4>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-700 mb-2">
                          "{aiSuggestion.draftText}"
                        </div>
                        <div className="text-xs text-slate-500 mb-3">
                          <span className="font-semibold">Lý do:</span> {aiSuggestion.reason}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button className="px-3 py-1.5 bg-fuchsia-600 text-white rounded-lg text-xs font-semibold hover:bg-fuchsia-700 flex items-center gap-1">
                            <Send className="w-3 h-3" /> Gửi & Hoàn tất (Demo)
                          </button>
                          <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50">
                            Sửa nháp
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                <div className="flex gap-2">
                  <button className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 flex items-center justify-center" title="Soạn nháp AI (Demo)">
                    <Bot className="w-5 h-5" />
                  </button>
                  <input 
                    type="text" 
                    placeholder="Nhập tin nhắn trả lời..." 
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    readOnly
                  />
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium text-sm flex items-center gap-2">
                    <Send className="w-4 h-4" /> Gửi (Demo)
                  </button>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Lưu ghi chú nội bộ (Demo)
                  </button>
                  <button className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 ml-4">
                    <CheckCircle2 className="w-3 h-3" /> Đánh dấu đã xử lý demo
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col text-slate-400">
              <MessageSquare className="w-12 h-12 mb-2 text-slate-200" />
              <p>Chọn một hội thoại để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
      
      {/* CEO Oversight Panel */}
      <div className="bg-slate-900 rounded-xl p-5 text-white shadow-lg shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Play className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <User className="w-5 h-5 text-fuchsia-400" /> CEO nhìn thấy gì?
          </h3>
          <p className="text-slate-300 text-sm mb-4 max-w-3xl">
            Trong module Tin nhắn & Zalo, CEO không cần truy cập từng tài khoản cá nhân. Hệ thống tự động thu thập và phân tích dữ liệu từ các "Tài khoản công việc / Hotline" đã được cấp phép, cung cấp bức tranh toàn cảnh về hiệu suất chăm sóc khách hàng.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-3 border border-white/5">
              <div className="text-fuchsia-400 text-xs font-bold uppercase mb-1">Workload Summary</div>
              <div className="text-white text-sm">Sale 1 đang quá tải ({mockStaffProfiles.find(s => s.id === 's3')?.assignedConversations} hội thoại), trong khi CSKH 2 đang rảnh. Gợi ý điều phối lại.</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 border border-white/5">
              <div className="text-rose-400 text-xs font-bold uppercase mb-1">Cảnh báo SLA</div>
              <div className="text-white text-sm">Có {teamInboxSummaryMetrics.overdueSla} hội thoại chưa được phản hồi quá 30 phút. Trưởng phòng Sale cần can thiệp.</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 border border-white/5">
              <div className="text-emerald-400 text-xs font-bold uppercase mb-1">Governance Audit</div>
              <div className="text-white text-sm">Không scrape tin nhắn riêng tư. Toàn bộ {teamInboxSummaryMetrics.hotlineThreads} luồng hotline trung tâm đều được lưu trữ audit-ready.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
