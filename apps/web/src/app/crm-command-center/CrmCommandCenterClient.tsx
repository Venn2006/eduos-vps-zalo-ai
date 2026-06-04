"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Users, AlertTriangle, Briefcase, Bot, 
  Smartphone, Monitor, UsersRound, Phone, Activity, 
  UserCheck, Search, Clock, Calendar, X, CheckCircle2, HeartPulse, GraduationCap, FileText, AlertCircle
} from 'lucide-react';
import { MOCK_LEADS, MOCK_TASKS, CrmLead, LeadStage, LeadRisk, CrmTask, LIFECYCLE_LABELS } from '@/lib/crmDemoData';
import { StudentRiskLevel } from '@/lib/studentCareRisk';

export function CrmCommandCenterClient({ staffAccounts, classGroups }: { staffAccounts: any[], classGroups: any[] }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'kanban' | 'care'>('overview');
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'TODAY' | 'OVERDUE' | 'APPROVAL_ADMIN' | 'APPROVAL_TEACHER'>('ALL');

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

  const getStudentRiskColor = (risk: StudentRiskLevel) => {
    switch(risk) {
      case 'Khiếu nại/Cần handoff': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Nguy cơ nghỉ cao': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Cần chú ý': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Bình thường': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const filteredTasks = useMemo(() => {
    if (taskFilter === 'TODAY') return MOCK_TASKS.filter(t => t.dueTime.includes('Hôm nay') && t.status !== 'QUÁ HẠN');
    if (taskFilter === 'OVERDUE') return MOCK_TASKS.filter(t => t.status === 'QUÁ HẠN');
    if (taskFilter === 'APPROVAL_ADMIN') return MOCK_TASKS.filter(t => t.automationMode === 'ADMIN_APPROVAL_REQUIRED' || t.automationMode === 'STAFF_HANDOFF');
    if (taskFilter === 'APPROVAL_TEACHER') return MOCK_TASKS.filter(t => t.automationMode === 'TEACHER_APPROVAL_REQUIRED');
    return MOCK_TASKS;
  }, [taskFilter]);

  const highRiskStudents = MOCK_LEADS.filter(l => l.careRiskLevel === 'Nguy cơ nghỉ cao' || l.careRiskLevel === 'Khiếu nại/Cần handoff');

  return (
    <div className="space-y-6 relative">
      {/* Sandbox Warning Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3 text-sm text-blue-800">
        <Bot className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
        <div>
          <p className="font-bold">Hệ thống đang chạy trong môi trường Sandbox (Không gửi thật trong bản demo)</p>
          <p className="opacity-90">AI đóng vai trò trợ lý tự phân tích ngữ nghĩa, tự xử lý tin nhắn đơn giản, hoặc báo task cho Nhân viên/Admin phê duyệt. Mọi tương tác đều được lưu vết minh bạch.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100/50 p-1 rounded-lg w-fit border">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-white shadow-sm text-primary' : 'text-slate-600 hover:text-slate-900'}`}
        >
          CEO Overview
        </button>
        <button 
          onClick={() => setActiveTab('kanban')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'kanban' ? 'bg-white shadow-sm text-primary' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Pipeline & Tasks
        </button>
        <button 
          onClick={() => setActiveTab('care')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'care' ? 'bg-white shadow-sm text-primary flex items-center gap-2' : 'text-slate-600 hover:text-slate-900 flex items-center gap-2'}`}
        >
          <HeartPulse className="w-4 h-4" /> Chăm sóc rủi ro
          {highRiskStudents.length > 0 && <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{highRiskStudents.length}</span>}
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-rose-200 bg-rose-50/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between"><span className="text-slate-600 text-sm font-medium">Học viên có nguy cơ nghỉ</span><AlertTriangle className="w-4 h-4 text-rose-500" /></div>
                <div className="text-2xl font-bold text-slate-800 mt-2">{highRiskStudents.length}</div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between"><span className="text-slate-600 text-sm font-medium">Lead quá hạn phản hồi</span><Clock className="w-4 h-4 text-orange-500" /></div>
                <div className="text-2xl font-bold text-slate-800 mt-2">4</div>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-purple-50/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between"><span className="text-slate-600 text-sm font-medium">Cần admin duyệt hôm nay</span><UserCheck className="w-4 h-4 text-purple-500" /></div>
                <div className="text-2xl font-bold text-slate-800 mt-2">{MOCK_TASKS.filter(t => t.automationMode === 'ADMIN_APPROVAL_REQUIRED').length}</div>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between"><span className="text-slate-600 text-sm font-medium">Cần giáo viên xử lý</span><GraduationCap className="w-4 h-4 text-blue-500" /></div>
                <div className="text-2xl font-bold text-slate-800 mt-2">{MOCK_TASKS.filter(t => t.automationMode === 'TEACHER_APPROVAL_REQUIRED').length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="bg-slate-50 border-b pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-primary" /> Phân bổ Lead theo Kênh
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
              </CardContent>
            </Card>

            <Card className="shadow-sm border-rose-200">
              <CardHeader className="bg-rose-50 border-b border-rose-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-rose-800">
                  <AlertCircle className="w-5 h-5" /> Sự cố cần xử lý gấp (Phụ huynh phàn nàn)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y border-rose-100">
                {MOCK_LEADS.filter(l => l.careRiskLevel === 'Khiếu nại/Cần handoff').map(lead => (
                  <div key={lead.id} className="p-4 hover:bg-slate-50">
                    <div className="flex justify-between">
                      <p className="font-semibold text-sm text-slate-800">{lead.parentName || lead.name}</p>
                      <Badge className="bg-rose-100 text-rose-700 border-none text-[10px]">CẦN ADMIN GỌI</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{lead.aiSuggestion}</p>
                    <div className="mt-2 text-xs flex items-center gap-2">
                      <span className="text-slate-500 font-medium">Nhân viên phụ trách: {lead.assignedStaff}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'kanban' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Task Center */}
            <div className="xl:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-500" /> Cần xử lý hôm nay</h3>
                <Badge className="bg-indigo-100 text-indigo-700 border-none">{filteredTasks.length}</Badge>
              </div>
              
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className={`cursor-pointer text-[10px] ${taskFilter==='ALL' ? 'bg-primary text-white border-primary' : ''}`} onClick={() => setTaskFilter('ALL')}>Tất cả</Badge>
                <Badge variant="outline" className={`cursor-pointer text-[10px] ${taskFilter==='TODAY' ? 'bg-amber-500 text-white border-amber-500' : ''}`} onClick={() => setTaskFilter('TODAY')}>Hôm nay</Badge>
                <Badge variant="outline" className={`cursor-pointer text-[10px] ${taskFilter==='OVERDUE' ? 'bg-rose-500 text-white border-rose-500' : ''}`} onClick={() => setTaskFilter('OVERDUE')}>Quá hạn</Badge>
                <Badge variant="outline" className={`cursor-pointer text-[10px] ${taskFilter==='APPROVAL_ADMIN' ? 'bg-purple-500 text-white border-purple-500' : ''}`} onClick={() => setTaskFilter('APPROVAL_ADMIN')}>Admin duyệt</Badge>
                <Badge variant="outline" className={`cursor-pointer text-[10px] ${taskFilter==='APPROVAL_TEACHER' ? 'bg-blue-500 text-white border-blue-500' : ''}`} onClick={() => setTaskFilter('APPROVAL_TEACHER')}>Giáo viên</Badge>
              </div>

              <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                {filteredTasks.map(task => (
                  <Card key={task.id} className={`shadow-sm border-l-4 ${task.status === 'QUÁ HẠN' ? 'border-l-rose-400' : task.automationMode.includes('APPROVAL') ? 'border-l-purple-400' : 'border-l-amber-400'} overflow-hidden`}>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-semibold text-sm leading-tight text-slate-800">{task.title}</p>
                        <Badge variant="outline" className={`text-[9px] px-1 py-0 shrink-0 ${task.status === 'QUÁ HẠN' ? 'text-danger border-danger bg-danger/10' : 'text-slate-500'}`}>{task.status}</Badge>
                      </div>
                      <div className="text-[11px] text-slate-500">Đối tượng: <span className="font-medium text-slate-700">{task.leadName}</span></div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {task.dueTime}</span>
                        <span className="font-medium">{task.owner}</span>
                      </div>
                      <div className="bg-slate-50 rounded p-2 text-xs text-slate-600 mt-2 border border-slate-100">
                        <div className="font-medium text-slate-700 mb-1 flex items-center gap-1"><Bot className="w-3 h-3 text-indigo-500"/> AI gợi ý / Yêu cầu duyệt</div>
                        {task.reason && <div className="text-[10px] text-rose-600 mb-1 italic">Lý do: {task.reason}</div>}
                        {task.suggestedNextStep}
                        <div className="text-[9px] font-mono text-slate-400 mt-1">Rule: {task.automationMode}</div>
                      </div>
                      {task.category === 'TUITION' ? (
                        <Button size="sm" className="w-full text-[11px] h-7 mt-2" variant="outline" asChild>
                          <a href="/workspaces/finance">Đến Finance Workspace xử lý</a>
                        </Button>
                      ) : (
                        <Button size="sm" className="w-full text-[11px] h-7 mt-2" variant="outline">
                          {task.automationMode.includes('APPROVAL') ? 'Xem & Duyệt (Demo)' : 'Đánh dấu đã xử lý (Demo)'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {filteredTasks.length === 0 && <div className="text-center text-xs text-slate-400 py-4 italic">Không có công việc nào.</div>}
              </div>
            </div>

            {/* Kanban Board */}
            <div className="xl:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500" /> Lead Pipeline</h3>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Tìm kiếm nhanh..." className="pl-8 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:outline-primary w-48" />
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
                                <span className="text-[10px] text-slate-400 font-medium">{LIFECYCLE_LABELS[lead.lifecycleStage]}</span>
                              </div>
                              <h5 className="font-bold text-sm text-slate-800 mb-1">{lead.name}</h5>
                              <p className="text-xs text-slate-500 mb-2">{lead.nextAction}</p>
                              {lead.aiSuggestion && (
                                <div className="bg-indigo-50/50 border border-indigo-100 p-1.5 rounded flex gap-1.5 items-start mt-2">
                                  <Bot className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                  <span className="text-[10px] text-indigo-800 leading-tight line-clamp-2">{lead.aiSuggestion}</span>
                                </div>
                              )}
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

      {activeTab === 'care' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2 text-lg"><HeartPulse className="w-5 h-5 text-rose-500" /> Phụ huynh / Học viên cần chăm sóc</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {MOCK_LEADS.filter(l => l.careRiskLevel !== 'Bình thường').map(student => (
              <Card key={student.id} className={`shadow-sm border-l-4 ${student.careRiskLevel === 'Khiếu nại/Cần handoff' ? 'border-l-purple-500' : 'border-l-rose-500'} cursor-pointer hover:shadow-md transition-shadow`} onClick={() => setSelectedLead(student)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">{student.name}</h4>
                      <p className="text-sm text-slate-500">Phụ huynh: {student.parentName || 'Chưa cập nhật'}</p>
                    </div>
                    <Badge className={getStudentRiskColor(student.careRiskLevel)}>{student.careRiskLevel}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500">Vắng mặt gần đây</div>
                      <div className={`text-sm font-semibold ${student.careMetrics.recentAbsences >= 2 ? 'text-rose-600' : 'text-slate-700'}`}>{student.careMetrics.recentAbsences} buổi</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500">Thiếu BTVN</div>
                      <div className={`text-sm font-semibold ${student.careMetrics.homeworkMissing >= 3 ? 'text-rose-600' : 'text-slate-700'}`}>{student.careMetrics.homeworkMissing} bài</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500">Nợ học phí</div>
                      <div className={`text-sm font-semibold ${student.careMetrics.debtOverdueDays > 0 ? 'text-rose-600' : 'text-slate-700'}`}>{student.careMetrics.debtOverdueDays > 0 ? `Quá hạn ${student.careMetrics.debtOverdueDays} ngày` : 'Không'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500">Thái độ PH</div>
                      <div className={`text-sm font-semibold ${student.careMetrics.parentSentiment === 'NEGATIVE' ? 'text-rose-600' : 'text-slate-700'}`}>{student.careMetrics.parentSentiment === 'NEGATIVE' ? 'Tiêu cực' : 'Bình thường'}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Phụ trách: <span className="font-medium text-slate-700">{student.assignedStaff}</span></span>
                    <Button size="sm" variant="outline" className="h-7 text-xs">Xem timeline (Demo)</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {MOCK_LEADS.filter(l => l.careRiskLevel !== 'Bình thường').length === 0 && (
              <div className="text-slate-500 italic col-span-2 text-center py-12 bg-slate-50 rounded-lg">Không có học viên nào nằm trong diện rủi ro.</div>
            )}
          </div>
        </div>
      )}

      {/* Slide-out Timeline Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setSelectedLead(null)} />
          <div className="w-[450px] h-full bg-white shadow-2xl relative flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{selectedLead.name}</h3>
                <p className="text-sm text-slate-500">
                  {selectedLead.parentName && <span className="font-medium text-slate-700 mr-2">{selectedLead.parentName}</span>} 
                  {selectedLead.phone} • {selectedLead.source}
                </p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-slate-50/30">
              {/* Profile Panel */}
              <div className="p-4 border-b border-slate-200 bg-white space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs bg-slate-100 text-slate-700">Giai đoạn: {LIFECYCLE_LABELS[selectedLead.lifecycleStage]}</Badge>
                  <Badge variant="outline" className={`text-xs ${getStudentRiskColor(selectedLead.careRiskLevel)}`}>Rủi ro: {selectedLead.careRiskLevel}</Badge>
                </div>
                
                {selectedLead.classInfo && (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="text-xs text-slate-500 block mb-0.5">Lớp hiện tại</span>
                      <span className="font-medium text-slate-800">{selectedLead.classInfo}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="text-xs text-slate-500 block mb-0.5">Thời lượng còn</span>
                      <span className="font-medium text-slate-800">{selectedLead.remainingSessions} buổi</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Nhân viên phụ trách:</span>
                  <span className="font-semibold text-slate-700">{selectedLead.assignedStaff}</span>
                </div>
              </div>

              {/* Timeline Header */}
              <div className="p-4 pb-2">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> Hành trình Học viên & Phụ huynh
                </h4>
              </div>
              
              {/* Timeline Events */}
              <div className="p-4 pt-2 space-y-4 relative before:absolute before:inset-y-0 before:left-5 before:w-0.5 before:bg-slate-200">
                {selectedLead.timeline.map(event => (
                  <div key={event.id} className="relative pl-6">
                    <div className={`absolute left-[-5px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${
                      event.type === 'AI_SUGGESTION' || event.type === 'TUITION_REMINDER_DRAFT' ? 'bg-indigo-500' :
                      event.type === 'STAFF_REPLY' || event.type === 'RETENTION_CALL' ? 'bg-primary' :
                      event.type === 'TRIAL_BOOKED' || event.type === 'CONVERTED_STUDENT' || event.type === 'CLASS_ASSIGNED' ? 'bg-emerald-500' : 
                      event.type === 'PARENT_COMPLAINT' || event.type === 'CHURN_RISK_ALERT' ? 'bg-rose-500' :
                      event.type === 'HOMEWORK_MISSING' || event.type === 'ATTENDANCE_ABSENCE' ? 'bg-amber-500' :
                      'bg-slate-400'
                    }`} />
                    <div className="bg-white border border-slate-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                          {event.title}
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{event.timestamp}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2 leading-relaxed">{event.description}</p>
                      <div className="flex items-center gap-2 text-[10px] flex-wrap">
                        {event.actor && <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium flex items-center gap-1"><UserCheck className="w-3 h-3"/>{event.actor}</span>}
                        {event.source && <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded flex items-center gap-1"><Monitor className="w-3 h-3"/>{event.source}</span>}
                        {event.aiMode && <span className="font-mono text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{event.aiMode}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-white space-y-2 shrink-0">
              <Button className="w-full bg-primary hover:bg-primary/90">Soạn tin nhắn (Tạo nháp demo)</Button>
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
