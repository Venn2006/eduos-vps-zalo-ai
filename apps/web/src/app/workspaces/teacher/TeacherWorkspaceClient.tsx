"use client";

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, ArrowRight, AlertTriangle, CheckCircle2, Clock, 
  Users, BookOpen, GraduationCap, LayoutDashboard, Calendar,
  CalendarX2, ClipboardList, PenTool, ExternalLink
} from 'lucide-react';
import { 
  mockSessions, 
  mockAcademicTasks, 
  mockRooms,
  mockClasses,
  MockAcademicSession,
  MockAcademicTask
} from '@/lib/academicDemoData';
import { detectScheduleConflicts, ScheduleConflict } from '@/lib/scheduleConflictDetection';
import Link from 'next/link';

function ActionCard({ 
  title, 
  metric, 
  reason, 
  severity = "info", 
  onClick 
}: { 
  title: string, 
  metric: number | string, 
  reason: string, 
  severity?: "success" | "warning" | "critical" | "info",
  onClick: () => void
}) {
  const colorMap = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    critical: "bg-rose-50 border-rose-200 text-rose-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  };

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    warning: <Clock className="w-5 h-5 text-amber-500" />,
    critical: <AlertTriangle className="w-5 h-5 text-rose-500" />,
    info: <Sparkles className="w-5 h-5 text-blue-500" />
  };

  return (
    <div 
      className={`flex flex-col p-5 rounded-xl border cursor-pointer hover:shadow-md transition-all ${colorMap[severity]} shadow-sm`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-sm tracking-tight opacity-80">{title}</h3>
        {iconMap[severity]}
      </div>
      <div className="text-3xl font-black mb-3">
        {metric}
      </div>
      <p className="text-sm opacity-75 flex-1 mb-2 leading-snug">
        {reason}
      </p>
      <div className="mt-auto pt-2 border-t border-black/5 opacity-60 text-xs font-semibold flex items-center justify-end gap-1">
        Xem chi tiết <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  );
}

function DemoBanner() {
  return (
    <div className="bg-amber-100 border border-amber-300 text-amber-800 p-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 mb-6">
      <AlertTriangle className="w-5 h-5 text-amber-600" />
      <div>
        <strong>Chế độ Sandbox:</strong> Không có tin nhắn Zalo, điểm số, hoặc báo cáo thật nào được gửi đi trong môi trường này.
      </div>
    </div>
  );
}

export function TeacherWorkspaceClient() {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'conflicts' | 'attendance' | 'approval'>('overview');

  const conflicts = useMemo(() => detectScheduleConflicts(mockSessions), []);

  const totalClasses = mockSessions.length;
  const missingAttendance = mockSessions.filter(s => s.attendanceStatus !== 'Đủ').length;
  const missingHomework = mockSessions.filter(s => s.homeworkStatus === 'Thiếu bài').length;
  const pendingApprovals = mockAcademicTasks.filter(t => t.status === 'Chờ giáo viên duyệt').length;
  const criticalConflicts = conflicts.filter(c => c.severity === 'Chặn demo').length;

  return (
    <div className="space-y-6 pb-12">
      <DemoBanner />

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex-shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 border
            ${activeTab === 'overview' 
              ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
        >
          <LayoutDashboard className="w-4 h-4" /> Tổng quan học vụ
        </button>
        <button 
          onClick={() => setActiveTab('schedule')}
          className={`flex-shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 border
            ${activeTab === 'schedule' 
              ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
        >
          <Calendar className="w-4 h-4" /> Lịch hôm nay <span className="bg-slate-100 text-slate-900 px-2 py-0.5 rounded-full text-xs">{totalClasses}</span>
        </button>
        <button 
          onClick={() => setActiveTab('conflicts')}
          className={`flex-shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 border
            ${activeTab === 'conflicts' 
              ? 'bg-rose-600 text-white border-rose-600 shadow-md' 
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-rose-50 hover:text-rose-700'}`}
        >
          <CalendarX2 className="w-4 h-4" /> Trùng lịch 
          {criticalConflicts > 0 && (
            <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full text-xs font-bold">{criticalConflicts}</span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('attendance')}
          className={`flex-shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 border
            ${activeTab === 'attendance' 
              ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
        >
          <ClipboardList className="w-4 h-4" /> Điểm danh & Báo bài
        </button>
        <button 
          onClick={() => setActiveTab('approval')}
          className={`flex-shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 border
            ${activeTab === 'approval' 
              ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
        >
          <PenTool className="w-4 h-4" /> Giáo viên cần duyệt
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 opacity-80" />
                  Học vụ & Giảng dạy hôm nay
                </h1>
                <p className="text-indigo-100 max-w-2xl text-lg mb-6 leading-relaxed">
                  Tập trung vào lớp cần điểm danh, bài tập cần chấm và học viên vắng.
                </p>
                <div className="flex flex-wrap gap-2 mt-6">
                  <Link href="/homework" className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors text-indigo-100 text-sm font-medium rounded-full border border-white/10">
                    <BookOpen className="w-4 h-4" /> Xem Module Bài tập
                  </Link>
                  <Link href="/approval-queue" className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors text-indigo-100 text-sm font-medium rounded-full border border-white/10">
                    <CheckCircle2 className="w-4 h-4" /> Hàng đợi duyệt
                  </Link>
                </div>
              </div>
            </div>

            <section>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-4 flex items-center gap-2">
                🔥 Việc cần xử lý hôm nay
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ActionCard 
                  title="Cần điểm danh"
                  metric={missingAttendance}
                  severity={missingAttendance > 0 ? "warning" : "success"}
                  reason="Có lớp chưa hoàn thành điểm danh."
                  onClick={() => setActiveTab('attendance')}
                />
                <ActionCard 
                  title="Giáo viên cần duyệt"
                  metric={pendingApprovals}
                  severity={pendingApprovals > 0 ? "warning" : "success"}
                  reason="Nhận xét AI tạo nháp đang chờ duyệt."
                  onClick={() => setActiveTab('approval')}
                />
                <ActionCard 
                  title="Trùng lịch"
                  metric={conflicts.length}
                  severity={conflicts.length > 0 ? "critical" : "success"}
                  reason="Trùng giáo viên hoặc phòng học."
                  onClick={() => setActiveTab('conflicts')}
                />
                <ActionCard 
                  title="Thiếu bài tập"
                  metric={missingHomework}
                  severity="info"
                  reason="Học viên chưa nộp bài."
                  onClick={() => setActiveTab('attendance')}
                />
              </div>
            </section>
          </div>
        )}

        {/* SCHEDULE TAB */}
        {activeTab === 'schedule' && (
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-6">📅 Lịch dạy hôm nay</h2>
            <div className="space-y-4">
              {mockSessions.map(session => (
                <div key={session.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-full sm:w-24 flex sm:block justify-between items-center sm:text-center shrink-0">
                    <div className="text-lg font-black text-slate-900">{session.startTime}</div>
                    <div className="text-sm text-slate-500 font-medium">{session.endTime}</div>
                  </div>
                  <div className="hidden sm:block w-px h-12 bg-slate-200 shrink-0"></div>
                  <div className="flex-1 w-full">
                    <h3 className="font-bold text-lg text-slate-900">{session.className}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 mt-1">
                      <span className="flex items-center gap-1 font-medium"><Users className="w-4 h-4" /> {session.studentCount} hv</span>
                      <span className="flex items-center gap-1 font-medium"><PenTool className="w-4 h-4" /> {session.teacherName}</span>
                      <span className="flex items-center gap-1 font-medium"><CheckCircle2 className="w-4 h-4" /> {session.roomName}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <button className="w-full sm:w-auto px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-sm rounded-lg border border-indigo-200 transition-colors shadow-sm">
                      Điểm danh demo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONFLICTS TAB */}
        {activeTab === 'conflicts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">⚠️ Danh sách trùng lịch</h2>
              {conflicts.length === 0 && <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">Tuyệt vời, không có trùng lịch!</span>}
            </div>

            {conflicts.map(conflict => (
              <div key={conflict.id} className={`p-6 border rounded-2xl shadow-sm bg-white ${conflict.severity === 'Chặn demo' ? 'border-rose-300' : 'border-amber-300'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {conflict.severity === 'Chặn demo' ? (
                        <span className="bg-rose-100 text-rose-800 text-xs px-2 py-0.5 rounded-full font-bold">{conflict.severity}</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">{conflict.severity}</span>
                      )}
                      <h3 className="font-black text-lg text-slate-900">{conflict.title}</h3>
                    </div>
                    <p className="text-slate-600 font-medium">{conflict.description}</p>
                  </div>
                  <button className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm rounded-lg border border-slate-300 transition-colors shadow-sm whitespace-nowrap">
                    {conflict.suggestedAction}
                  </button>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col gap-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Các ca liên quan</div>
                  {conflict.involvedSessions.map(session => (
                    <div key={session.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm text-sm">
                      <span className="font-bold text-slate-900">{session.className} <span className="text-slate-500 font-medium ml-2">({session.startTime} - {session.endTime})</span></span>
                      <span className="text-slate-600 font-medium">Giáo viên: {session.teacherName} | Phòng: {session.roomName}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-6">📋 Quản lý Điểm danh & Báo bài</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-sm font-bold text-slate-500">
                    <th className="pb-3 pr-4">Lớp / Ca học</th>
                    <th className="pb-3 px-4">Giáo viên</th>
                    <th className="pb-3 px-4">Tình trạng điểm danh</th>
                    <th className="pb-3 px-4">Bài tập về nhà</th>
                    <th className="pb-3 pl-4">Hành động</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-slate-800">
                  {mockSessions.map(session => (
                    <tr key={session.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="py-4 pr-4">
                        <div className="font-bold text-slate-900">{session.className}</div>
                        <div className="text-slate-500 text-xs mt-1">{session.startTime} - {session.endTime}</div>
                      </td>
                      <td className="py-4 px-4">{session.teacherName}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          session.attendanceStatus === 'Đủ' ? 'bg-emerald-100 text-emerald-800' :
                          session.attendanceStatus === 'Chưa điểm danh' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {session.attendanceStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          session.homeworkStatus === 'Đã giao bài' || session.homeworkStatus === 'Đã duyệt demo' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {session.homeworkStatus}
                        </span>
                      </td>
                      <td className="py-4 pl-4">
                        <button className="text-indigo-600 hover:text-indigo-800 font-bold whitespace-nowrap">
                          {session.attendanceStatus === 'Chưa điểm danh' ? 'Điểm danh demo' : 'Cập nhật demo'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* APPROVAL TAB */}
        {activeTab === 'approval' && (
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-indigo-600" />
              Công việc cần duyệt
            </h2>
            <div className="space-y-4">
              {mockAcademicTasks.map(task => (
                <div key={task.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 border rounded-xl hover:shadow-md transition-shadow gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold border border-slate-200">
                        {task.approvalMode}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                        task.status === 'Quá hạn' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        task.status === 'Chờ giáo viên duyệt' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">{task.title}</h3>
                    <p className="text-slate-600 text-sm font-medium mt-1">Lớp: {task.className} • Phụ trách: {task.owner} • {task.dueTime}</p>
                    <p className="text-slate-500 text-sm mt-1">{task.reason}</p>
                  </div>
                  <button className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-bold text-sm rounded-xl transition-colors shadow-sm w-full md:w-auto">
                    {task.suggestedAction}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
