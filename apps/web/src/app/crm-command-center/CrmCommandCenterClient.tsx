"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Users, AlertTriangle, Briefcase, Bot, 
  Smartphone, Monitor, UsersRound, Phone, Activity, 
  UserCheck, Search, Clock, Calendar, X, ChevronRight, CheckCircle2, XCircle
} from 'lucide-react';
import { MOCK_LEADS, MOCK_TASKS, CrmLead, LeadStage, LeadRisk, CrmTask } from '@/lib/crmDemoData';

export function CrmCommandCenterClient({ staffAccounts, classGroups }: { staffAccounts: any[], classGroups: any[] }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'kanban'>('overview');
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);

  const getRiskColor = (risk: LeadRisk) => {
    switch (risk) {
      case 'NÓNG': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'ẤM': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'LẠNH': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'QUÁ HẠN': return 'bg-danger/10 text-danger border-danger/20';
      case 'CẦN HANDOFF': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Cảnh báo Sandbox */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3 text-sm text-blue-800">
        <Bot className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
        <div>
          <p className="font-bold">Bản demo hiện tại chạy trên môi trường Sandbox</p>
          <p className="opacity-90">Chưa gửi thật qua Zalo/Facebook. AI tự xử lý các câu đơn giản (AUTO_LOW_RISK), hoặc báo task/cảnh báo cho nhân viên nếu cần duyệt (STAFF_HANDOFF, ADMIN_APPROVAL_REQUIRED).</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100/50 p-1 rounded-lg w-fit border">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-white shadow-sm text-primary' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Tổng quan đa kênh
        </button>
        <button 
          onClick={() => setActiveTab('kanban')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'kanban' ? 'bg-white shadow-sm text-primary' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Lead Kanban & Tasks
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Top Summary 8 Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between"><span className="text-slate-600 text-sm font-medium">Lead mới hôm nay</span><Users className="w-4 h-4 text-emerald-500" /></div>
                <div className="text-2xl font-bold text-slate-800 mt-2">15</div>
              </CardContent>
            </Card>
            <Card className="border-rose-200 bg-rose-50/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between"><span className="text-slate-600 text-sm font-medium">Lead quá hạn phản hồi</span><Activity className="w-4 h-4 text-rose-500" /></div>
                <div className="text-2xl font-bold text-slate-800 mt-2">4</div>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between"><span className="text-slate-600 text-sm font-medium">Lịch học thử hôm nay</span><Calendar className="w-4 h-4 text-blue-500" /></div>
                <div className="text-2xl font-bold text-slate-800 mt-2">8</div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between"><span className="text-slate-600 text-sm font-medium">Phàn nàn/Xử lý sự cố</span><AlertTriangle className="w-4 h-4 text-orange-500" /></div>
                <div className="text-2xl font-bold text-slate-800 mt-2">2</div>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-purple-50/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between"><span className="text-slate-600 text-sm font-medium">Tin nhắn cần handoff</span><UserCheck className="w-4 h-4 text-purple-500" /></div>
                <div className="text-2xl font-bold text-slate-800 mt-2">5</div>
              </CardContent>
            </Card>
            <Card className="border-teal-200 bg-teal-50/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between"><span className="text-slate-600 text-sm font-medium">Tỷ lệ phản hồi đúng hạn</span><CheckCircle2 className="w-4 h-4 text-teal-500" /></div>
                <div className="text-2xl font-bold text-slate-800 mt-2">92%</div>
              </CardContent>
            </Card>
            <Card className="border-indigo-200 bg-indigo-50/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between"><span className="text-slate-600 text-sm font-medium">AI tự động xử lý (low-risk)</span><Bot className="w-4 h-4 text-indigo-500" /></div>
                <div className="text-2xl font-bold text-slate-800 mt-2">45</div>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between"><span className="text-slate-600 text-sm font-medium">Cần follow-up hôm nay</span><Briefcase className="w-4 h-4 text-amber-500" /></div>
                <div className="text-2xl font-bold text-slate-800 mt-2">12</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cột trái: Kênh và Hotline */}
            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader className="bg-slate-50 border-b pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-primary" /> Kênh đang kết nối
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y">
                  <div className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Monitor className="w-4 h-4"/></div>
                      <div><p className="font-semibold text-sm">Fanpage Trung Tâm</p></div>
                    </div>
                    <Badge className="bg-success">Kết nối</Badge>
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Smartphone className="w-4 h-4"/></div>
                      <div><p className="font-semibold text-sm">Zalo OA</p></div>
                    </div>
                    <Badge className="bg-success">Kết nối</Badge>
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><UsersRound className="w-4 h-4"/></div>
                      <div><p className="font-semibold text-sm">Nhóm Zalo Lớp</p></div>
                    </div>
                    <span className="text-sm font-bold text-slate-700">8 Nhóm</span>
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600"><UserCheck className="w-4 h-4"/></div>
                      <div><p className="font-semibold text-sm">Zalo Cá Nhân (Nhân viên)</p></div>
                    </div>
                    <span className="text-sm font-bold text-slate-700">10 Tài khoản</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-blue-200">
                <CardHeader className="bg-blue-50 border-b border-blue-100 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                    <Phone className="w-5 h-5" /> Zalo Hotline Trung Tâm
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Người quản lý:</span>
                    <span className="font-medium">Hoàng Văn E (Admin)</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Quyền trả lời:</span>
                    <span className="font-medium">Tất cả Tư vấn viên</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Hội thoại chờ:</span>
                    <span className="font-bold text-danger">5</span>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <Button variant="outline" className="flex-1 text-xs">Phân quyền</Button>
                    <Button className="flex-1 text-xs bg-blue-600">Mở hộp thư</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cột phải: Tài khoản nhân viên & Nhóm lớp */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-sm">
                <CardHeader className="bg-slate-50 border-b pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-primary" /> Tài khoản Zalo Nhân viên
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-primary text-xs">Xem chi tiết</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50/50 text-slate-500 border-b">
                        <tr>
                          <th className="px-4 py-3 font-medium">Nhân viên</th>
                          <th className="px-4 py-3 font-medium">Trạng thái Zalo</th>
                          <th className="px-4 py-3 font-medium text-center">Chưa trả lời</th>
                          <th className="px-4 py-3 font-medium text-center">Leads</th>
                          <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {staffAccounts.map((staff, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-800">{staff.name}</p>
                              <p className="text-[10px] text-slate-500">{staff.role}</p>
                            </td>
                            <td className="px-4 py-3">
                              {staff.status === 'ONLINE' ? (
                                <Badge variant="outline" className="text-success border-success bg-success/5 text-[10px]">Đang kết nối</Badge>
                              ) : staff.status === 'NEEDS_RELOGIN' ? (
                                <Badge variant="outline" className="text-danger border-danger bg-danger/5 text-[10px]">Cần quét QR</Badge>
                              ) : (
                                <Badge variant="outline" className="text-slate-500 text-[10px]">Mất kết nối</Badge>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {staff.unanswered > 0 ? <span className="font-bold text-danger">{staff.unanswered}</span> : <span className="text-slate-400">0</span>}
                            </td>
                            <td className="px-4 py-3 text-center font-medium">{staff.leads}</td>
                            <td className="px-4 py-3 text-right">
                              <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 text-primary">Xem inbox</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            
            {/* Follow-up Tasks */}
            <div className="xl:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-amber-500" /> Cần Follow-up</h3>
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">{MOCK_TASKS.length}</Badge>
              </div>
              <div className="space-y-3">
                {MOCK_TASKS.map(task => (
                  <Card key={task.id} className="shadow-sm border-l-4 border-l-amber-400 overflow-hidden">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-semibold text-sm leading-tight">{task.title}</p>
                        <Badge variant="outline" className={`text-[9px] px-1 py-0 ${task.status === 'QUÁ HẠN' ? 'text-danger border-danger bg-danger/10' : 'text-slate-500'}`}>{task.status}</Badge>
                      </div>
                      <div className="text-xs text-slate-500">Lead: <span className="font-medium text-slate-700">{task.leadName}</span></div>
                      <div className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3"/> Hạn: {task.dueTime}</div>
                      <div className="bg-slate-50 rounded p-2 text-xs text-slate-600 mt-2 border border-slate-100">
                        <div className="font-medium text-slate-700 mb-1 flex items-center gap-1"><Bot className="w-3 h-3 text-indigo-500"/> Gợi ý (Demo)</div>
                        {task.suggestedNextStep}
                        <div className="text-[9px] font-mono text-slate-400 mt-1">Rule: {task.automationMode}</div>
                      </div>
                      <Button size="sm" className="w-full text-xs h-7 mt-2" variant="outline">Xử lý (Demo)</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Kanban Board */}
            <div className="xl:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500" /> Pipeline (Kanban Demo)</h3>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Lọc lead..." className="pl-8 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:outline-primary w-48" />
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                {(['LEAD_MOI', 'DA_LIEN_HE', 'DA_HEN_HOC_THU', 'DA_HOC_THU', 'DA_CHOT', 'MAT_LEAD'] as LeadStage[]).map(stage => {
                  const stageLeads = MOCK_LEADS.filter(l => l.stage === stage);
                  const labels: Record<LeadStage, string> = {
                    LEAD_MOI: 'Lead Mới', DA_LIEN_HE: 'Đã Liên Hệ', DA_HEN_HOC_THU: 'Đã Hẹn Thử',
                    DA_HOC_THU: 'Đã Học Thử', DA_CHOT: 'Đã Chốt', MAT_LEAD: 'Mất Lead'
                  };
                  return (
                    <div key={stage} className="bg-slate-50/50 border border-slate-100 rounded-lg p-3 min-w-[280px] snap-center shrink-0 flex flex-col max-h-[70vh]">
                      <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                        <h4 className="font-semibold text-sm text-slate-700">{labels[stage]}</h4>
                        <span className="text-xs font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">{stageLeads.length}</span>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {stageLeads.map(lead => (
                          <Card 
                            key={lead.id} 
                            className="shadow-sm border border-slate-200 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
                            onClick={() => setSelectedLead(lead)}
                          >
                            <CardContent className="p-3">
                              <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRiskColor(lead.riskBadge)}`}>
                                  {lead.riskBadge}
                                </span>
                                <span className="text-[10px] text-slate-400">{lead.source}</span>
                              </div>
                              <h5 className="font-bold text-sm text-slate-800 mb-1">{lead.name}</h5>
                              <p className="text-xs text-slate-500 mb-2">{lead.nextAction}</p>
                              {lead.aiSuggestion && (
                                <div className="bg-indigo-50/50 border border-indigo-100 p-1.5 rounded flex gap-1.5 items-start mt-2">
                                  <Bot className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                  <span className="text-[10px] text-indigo-800 leading-tight line-clamp-2">{lead.aiSuggestion}</span>
                                </div>
                              )}
                              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                                <span className="text-[10px] text-slate-500">{lead.assignedStaff}</span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3"/> {lead.lastInteractionTime}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {stageLeads.length === 0 && (
                          <div className="text-center py-6 text-slate-400 text-xs italic">Không có lead</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Timeline Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setSelectedLead(null)} />
          <div className="w-[400px] h-full bg-white shadow-2xl relative flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-lg">{selectedLead.name}</h3>
                <p className="text-sm text-slate-500">{selectedLead.phone} • {selectedLead.source}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30">
              <div className="mb-6 flex gap-2 flex-wrap">
                <Badge variant="outline" className={`text-xs ${getRiskColor(selectedLead.riskBadge)}`}>Trạng thái: {selectedLead.riskBadge}</Badge>
                <Badge variant="outline" className="text-xs bg-slate-100 text-slate-700">Phụ trách: {selectedLead.assignedStaff}</Badge>
              </div>

              <h4 className="font-semibold text-sm text-slate-700 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Timeline Tương tác
              </h4>
              
              <div className="space-y-4 pl-2 relative before:absolute before:inset-y-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                {selectedLead.timeline.map(event => (
                  <div key={event.id} className="relative pl-6">
                    <div className={`absolute left-[-5px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                      event.type === 'AI_SUGGESTION' ? 'bg-indigo-500' :
                      event.type === 'STAFF_REPLY' ? 'bg-primary' :
                      event.type === 'TRIAL_BOOKED' ? 'bg-success' : 'bg-slate-400'
                    }`} />
                    <div className="bg-white border border-slate-100 rounded-lg p-3 shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm flex items-center gap-1.5">
                          {event.type === 'AI_SUGGESTION' && <Bot className="w-3.5 h-3.5 text-indigo-500" />}
                          {event.title}
                        </span>
                        <span className="text-[10px] text-slate-400">{event.timestamp}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                      <div className="flex items-center gap-2 text-[10px]">
                        {event.actor && <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{event.actor}</span>}
                        {event.aiMode && <span className="font-mono text-indigo-400">{event.aiMode}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-white space-y-2">
              <Button className="w-full bg-primary hover:bg-primary/90">Soạn tin nhắn (Demo)</Button>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">Tạo Task (Demo)</Button>
                <Button variant="outline" className="flex-1 text-danger border-danger/30 hover:bg-danger/10">Báo xấu (Demo)</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
