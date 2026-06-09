"use client";

import React, { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Calendar, CheckCircle2, Clock, Filter, Phone, Plus, RotateCcw, Send, UserSquare2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatVietnamDateTime } from '@/lib/date-format';
import { cn } from '@/lib/utils';
import { createManualFollowUpTask, setFollowUpTaskCompleted } from '../actions/tasks';

export type TaskListItem = {
  id: string;
  leadId: string;
  leadName: string;
  parentName?: string | null;
  phone?: string | null;
  leadStage: string;
  leadTemperature: string;
  assignedTo?: string | null;
  assignedName: string;
  dueDate: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TaskAssignee = {
  id: string;
  label: string;
  role: string;
};

export type LeadPickerItem = {
  id: string;
  name: string;
  parentName?: string | null;
  phone?: string | null;
  stage: string;
  assignedToId?: string | null;
};

type TaskBucket = 'ALL' | 'OPEN' | 'TODAY' | 'OVERDUE' | 'DONE';
type TaskColumn = 'OVERDUE' | 'OPEN' | 'DONE';

type CreateTaskForm = {
  description: string;
  assignedTo: string;
  dueDate: string;
  leadId: string;
};

export function TaskManagementClient({
  initialTasks,
  assignees,
  leads,
  currentUserId
}: {
  initialTasks: TaskListItem[];
  assignees: TaskAssignee[];
  leads: LeadPickerItem[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<TaskBucket>('OPEN');
  const [selectedTask, setSelectedTask] = useState<TaskListItem | null>(null);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateTaskForm>(() => ({
    description: '',
    assignedTo: currentUserId || assignees[0]?.id || '',
    dueDate: defaultDeadlineValue(),
    leadId: leads[0]?.id || ''
  }));
  const [isPending, startTransition] = useTransition();
  const isCreating = pendingTaskId === 'CREATE';

  const now = useMemo(() => new Date(), []);
  const assigneeById = useMemo(() => new Map(assignees.map((assignee) => [assignee.id, assignee.label])), [assignees]);
  const leadById = useMemo(() => new Map(leads.map((lead) => [lead.id, lead])), [leads]);

  const stats = useMemo(() => {
    const open = tasks.filter((task) => !task.isCompleted);
    return {
      total: tasks.length,
      open: open.length,
      today: open.filter((task) => isSameDay(new Date(task.dueDate), now)).length,
      overdue: open.filter((task) => new Date(task.dueDate) < now).length,
      done: tasks.filter((task) => task.isCompleted).length
    };
  }, [tasks, now]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      if (filter === 'OPEN') return !task.isCompleted;
      if (filter === 'TODAY') return !task.isCompleted && isSameDay(dueDate, now);
      if (filter === 'OVERDUE') return !task.isCompleted && dueDate < now;
      if (filter === 'DONE') return task.isCompleted;
      return true;
    });
  }, [filter, now, tasks]);

  const columns = [
    { id: 'OVERDUE' as const, label: 'Quá hạn', color: 'border-rose-200 bg-rose-50/70' },
    { id: 'OPEN' as const, label: 'Đang làm', color: 'border-blue-200 bg-blue-50/70' },
    { id: 'DONE' as const, label: 'Hoàn thành', color: 'border-emerald-200 bg-emerald-50/70' }
  ];

  const getColumnTasks = (columnId: TaskColumn) => {
    if (columnId === 'DONE') return filteredTasks.filter((task) => task.isCompleted);
    if (columnId === 'OVERDUE') return filteredTasks.filter((task) => !task.isCompleted && new Date(task.dueDate) < now);
    return filteredTasks.filter((task) => !task.isCompleted && new Date(task.dueDate) >= now);
  };

  const openCreateModal = () => {
    setCreateForm((current) => ({
      description: current.description,
      assignedTo: current.assignedTo || currentUserId || assignees[0]?.id || '',
      dueDate: current.dueDate || defaultDeadlineValue(),
      leadId: current.leadId || leads[0]?.id || ''
    }));
    setCreateOpen(true);
  };

  const handleLeadChange = (leadId: string) => {
    const lead = leadById.get(leadId);
    setCreateForm((current) => ({
      ...current,
      leadId,
      assignedTo: lead?.assignedToId && assigneeById.has(lead.assignedToId) ? lead.assignedToId : current.assignedTo
    }));
  };

  const createTask = () => {
    setPendingTaskId('CREATE');
    startTransition(async () => {
      try {
        const createdTask = await createManualFollowUpTask(createForm);
        const taskItem: TaskListItem = {
          ...createdTask,
          assignedName: createdTask.assignedTo ? assigneeById.get(createdTask.assignedTo) || 'Chưa rõ người phụ trách' : 'Chưa giao'
        };
        setTasks((current) => [taskItem, ...current]);
        setSelectedTask(taskItem);
        setCreateOpen(false);
        setCreateForm({
          description: '',
          assignedTo: currentUserId || assignees[0]?.id || '',
          dueDate: defaultDeadlineValue(),
          leadId: leads[0]?.id || ''
        });
        toast.success('Đã giao việc mới');
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể giao việc');
      } finally {
        setPendingTaskId(null);
      }
    });
  };

  const updateTaskCompletion = (task: TaskListItem, isCompleted: boolean) => {
    setPendingTaskId(task.id);
    startTransition(async () => {
      try {
        await setFollowUpTaskCompleted(task.id, isCompleted);
        setTasks((current) => current.map((item) => item.id === task.id ? { ...item, isCompleted } : item));
        setSelectedTask((current) => current?.id === task.id ? { ...current, isCompleted } : current);
        toast.success(isCompleted ? 'Đã đánh dấu hoàn thành' : 'Đã mở lại việc');
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể cập nhật công việc');
      } finally {
        setPendingTaskId(null);
      }
    });
  };

  return (
    <div className="flex min-h-full flex-col gap-6 pb-20 lg:pb-6">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-indigo-700">Quản lý giao việc</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Giao việc cho đội ngũ</h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">Sếp giao việc, chọn người phụ trách, đặt deadline và theo dõi hoàn thành trên dữ liệu thật.</p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button onClick={openCreateModal} size="lg" className="bg-slate-950 text-white hover:bg-slate-800">
            <Plus className="mr-2 h-5 w-5" /> Giao việc mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <MetricCard title="Tổng việc" value={stats.total} icon={<Calendar className="h-6 w-6" />} color="primary" />
        <MetricCard title="Đang làm" value={stats.open} icon={<Clock className="h-6 w-6" />} color="warning" />
        <MetricCard title="Hôm nay" value={stats.today} icon={<UserSquare2 className="h-6 w-6" />} color="info" />
        <MetricCard title="Quá hạn" value={stats.overdue} icon={<AlertCircle className="h-6 w-6" />} color="danger" />
        <MetricCard title="Hoàn thành" value={stats.done} icon={<CheckCircle2 className="h-6 w-6" />} color="success" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap border-b border-slate-100 p-4">
          <Filter className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
          {[
            { id: 'OPEN' as const, label: 'Đang làm' },
            { id: 'TODAY' as const, label: 'Hôm nay' },
            { id: 'OVERDUE' as const, label: 'Quá hạn' },
            { id: 'DONE' as const, label: 'Hoàn thành' },
            { id: 'ALL' as const, label: 'Tất cả' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={cn(
                'shrink-0 rounded-md px-3 py-2 text-sm font-semibold transition-colors',
                filter === item.id ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tasks.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
            <CheckCircle2 className="mb-3 h-12 w-12 text-slate-300" />
            <h2 className="text-xl font-bold text-slate-950">Chưa có việc nào</h2>
            <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">Bấm Giao việc mới để tạo việc đầu tiên cho nhân sự.</p>
            <Button onClick={openCreateModal} className="mt-5 bg-slate-950 text-white hover:bg-slate-800">
              <Plus className="mr-2 h-4 w-4" /> Giao việc mới
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 p-4 xl:grid-cols-3">
            {columns.map((column) => {
              const columnTasks = getColumnTasks(column.id);
              return (
                <section key={column.id} className={cn('flex min-h-[360px] flex-col rounded-xl border', column.color)}>
                  <div className="flex items-center justify-between rounded-t-xl border-b border-slate-200/60 bg-white/70 px-4 py-3 font-semibold text-slate-800 backdrop-blur-sm">
                    <span>{column.label}</span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-500 shadow-sm">{columnTasks.length}</span>
                  </div>
                  <div className="flex-1 space-y-3 p-3">
                    {columnTasks.length === 0 && <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-4 text-center text-sm font-medium text-slate-400">Không có việc</div>}
                    {columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isPending={isPending && pendingTaskId === task.id}
                        onOpen={() => setSelectedTask(task)}
                        onComplete={() => updateTaskCompletion(task, true)}
                        onReopen={() => updateTaskCompletion(task, false)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {createOpen && (
        <CreateTaskModal
          form={createForm}
          leads={leads}
          assignees={assignees}
          isPending={isPending && isCreating}
          onChange={setCreateForm}
          onLeadChange={handleLeadChange}
          onClose={() => setCreateOpen(false)}
          onSubmit={createTask}
        />
      )}

      {selectedTask && (
        <TaskDrawer
          task={selectedTask}
          isPending={isPending && pendingTaskId === selectedTask.id}
          onClose={() => setSelectedTask(null)}
          onComplete={() => updateTaskCompletion(selectedTask, true)}
          onReopen={() => updateTaskCompletion(selectedTask, false)}
        />
      )}
    </div>
  );
}

function CreateTaskModal({
  form,
  leads,
  assignees,
  isPending,
  onChange,
  onLeadChange,
  onClose,
  onSubmit
}: {
  form: CreateTaskForm;
  leads: LeadPickerItem[];
  assignees: TaskAssignee[];
  isPending: boolean;
  onChange: (form: CreateTaskForm) => void;
  onLeadChange: (leadId: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const canSubmit = Boolean(form.description.trim() && form.leadId && form.assignedTo && form.dueDate && !isPending);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Đóng" className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Giao việc mới</h2>
            <p className="mt-1 text-sm text-slate-500">Chọn người phụ trách, deadline và khách liên quan.</p>
          </div>
          <button onClick={onClose} className="rounded-md border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-800">Nội dung công việc</span>
            <textarea
              value={form.description}
              onChange={(event) => onChange({ ...form, description: event.target.value })}
              placeholder="Ví dụ: Gọi lại phụ huynh để chốt lịch học thử"
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-800">Người phụ trách</span>
              <select
                value={form.assignedTo}
                onChange={(event) => onChange({ ...form, assignedTo: event.target.value })}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              >
                {assignees.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>{assignee.label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-800">Deadline</span>
              <input
                type="datetime-local"
                value={form.dueDate}
                onChange={(event) => onChange({ ...form, dueDate: event.target.value })}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-800">Khách liên quan</span>
            <select
              value={form.leadId}
              onChange={(event) => onLeadChange(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            >
              {leads.length === 0 ? <option value="">Chưa có khách trong CRM</option> : null}
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>{lead.name}{lead.phone ? ` - ${lead.phone}` : ''}</option>
              ))}
            </select>
          </label>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
            Việc được lưu vào hệ thống và người phụ trách có thể bấm Hoàn thành ngay trên bảng này.
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 p-5 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isPending}>Hủy</Button>
          <Button onClick={onSubmit} disabled={!canSubmit} className="bg-slate-950 text-white hover:bg-slate-800">
            <Send className="mr-2 h-4 w-4" /> {isPending ? 'Đang giao...' : 'Giao việc'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  isPending,
  onOpen,
  onComplete,
  onReopen
}: {
  task: TaskListItem;
  isPending: boolean;
  onOpen: () => void;
  onComplete: () => void;
  onReopen: () => void;
}) {
  const dueDate = new Date(task.dueDate);
  const overdue = !task.isCompleted && dueDate < new Date();

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <StatusBadge status={task.isCompleted ? 'success' : overdue ? 'danger' : 'warning'} label={task.isCompleted ? 'Hoàn thành' : overdue ? 'Quá hạn' : 'Đang làm'} showDot={false} />
        <button onClick={onOpen} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 transition hover:bg-slate-200">Chi tiết</button>
      </div>
      <h4 className="line-clamp-2 text-base font-bold leading-snug text-slate-950">{task.description}</h4>
      <p className="mt-2 truncate text-sm font-medium text-slate-600">Khách: {task.leadName}</p>
      <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 text-sm text-slate-600">
        <div className="flex min-w-0 items-center gap-2">
          <UserSquare2 className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate font-semibold">{task.assignedName}</span>
        </div>
        <div className={cn('flex items-center gap-2 font-semibold', overdue ? 'text-rose-600' : 'text-slate-700')}>
          <Clock className="h-4 w-4 shrink-0" />
          <span>{formatDeadline(dueDate)}</span>
        </div>
      </div>
      <div className="mt-3">
        {task.isCompleted ? (
          <Button onClick={onReopen} disabled={isPending} variant="outline" size="sm" className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" /> {isPending ? 'Đang mở lại...' : 'Mở lại'}
          </Button>
        ) : (
          <Button onClick={onComplete} disabled={isPending} size="sm" className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
            <CheckCircle2 className="mr-2 h-4 w-4" /> {isPending ? 'Đang lưu...' : 'Hoàn thành'}
          </Button>
        )}
      </div>
    </article>
  );
}

function TaskDrawer({ task, isPending, onClose, onComplete, onReopen }: { task: TaskListItem; isPending: boolean; onClose: () => void; onComplete: () => void; onReopen: () => void }) {
  const dueDate = new Date(task.dueDate);
  const overdue = !task.isCompleted && dueDate < new Date();

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Đóng" className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/80 p-4">
          <div>
            <div className="mb-2 flex gap-2">
              <StatusBadge status={task.isCompleted ? 'success' : overdue ? 'danger' : 'warning'} label={task.isCompleted ? 'Hoàn thành' : overdue ? 'Quá hạn' : 'Đang làm'} />
            </div>
            <h2 className="text-lg font-bold leading-tight text-slate-950">{task.description}</h2>
          </div>
          <button onClick={onClose} className="rounded-md border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-colors hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-4">
            <Info label="Phụ trách" value={task.assignedName} />
            <Info label="Deadline" value={formatVietnamDateTime(dueDate)} danger={overdue} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Khách liên quan</p>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-950">{task.leadName}</p>
                <p className="text-xs text-slate-500">{task.parentName || 'Chưa có phụ huynh'} - {stageLabel(task.leadStage)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-600 shadow-sm">
                <Phone className="h-3.5 w-3.5" />
                {task.phone || 'Chưa có SĐT'}
              </div>
            </div>
            <Link href="/leads" className="mt-3 inline-block text-xs font-bold text-indigo-700 hover:text-indigo-800">Mở danh sách khách</Link>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-950">Nội dung công việc</p>
            <p className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm leading-6 text-slate-600">{task.description}</p>
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-100 bg-white p-4">
          {task.isCompleted ? (
            <Button onClick={onReopen} disabled={isPending} variant="outline" className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" /> {isPending ? 'Đang mở lại...' : 'Mở lại việc'}
            </Button>
          ) : (
            <Button onClick={onComplete} disabled={isPending} className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
              <CheckCircle2 className="mr-2 h-4 w-4" /> {isPending ? 'Đang lưu...' : 'Đánh dấu hoàn thành'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div>
      <p className="mb-1 text-xs text-slate-500">{label}</p>
      <p className={cn('text-sm font-semibold', danger ? 'text-rose-600' : 'text-slate-950')}>{value}</p>
    </div>
  );
}

function isSameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function defaultDeadlineValue() {
  const date = new Date(Date.now() + 2 * 60 * 60 * 1000);
  date.setMinutes(Math.ceil(date.getMinutes() / 5) * 5, 0, 0);
  return toDatetimeLocalValue(date);
}

function toDatetimeLocalValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDeadline(date: Date) {
  return formatVietnamDateTime(date, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function stageLabel(stage: string) {
  const labels: Record<string, string> = {
    NEW: 'Mới',
    NO_ANSWER: 'Chưa nghe máy',
    CALLBACK: 'Hẹn gọi lại',
    INTERESTED: 'Quan tâm',
    POTENTIAL: 'Tiềm năng',
    WAITING_TRIAL: 'Chờ học thử',
    TRIALING: 'Đang học thử',
    TRIALED: 'Đã học thử',
    WAITING_TEST: 'Chờ kiểm tra',
    TESTED: 'Đã kiểm tra',
    REGISTERED: 'Đã đăng ký',
    NOT_POTENTIAL: 'Không tiềm năng',
    NO_NEED: 'Chưa có nhu cầu'
  };

  return labels[stage] || stage;
}
