"use client";

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Calendar, Download, Filter, MessageSquare, Phone, Plus, Save, Search, UserCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { addCareLog, convertLeadToStudent, createLead } from '../actions/leads';

const STAGES = [
  { id: 'ALL', name: 'Tất cả', color: 'bg-slate-100 text-slate-700' },
  { id: 'NEW', name: 'Mới', color: 'bg-blue-100 text-blue-700' },
  { id: 'NO_ANSWER', name: 'Không nghe máy', color: 'bg-slate-200 text-slate-800' },
  { id: 'CALLBACK', name: 'Gọi lại sau', color: 'bg-amber-100 text-amber-700' },
  { id: 'INTERESTED', name: 'Quan tâm', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'POTENTIAL', name: 'Tiềm năng', color: 'bg-emerald-200 text-emerald-800' },
  { id: 'WAITING_TRIAL', name: 'Đợi học thử', color: 'bg-purple-100 text-purple-700' },
  { id: 'TRIALING', name: 'Đang học thử', color: 'bg-purple-200 text-purple-800' },
  { id: 'TRIALED', name: 'Đã học thử', color: 'bg-purple-300 text-purple-900' },
  { id: 'WAITING_TEST', name: 'Đợi kiểm tra', color: 'bg-orange-100 text-orange-700' },
  { id: 'TESTED', name: 'Đã kiểm tra', color: 'bg-orange-200 text-orange-800' },
  { id: 'REGISTERED', name: 'Đã đăng ký', color: 'bg-green-100 text-green-700' },
  { id: 'NOT_POTENTIAL', name: 'Không tiềm năng', color: 'bg-rose-100 text-rose-700' },
  { id: 'NO_NEED', name: 'Không có nhu cầu', color: 'bg-rose-200 text-rose-800' },
] as const;

interface LeadActivityItem {
  id: string;
  type?: string;
  notes?: string | null;
  createdAt: string | Date;
}

interface LeadRecord {
  id: string;
  stage: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  name: string;
  phone?: string | null;
  parentName?: string | null;
  branch?: string | null;
  school?: string | null;
  level?: string | null;
  source?: { name?: string | null } | null;
  activities?: LeadActivityItem[];
}

interface DisplayLead {
  id: string;
  status: string;
  date: string;
  name: string;
  phone: string;
  parent: string;
  source: string;
  raw: LeadRecord;
}

function csvCell(value: unknown) {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function LeadsCrmClient({ initialLeads = [] }: { initialLeads?: LeadRecord[] }) {
  const router = useRouter();
  const [activeStage, setActiveStage] = useState('ALL');
  const [query, setQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<DisplayLead | null>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [careNote, setCareNote] = useState('');
  const [isSavingCareNote, setIsSavingCareNote] = useState(false);
  const leads = initialLeads;

  const displayLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return leads
      .filter((lead) => activeStage === 'ALL' || lead.stage === activeStage)
      .filter((lead) => {
        if (!normalizedQuery) return true;
        return [lead.name, lead.phone, lead.parentName, lead.source?.name, lead.branch, lead.school, lead.level]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .map((lead): DisplayLead => ({
        id: lead.id,
        status: lead.stage,
        date: new Date(lead.createdAt).toLocaleDateString('vi-VN'),
        name: lead.name,
        phone: lead.phone || 'Chưa có SĐT',
        parent: lead.parentName || '',
        source: lead.source?.name || 'Tuyển sinh',
        raw: lead,
      }));
  }, [activeStage, leads, query]);

  const handleSaveStudentProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSavingProfile) return;

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('studentName') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const parentName = String(formData.get('parentName') || '').trim();
    const branch = String(formData.get('branch') || '').trim();
    const school = String(formData.get('school') || '').trim();
    const level = String(formData.get('level') || '').trim();
    const dobValue = String(formData.get('dob') || '').trim();

    if (!name || !phone) {
      toast.error('Vui lòng nhập tên học viên và số điện thoại.');
      return;
    }

    setIsSavingProfile(true);
    try {
      if (selectedLead?.raw.stage === 'REGISTERED') {
        toast.info('Khách này đã được chuyển thành học viên trước đó.');
        setShowConvertModal(false);
        return;
      }

      const lead = selectedLead
        ? selectedLead.raw
        : await createLead({
            name,
            phone,
            parentName: parentName || undefined,
            branch: branch || undefined,
            school: school || undefined,
            level: level || undefined,
            dob: dobValue ? new Date(dobValue) : undefined,
          });

      await convertLeadToStudent(lead.id);
      toast.success('Đã tạo hồ sơ học viên từ khách đã chọn.');
      setShowConvertModal(false);
      setSelectedLead(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu hồ sơ học viên.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveCareNote = async () => {
    if (!selectedLead) return;
    const note = careNote.trim();
    if (!note) {
      toast.error('Vui lòng nhập nội dung ghi chú.');
      return;
    }

    setIsSavingCareNote(true);
    try {
      await addCareLog(selectedLead.id, { type: 'NOTE', notes: note });
      toast.success('Đã lưu ghi chú chăm sóc.');
      setCareNote('');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu ghi chú.');
    } finally {
      setIsSavingCareNote(false);
    }
  };

  const exportLeadsCsv = () => {
    const rows = [
      ['name', 'phone', 'parentName', 'stage', 'source', 'branch', 'school', 'level', 'createdAt', 'activityCount'],
      ...displayLeads.map((lead) => [
        lead.name,
        lead.raw.phone || '',
        lead.raw.parentName || '',
        lead.raw.stage,
        lead.source,
        lead.raw.branch || '',
        lead.raw.school || '',
        lead.raw.level || '',
        new Date(lead.raw.createdAt).toISOString(),
        lead.raw.activities?.length || 0,
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'leads-export.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
      <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-slate-200 bg-white p-2 custom-scrollbar">
        {STAGES.map((stage) => {
          const count = stage.id === 'ALL' ? leads.length : leads.filter((lead) => lead.stage === stage.id).length;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setActiveStage(stage.id)}
              className={`flex min-w-[104px] flex-col items-center justify-center rounded-lg border-2 px-3 py-2 transition-all ${
                activeStage === stage.id ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className={`text-xl font-black ${activeStage === stage.id ? 'text-indigo-700' : 'text-slate-700'}`}>{count}</span>
              <span className="mt-1 whitespace-nowrap text-center text-xs font-medium text-slate-500">{stage.name}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white md:flex">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-3">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-700"><Filter className="h-4 w-4" /> Bộ lọc</span>
            <button type="button" onClick={() => { setQuery(''); setActiveStage('ALL'); }} className="text-xs font-semibold text-indigo-600 hover:underline">Xóa lọc</button>
          </div>
          <div className="space-y-4 p-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-slate-600">Tìm kiếm khách</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tên, SĐT, nguồn..."
                  className="w-full rounded-md border bg-slate-50 py-1.5 pl-8 pr-2.5 text-sm focus:bg-white"
                />
              </div>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
              Bộ lọc nâng cao theo chi nhánh, nguồn kênh và nhân sự sẽ mở sau khi chuẩn hóa dữ liệu nhập vào. Hiện màn hình lọc theo dữ liệu đang có.
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col bg-white">
          <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 p-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1.5 overflow-x-auto">
              <div className="inline-flex h-8 shrink-0 items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600">
                <Activity className="mr-1.5 h-3.5 w-3.5" /> {displayLeads.length} khách đang hiển thị
              </div>
            </div>
            <div className="flex gap-1.5 overflow-x-auto">
              <Button size="sm" className="h-8 shrink-0 bg-indigo-600 text-xs hover:bg-indigo-700" onClick={() => { setSelectedLead(null); setShowConvertModal(true); }}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Thêm khách & tạo học viên
              </Button>
              <Button size="sm" variant="outline" className="h-8 shrink-0 border-emerald-200 bg-white text-xs text-emerald-700 hover:bg-emerald-50" onClick={exportLeadsCsv}>
                <Download className="mr-1.5 h-3.5 w-3.5" /> Xuất CSV
              </Button>
            </div>
          </div>

          <div className="relative flex-1 overflow-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 font-medium text-slate-600 shadow-sm">
                <tr>
                  <th className="w-12 border-r border-slate-200 px-4 py-2 text-center">STT</th>
                  <th className="w-16 border-r border-slate-200 px-4 py-2 text-center">Log</th>
                  <th className="border-r border-slate-200 px-4 py-2">Trạng thái</th>
                  <th className="border-r border-slate-200 px-4 py-2">Ngày tạo</th>
                  <th className="border-r border-slate-200 px-4 py-2">Tên học viên</th>
                  <th className="border-r border-slate-200 px-4 py-2">Phụ huynh</th>
                  <th className="border-r border-slate-200 px-4 py-2">Điện thoại</th>
                  <th className="px-4 py-2">Kênh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayLeads.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Không có khách phù hợp dữ liệu hiện tại.</td></tr>
                ) : (
                  displayLeads.map((lead, index) => {
                    const stageInfo = STAGES.find((stage) => stage.id === lead.status) || STAGES[0];
                    const isSelected = selectedLead?.id === lead.id;
                    return (
                      <tr key={lead.id} onClick={() => { setSelectedLead(lead); setCareNote(''); }} className={`cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50'}`}>
                        <td className="px-4 py-2 text-center text-slate-500">{index + 1}</td>
                        <td className="px-4 py-2 text-center"><div className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">{lead.raw.activities?.length || 0}</div></td>
                        <td className="px-4 py-2"><Badge variant="outline" className={`${stageInfo.color} border-none px-2 py-0.5 text-[11px] shadow-sm`}>{stageInfo.name}</Badge></td>
                        <td className="px-4 py-2 text-slate-500">{lead.date}</td>
                        <td className="px-4 py-2 font-bold text-slate-800">{lead.name}</td>
                        <td className="px-4 py-2 text-slate-600">{lead.parent || 'Chưa có'}</td>
                        <td className="px-4 py-2 font-medium text-slate-700">{lead.phone}</td>
                        <td className="max-w-[160px] truncate px-4 py-2 text-xs text-slate-500">{lead.source}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </main>

        {selectedLead && (
          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl animate-in slide-in-from-right-8 duration-300 md:relative md:z-20 md:w-80 md:shrink-0 md:shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-indigo-50/50 p-3">
              <h3 className="flex items-center gap-2 font-bold text-indigo-900"><MessageSquare className="h-4 w-4 text-indigo-600" /> Nhật ký chăm sóc</h3>
              <button type="button" onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>
            </div>
            <div className="border-b border-slate-100 bg-white p-3">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="font-bold text-slate-800">{selectedLead.name}</div>
                  <div className="text-xs text-slate-500">PH: {selectedLead.parent || 'Chưa có'} - {selectedLead.phone}</div>
                </div>
                {selectedLead.raw.phone ? (
                  <a href={`tel:${selectedLead.raw.phone}`} className="inline-flex h-7 items-center rounded-md border border-amber-200 bg-amber-50 px-2 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100">
                    <Phone className="mr-1 h-3 w-3" /> Gọi
                  </a>
                ) : (
                  <span className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-500">
                    <Phone className="mr-1 h-3 w-3" /> Chưa có SĐT
                  </span>
                )}
              </div>
              {selectedLead.raw.stage !== 'REGISTERED' && (
                <Button size="sm" className="h-8 w-full bg-emerald-600 text-xs text-white hover:bg-emerald-700" onClick={() => setShowConvertModal(true)}>
                  <UserCheck className="mr-1.5 h-3.5 w-3.5" /> Chuyển thành học viên
                </Button>
              )}
            </div>
            <div className="border-b border-slate-200 bg-slate-50 p-3">
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Nội dung chăm sóc</label>
              <textarea
                value={careNote}
                onChange={(event) => setCareNote(event.target.value)}
                className="h-24 w-full resize-none rounded-lg border border-slate-300 bg-white p-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                placeholder="Ghi chú cuộc gọi, lịch hẹn hoặc kết quả chăm sóc..."
              />
              <div className="mt-2 flex justify-between gap-2">
                <div className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-500">
                  <Calendar className="mr-1 h-3 w-3" /> Ghi ngày hẹn vào ghi chú
                </div>
                <Button size="sm" className="h-7 bg-indigo-600 text-xs text-white hover:bg-indigo-700" onClick={handleSaveCareNote} disabled={isSavingCareNote || !careNote.trim()}>
                  {isSavingCareNote ? 'Đang lưu...' : 'Lưu ghi chú'}
                </Button>
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-4">
              {selectedLead.raw.activities?.map((activity) => (
                <div key={activity.id} className="relative border-l-2 border-indigo-100 pl-4">
                  <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white bg-indigo-500" />
                  <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm">
                    <div className="mb-1 flex justify-between"><span className="font-bold text-indigo-700">{activity.type || 'NOTE'}</span><span className="text-xs text-slate-500">{new Date(activity.createdAt).toLocaleDateString('vi-VN')}</span></div>
                    <p className="text-slate-700">{activity.notes || 'Không có nội dung ghi chú.'}</p>
                  </div>
                </div>
              ))}
              <div className="relative border-l-2 border-slate-100 pl-4">
                <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white bg-slate-300" />
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm opacity-80 shadow-sm">
                  <div className="mb-1 flex justify-between"><span className="font-bold text-slate-700">Hệ thống</span><span className="text-xs text-slate-500">{selectedLead.date}</span></div>
                  <p className="text-slate-600">Khách được thêm từ <strong>{selectedLead.source}</strong>.</p>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {showConvertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <form onSubmit={handleSaveStudentProfile} className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800"><UserCheck className="h-5 w-5 text-indigo-600" /> Khởi tạo hồ sơ học viên</h2>
              <button type="button" onClick={() => setShowConvertModal(false)} className="rounded-md border bg-white p-1 text-slate-400 shadow-sm hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-6 overflow-y-auto p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Tên học viên" name="studentName" required defaultValue={selectedLead?.name || ''} />
                <Field label="Điện thoại" name="phone" required defaultValue={selectedLead?.phone === 'Chưa có SĐT' ? '' : selectedLead?.phone || ''} />
                <Field label="Phụ huynh" name="parentName" defaultValue={selectedLead?.parent || selectedLead?.raw.parentName || ''} />
                <Field label="Chi nhánh" name="branch" defaultValue={selectedLead?.raw.branch || ''} />
                <Field label="Trường học" name="school" defaultValue={selectedLead?.raw.school || ''} />
                <Field label="Trình độ" name="level" defaultValue={selectedLead?.raw.level || ''} />
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Ngày sinh</label>
                  <input name="dob" type="date" className="w-full rounded-lg border px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 p-4">
              <Button type="button" variant="outline" onClick={() => setShowConvertModal(false)}>Hủy bỏ</Button>
              <Button type="submit" disabled={isSavingProfile} className="gap-2 bg-indigo-600 hover:bg-indigo-700"><Save className="h-4 w-4" /> {isSavingProfile ? 'Đang lưu...' : 'Lưu hồ sơ'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ defaultValue, label, name, required = false }: { defaultValue?: string; label: string; name: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-slate-700">{label} {required && <span className="text-rose-500">*</span>}</label>
      <input name={name} type="text" required={required} className="w-full rounded-lg border px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2" defaultValue={defaultValue} />
    </div>
  );
}
