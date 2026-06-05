"use client";

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Filter, 
  MessageSquare, 
  Phone, 
  ShieldAlert, 
  UserSquare2, 
  ChevronRight, 
  X,
  Play,
  UserPlus,
  Edit3,
  Bot,
  AlertCircle
} from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  taskManagementDemoTasks, 
  taskManagementDemoStats, 
  taskManagementDemoStaff,
  TaskItem,
  TaskStatus
} from '@/lib/taskManagementDemoData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function TaskManagementClient() {
  const [tasks, setTasks] = useState<TaskItem[]>(taskManagementDemoTasks);
  const [filter, setFilter] = useState('ALL');
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  const getFilteredTasks = () => {
    switch (filter) {
      case 'TODAY': return tasks.filter(t => t.dueTime.includes('Hôm nay'));
      case 'OVERDUE': return tasks.filter(t => t.status === 'OVERDUE');
      case 'WAITING': return tasks.filter(t => t.status === 'WAITING_APPROVAL');
      case 'ZALO': return tasks.filter(t => t.channel === 'Zalo');
      case 'FINANCE': return tasks.filter(t => t.tags.includes('Học phí'));
      case 'ACADEMIC': return tasks.filter(t => t.tags.includes('Báo cáo tháng'));
      default: return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  const handleTaskAction = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const columns: { id: TaskStatus, label: string, color: string }[] = [
    { id: 'NEW', label: 'Mới', color: 'border-blue-200 bg-blue-50/50' },
    { id: 'IN_PROGRESS', label: 'Đang xử lý', color: 'border-amber-200 bg-amber-50/50' },
    { id: 'WAITING_APPROVAL', label: 'Chờ duyệt', color: 'border-purple-200 bg-purple-50/50' },
    { id: 'OVERDUE', label: 'Quá hạn', color: 'border-rose-200 bg-rose-50/50' },
    { id: 'DONE_DEMO', label: 'Hoàn tất demo', color: 'border-emerald-200 bg-emerald-50/50' },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-6 relative h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Giao việc</h1>
          <p className="text-slate-500 mt-1">Theo dõi công việc nhân viên, deadline, khách liên quan và trạng thái duyệt trong một nơi.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status="warning" label="Demo: chưa gửi thật" />
          <StatusBadge status="info" label="Local state only" />
          <StatusBadge status="primary" label="AI chỉ gợi ý" showDot={false} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricCard title="Tổng việc hôm nay" value={taskManagementDemoStats.totalToday} icon={<Calendar className="w-6 h-6" />} color="primary" />
        <MetricCard title="Quá hạn" value={taskManagementDemoStats.overdue} icon={<AlertCircle className="w-6 h-6" />} color="danger" />
        <MetricCard title="Đang xử lý" value={taskManagementDemoStats.inProgress} icon={<Clock className="w-6 h-6" />} color="warning" />
        <MetricCard title="Chờ duyệt" value={taskManagementDemoStats.waitingApproval} icon={<ShieldAlert className="w-6 h-6" />} color="info" />
        <MetricCard title="Hoàn tất demo" value={taskManagementDemoStats.doneDemo} icon={<CheckCircle2 className="w-6 h-6" />} color="success" />
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* Kanban & Filters */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap">
            <Filter className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'TODAY', label: 'Việc hôm nay' },
              { id: 'OVERDUE', label: 'Quá hạn' },
              { id: 'WAITING', label: 'Chờ duyệt' },
              { id: 'ZALO', label: 'Zalo/Inbox' },
              { id: 'FINANCE', label: 'Tài chính' },
              { id: 'ACADEMIC', label: 'Học vụ' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                  filter === f.id 
                    ? "bg-slate-900 text-white" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
            <div className="flex gap-4 h-full min-w-max">
              {columns.map(col => (
                <div key={col.id} className={cn("w-72 flex flex-col rounded-xl border", col.color)}>
                  <div className="p-3 font-semibold text-slate-700 border-b border-slate-200/50 flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-t-xl">
                    {col.label}
                    <span className="bg-white text-slate-500 text-xs px-2 py-0.5 rounded-full shadow-sm">
                      {filteredTasks.filter(t => t.status === col.id).length}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {filteredTasks.filter(t => t.status === col.id).map(task => (
                      <div 
                        key={task.id} 
                        onClick={() => setSelectedTask(task)}
                        className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold text-slate-500">{task.id}</span>
                          <StatusBadge 
                            status={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'neutral'} 
                            label={task.priority} 
                            showDot={false} 
                          />
                        </div>
                        <h4 className="font-semibold text-slate-900 text-sm mb-1 leading-snug group-hover:text-primary transition-colors">{task.title}</h4>
                        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {task.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md border border-slate-200">{tag}</span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2 mt-2">
                          <div className="flex items-center gap-1.5 truncate">
                            <UserSquare2 className="w-3.5 h-3.5" />
                            <span className="truncate">{task.ownerName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{task.dueTime.split(',')[0]}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staff Workload Panel */}
        <div className="w-full lg:w-80 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <UserSquare2 className="w-5 h-5 text-primary" />
              Tiến độ nhân viên
            </h3>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {taskManagementDemoStaff.map(staff => (
              <div key={staff.id} className="border border-slate-100 rounded-xl p-3 hover:border-slate-300 transition-colors bg-slate-50/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                      {staff.name}
                      <span className={cn("w-2 h-2 rounded-full", staff.onlineStatus === 'Online' ? 'bg-emerald-500' : 'bg-slate-400')}></span>
                    </h4>
                    <p className="text-xs text-slate-500">{staff.role}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700 bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-200">
                      {staff.activeTasks} việc
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1.5 mt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Quá hạn:</span>
                    <span className={cn("font-semibold", staff.overdueTasks > 0 ? "text-rose-600" : "text-slate-700")}>{staff.overdueTasks}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Inbox:</span>
                    <span className="font-medium text-slate-700">{staff.inboxWorkload}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-slate-200/60 pt-1.5 mt-1.5">
                    <span className="text-slate-500">Đang làm:</span>
                    <span className="font-medium text-slate-700 text-right truncate w-32">{staff.nextAction}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Task Detail Drawer */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setSelectedTask(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
            
            <div className="p-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <div className="flex gap-2 mb-2">
                  <StatusBadge status="primary" label={selectedTask.id} showDot={false} />
                  <StatusBadge status={selectedTask.status === 'DONE_DEMO' ? 'success' : 'warning'} label={selectedTask.status} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">{selectedTask.title}</h2>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-2 bg-white hover:bg-slate-100 rounded-full text-slate-500 transition-colors shadow-sm border border-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Phụ trách</p>
                  <p className="font-medium text-slate-900 text-sm flex items-center gap-1.5">
                    <UserSquare2 className="w-4 h-4 text-slate-400" />
                    {selectedTask.ownerName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Hạn chót</p>
                  <p className="font-medium text-rose-600 text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {selectedTask.dueTime}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-semibold">Khách hàng liên quan</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{selectedTask.relatedPerson}</p>
                    <p className="text-xs text-slate-500">{selectedTask.relatedType}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedTask.maskedPhone}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900 mb-2">Mô tả công việc</p>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">{selectedTask.description}</p>
              </div>

              {selectedTask.notes && (
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-500" />
                    Ghi chú nội bộ
                  </p>
                  <p className="text-sm text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-100">{selectedTask.notes}</p>
                </div>
              )}

              {selectedTask.suggestedDraft && (
                <div className="bg-fuchsia-50 rounded-xl p-4 border border-fuchsia-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 bg-white/50 rounded-bl-xl">
                    <Bot className="w-4 h-4 text-fuchsia-500" />
                  </div>
                  <p className="text-xs text-fuchsia-600 mb-2 uppercase tracking-wider font-semibold">AI Gợi ý phản hồi</p>
                  <p className="text-sm text-fuchsia-900 italic">"{selectedTask.suggestedDraft}"</p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-slate-900 mb-3">Lịch sử (Timeline)</p>
                <div className="space-y-4">
                  {selectedTask.timeline.map((event, idx) => (
                    <div key={idx} className="flex gap-3 relative">
                      {idx !== selectedTask.timeline.length - 1 && (
                        <div className="absolute top-6 bottom-[-16px] left-[7px] w-0.5 bg-slate-200"></div>
                      )}
                      <div className="w-4 h-4 rounded-full border-2 border-primary bg-white shrink-0 mt-0.5 relative z-10"></div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{event.text}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 bg-white space-y-3">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleTaskAction(selectedTask.id, 'IN_PROGRESS')}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Bắt đầu làm
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Chuyển người
                </Button>
              </div>
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleTaskAction(selectedTask.id, 'DONE_DEMO')}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Hoàn tất (Demo)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
