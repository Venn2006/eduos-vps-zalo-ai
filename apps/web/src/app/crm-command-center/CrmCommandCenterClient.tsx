"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Bot, CheckCircle2, Clock, HeartPulse, MessageCircle, Search, UserCheck, X } from 'lucide-react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LIFECYCLE_LABELS } from '@/lib/crmTypes';
import type { CrmLead, CrmTask, LeadRisk, LeadStage } from '@/lib/crmTypes';
import type { StudentRiskLevel } from '@/lib/studentCareRisk';
import { addCareLog, convertLeadToStudent, createLeadFollowUpTask } from '../actions/leads';

type CrmCommandCenterClientProps = {
  staffAccounts: unknown[];
  classGroups: unknown[];
  leads: CrmLead[];
  việcs: CrmTask[];
};

const PIPELINE_STAGES: Array<{ stage: LeadStage; label: string }> = [
  { stage: 'LEAD_MOI', label: 'Mới' },
  { stage: 'DA_LIEN_HE', label: 'Đã liên hệ' },
  { stage: 'DA_HEN_HOC_THU', label: 'Hẹn học thử' },
  { stage: 'DA_HOC_THU', label: 'Đã học thử' },
  { stage: 'DA_CHOT', label: 'Đã chốt' }
];

export function CrmCommandCenterClient({ leads, việcs }: CrmCommandCenterClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'kanban' | 'care'>('overview');
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const [convertingLeadId, setConvertingLeadId] = useState<string | null>(null);
  const [showZaloModalFor, setShowZaloModalFor] = useState<CrmLead | null>(null);

  const highRiskStudents = useMemo(
    () => leads.filter((lead) => lead.careRiskLevel === 'Nguy cơ nghỉ cao' || lead.careRiskLevel === 'Khiếu nại/Cần handoff'),
    [leads]
  );

  const funnelData = useMemo(
    () => PIPELINE_STAGES.map(({ stage, label }) => ({ name: label, value: leads.filter((lead) => lead.stage === stage).length })),
    [leads]
  );

  const handleConvertLeadToStudent = async (lead: CrmLead) => {
    setConvertingLeadId(lead.id);
    try {
      const student = await convertLeadToStudent(lead.id);
      toast.success('Đã chuyển thành học viên chính thức');
      setSelectedLead(null);
      router.push(`/students/${student.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể chuyển lead thành học viên');
    } finally {
      setConvertingLeadId(null);
    }
  };

  const handleAddCareLog = async (lead: CrmLead, note: string) => {
    await addCareLog(lead.id, { type: 'NOTE', notes: note });
    toast.success('Đã lưu ghi chú chăm sóc');
    router.refresh();
  };

  const handleCreateFollowUpTask = async (lead: CrmLead, description?: string) => {
    const việcDescription = description?.trim() || `Chăm sóc lead ${lead.name} trong 24h`;
    await createLeadFollowUpTask(lead.id, { description: việcDescription });
    toast.success('Đã tạo việc việc chăm sóc');
    router.refresh();
  };

  return (
    <div className="relative space-y-8">
      <div className="flex max-w-full gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-100 p-1 shadow-sm sm:w-fit">
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Tổng quan</TabButton>
        <TabButton active={activeTab === 'kanban'} onClick={() => setActiveTab('kanban')}>Phễu tuyển sinh</TabButton>
        <TabButton active={activeTab === 'care'} onClick={() => setActiveTab('care')}>
          <HeartPulse className="h-4 w-4" /> Rủi ro {highRiskStudents.length > 0 && <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] text-white">{highRiskStudents.length}</span>}
        </TabButton>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <MetricCard label="Khách tiềm năng" value={leads.length} icon={<Search className="h-5 w-5 text-indigo-600" />} />
            <MetricCard label="Đã chốt" value={leads.filter((lead) => lead.stage === 'DA_CHOT').length} icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} />
            <MetricCard label="Cần chăm sóc" value={highRiskStudents.length} icon={<AlertCircle className="h-5 w-5 text-rose-600" />} />
            <MetricCard label="Cần duyệt" value={việcs.filter((việc) => việc.automationMode?.includes('APPROVAL')).length} icon={<UserCheck className="h-5 w-5 text-purple-600" />} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="rounded-2xl border-slate-200 shadow-sm lg:col-span-2">
              <CardHeader className="border-b border-slate-100 bg-slate-50/60 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-800"><Bot className="h-5 w-5 text-indigo-500" /> Phễu tuyển sinh</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={funnelData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                      {funnelData.map((_, index) => <Cell key={index} fill={index === funnelData.length - 1 ? '#10b981' : '#6366f1'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-rose-200 shadow-sm">
              <CardHeader className="border-b border-rose-100 bg-rose-50 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-rose-800"><AlertCircle className="h-5 w-5" /> Việc cần xử lý</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100 p-0">
                {việcs.slice(0, 4).map((việc) => (
                  <div key={việc.id} className="p-4">
                    <p className="font-bold text-slate-900">{việc.title}</p>
                    <p className="mt-1 text-sm font-medium text-slate-500">{việc.leadName} - {việc.dueTime}</p>
                  </div>
                ))}
                {việcs.length === 0 && <p className="p-4 text-sm font-medium text-slate-500">Chưa có tác vụ cần xử lý.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'kanban' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          {PIPELINE_STAGES.map(({ stage, label }) => {
            const stageLeads = leads.filter((lead) => lead.stage === stage);
            return (
              <div key={stage} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">{label}</h3>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500 shadow-sm">{stageLeads.length}</span>
                </div>
                <div className="space-y-3">
                  {stageLeads.map((lead) => <LeadCard key={lead.id} lead={lead} onOpen={() => setSelectedLead(lead)} />)}
                  {stageLeads.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-xs font-medium text-slate-400">Trống</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'care' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {highRiskStudents.map((lead) => <CareCard key={lead.id} lead={lead} onOpen={() => setSelectedLead(lead)} />)}
          {highRiskStudents.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-medium text-slate-500">Chưa có học viên/lead rủi ro cao.</div>}
        </div>
      )}

      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          isConverting={convertingLeadId === selectedLead.id}
          onClose={() => setSelectedLead(null)}
          onConvert={() => handleConvertLeadToStudent(selectedLead)}
          onAddCareLog={(note) => handleAddCareLog(selectedLead, note)}
          onCreateFollowUpTask={(description) => handleCreateFollowUpTask(selectedLead, description)}
          onOpenZalo={() => setShowZaloModalFor(selectedLead)}
        />
      )}

      {showZaloModalFor && <ZaloSandboxModal lead={showZaloModalFor} onClose={() => setShowZaloModalFor(null)} />}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`flex shrink-0 items-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition-colors ${active ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}>{children}</button>;
}

function MetricCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">{icon}</div></div>
        <div className="mt-4 text-3xl font-black text-slate-900">{value}</div>
      </CardContent>
    </Card>
  );
}

function LeadCard({ lead, onOpen }: { lead: CrmLead; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold text-slate-900">{lead.name}</p>
          <p className="mt-1 truncate text-xs font-medium text-slate-500">{lead.phone}</p>
        </div>
        <Badge className={getRiskColor(lead.riskBadge)}>{lead.riskBadge}</Badge>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{lead.nextAction || 'Chưa có hành động tiếp theo'}</p>
    </button>
  );
}

function CareCard({ lead, onOpen }: { lead: CrmLead; onOpen: () => void }) {
  return (
    <Card className="rounded-2xl border-l-[6px] border-l-rose-500 shadow-sm transition hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-black text-slate-900">{lead.name}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">{lead.phone}</p>
          </div>
          <Badge className={getStudentRiskColor(lead.careRiskLevel)}>{lead.careRiskLevel}</Badge>
        </div>
        <p className="mt-4 text-sm font-medium kháching-6 text-slate-600">{lead.aiSuggestion || lead.nextAction}</p>
        <Button onClick={onOpen} size="sm" className="mt-4 h-9 rounded-lg font-bold">Xem hồ sơ</Button>
      </CardContent>
    </Card>
  );
}

function LeadDrawer({
  lead,
  isConverting,
  onClose,
  onConvert,
  onAddCareLog,
  onCreateFollowUpTask,
  onOpenZalo
}: {
  lead: CrmLead;
  isConverting: boolean;
  onClose: () => void;
  onConvert: () => void;
  onAddCareLog: (note: string) => Promise<void>;
  onCreateFollowUpTask: (description?: string) => Promise<void>;
  onOpenZalo: () => void;
}) {
  const [careNote, setCareNote] = useState('');
  const [isSavingCareNote, setIsSavingCareNote] = useState(false);
  const [isCreatingViệc, setIsCreatingViệc] = useState(false);

  const handleSaveCareNote = async () => {
    const note = careNote.trim();
    if (!note) {
      toast.error('Vui lòng nhập nội dung ghi chú');
      return;
    }

    setIsSavingCareNote(true);
    try {
      await onAddCareLog(note);
      setCareNote('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu ghi chú');
    } finally {
      setIsSavingCareNote(false);
    }
  };

  const handleCreateViệc = async () => {
    setIsCreatingViệc(true);
    try {
      await onCreateFollowUpTask(careNote);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo việc');
    } finally {
      setIsCreatingViệc(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-[500px] flex-col bg-slate-50 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">{lead.name.charAt(0)}</div>
            <div className="min-w-0">
              <h3 className="truncate text-xl font-black kháching-tight text-slate-900">{lead.name}</h3>
              <p className="mt-1 truncate text-sm font-medium text-slate-500">{lead.parentName ? `${lead.parentName} - ` : ''}{lead.phone}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mb-2 space-y-5 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700">{LIFECYCLE_LABELS[lead.lifecycleStage] || lead.lifecycleStage}</Badge>
              <Badge className={getStudentRiskColor(lead.careRiskLevel)}>{lead.careRiskLevel}</Badge>
            </div>

            {lead.classInfo && (
              <div className="grid grid-cols-2 gap-4">
                <InfoBlock label="Lớp hiện tại" value={lead.classInfo} />
                <InfoBlock label="Còn lại" value={`${lead.remainingSessions ?? 0} buổi`} />
              </div>
            )}

            {lead.stage === 'DA_CHOT' && (
              <Button onClick={onConvert} disabled={isConverting} className="h-12 w-full rounded-xl bg-emerald-600 text-base font-bold text-white shadow-md hover:bg-emerald-700">
                <CheckCircle2 className="mr-2 h-5 w-5" /> {isConverting ? 'Đang chuyển...' : 'Chuyển thành Học viên'}
              </Button>
            )}
          </div>

          <div className="px-6 py-4">
            <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400"><Clock className="h-4 w-4" /> Lịch sử tương tác</h4>
          </div>
          <div className="space-y-4 px-6 pb-6">
            {lead.timeline.map((event) => (
              <div key={event.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <p className="font-bold text-slate-900">{event.title}</p>
                  <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-400">{event.timestamp}</span>
                </div>
                <p className="text-sm font-medium kháching-6 text-slate-600">{event.description}</p>
              </div>
            ))}
            {lead.timeline.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-medium text-slate-400">Chưa có tương tác nào</div>}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <Button onClick={onOpenZalo} className="mb-3 h-12 w-full rounded-xl bg-blue-600 text-base font-bold text-white shadow-md hover:bg-blue-700"><MessageCircle className="mr-2 h-5 w-5" /> Mở kênh nhắn chờ duyệt</Button>
          <div className="space-y-3">
            <textarea
              value={careNote}
              onChange={(event) => setCareNote(event.target.value)}
              placeholder="Nhập ghi chú chăm sóc sau cuộc gọi hoặc tin nhắn..."
              className="min-h-20 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-3">
              <Button onClick={handleCreateViệc} disabled={isCreatingViệc} variant="outline" className="h-11 flex-1 rounded-xl font-bold">
                {isCreatingViệc ? 'Đang tạo...' : 'Tạo Việc'}
              </Button>
              <Button onClick={handleSaveCareNote} disabled={isSavingCareNote || !careNote.trim()} className="h-11 flex-1 rounded-xl font-bold">
                {isSavingCareNote ? 'Đang lưu...' : 'Lưu ghi chú'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-100 bg-slate-50 p-3"><span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span><span className="font-bold text-slate-800">{value}</span></div>;
}

function ZaloSandboxModal({ lead, onClose }: { lead: CrmLead; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-[440px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-blue-600 p-4 text-white shadow-md">
          <div>
            <h3 className="font-bold kháching-tight">{lead.parentName || lead.name}</h3>
            <p className="text-xs text-blue-100">Kênh gửi thật đang khóa trong dùng thử</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-white/20"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4 bg-slate-50 p-5">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-bold">Không gửi tin trực tiếp từ CRM trong bản dùng thử.</p>
            <p className="mt-1 kháching-6">Để tránh lead hiểu nhầm là kết nối thật, CRM chỉ cho mở inbox hoặc Hàng chờ duyệt. Tin thật cần qua luồng duyệt riêng.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <p className="font-bold text-slate-900">Lead: {lead.name}</p>
            <p className="mt-1">SĐT: {lead.phone}</p>
            <p className="mt-1">Hành động tiếp theo: {lead.nextAction || 'Chưa có'}</p>
          </div>
          {lead.aiSuggestion && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs font-medium kháching-5 text-indigo-900">
              <Bot className="mb-1 h-4 w-4 text-indigo-500" /> {lead.aiSuggestion}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 border-t border-slate-200 bg-white p-4 sm:flex-row">
          <Link href="/team-inbox" className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-700">
            Mở team inbox
          </Link>
          <Link href="/approval-queue" className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-700 hover:bg-slate-50">
            Mở Hàng chờ duyệt
          </Link>
        </div>
      </div>
    </div>
  );
}

function getRiskColor(risk: LeadRisk) {
  switch (risk) {
    case 'NÓNG': return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'ẤM': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'QUÁ HẠN': return 'bg-red-100 text-red-700 border-red-200';
    case 'CẦN HANDOFF': return 'bg-purple-100 text-purple-700 border-purple-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

function getStudentRiskColor(risk: StudentRiskLevel) {
  switch (risk) {
    case 'Khiếu nại/Cần handoff': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Nguy cơ nghỉ cao': return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'Cần chú ý': return 'bg-amber-100 text-amber-700 border-amber-200';
    default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
}
