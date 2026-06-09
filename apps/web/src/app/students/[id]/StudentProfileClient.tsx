"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Phone, Mail, Calendar, Clock, AlertTriangle, ShieldCheck, FileText, Send, MessageSquare, GraduationCap
} from 'lucide-react';
import { addProgressNote, assignStudentToClass } from '../../actions/students';
import { toast } from 'sonner';

type DateLike = string | Date;

interface StudentProfile {
  id: string;
  name: string;
  phone?: string | null;
  dob?: DateLike | null;
  guardian?: {
    name: string;
    phone?: string | null;
    email?: string | null;
  } | null;
  attendances?: Array<{
    id: string;
    status: string;
    session: {
      startTime: DateLike;
      endTime: DateLike;
      class: { classCode: string };
    };
  }>;
  homeworkSubmissions?: Array<{
    id: string;
    submittedAt?: DateLike | null;
    createdAt?: DateLike;
    status: string;
    score?: number | null;
    homework: { title: string; dueAt?: DateLike };
  }>;
  progressNotes?: Array<{
    id: string;
    createdAt: DateLike;
    note: string;
  }>;
  enrollments?: Array<{
    id: string;
    status: string;
    class: { id: string; classCode: string };
  }>;
}

interface TimelineEvent {
  id: string;
  type: 'ATTENDANCE' | 'HOMEWORK' | 'NOTE';
  date: Date;
  title: string;
  description: string;
  status?: string;
  score?: number | null;
}

interface StudentProfileClientProps {
  student: StudentProfile;
  availableClasses: Array<{ id: string; classCode: string; status: string }>;
}

export default function StudentProfileClient({ student, availableClasses }: StudentProfileClientProps) {
  const router = useRouter();
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [isAssigningClass, setIsAssigningClass] = useState(false);

  // Build the learning timeline shown on the student profile.
  const timelineEvents: TimelineEvent[] = [];

  // Add attendances.
  student.attendances?.forEach((att) => {
    timelineEvents.push({
      id: `att_${att.id}`,
      type: 'ATTENDANCE',
      date: new Date(att.session.startTime),
      title: 'Điểm danh',
      description: `Lớp ${att.session.class.classCode} (${new Date(att.session.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})} - ${new Date(att.session.endTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})})`,
      status: att.status
    });
  });

  // Add homework submissions.
  student.homeworkSubmissions?.forEach((hw) => {
    timelineEvents.push({
      id: `hw_${hw.id}`,
      type: 'HOMEWORK',
      date: new Date(hw.submittedAt || hw.createdAt || hw.homework.dueAt || 0),
      title: 'Bài tập về nhà',
      description: hw.homework.title,
      status: hw.status,
      score: hw.score
    });
  });

  // Add teacher notes.
  student.progressNotes?.forEach((note) => {
    timelineEvents.push({
      id: `note_${note.id}`,
      type: 'NOTE',
      date: new Date(note.createdAt),
      title: 'Ghi chú giáo viên',
      description: note.note
    });
  });

  // Sort timeline newest first
  timelineEvents.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Calculate absence risk from recent attendance.
  let absentCount = 0;
  student.attendances?.forEach((att) => {
    if (att.status === 'ABSENT') absentCount++;
  });

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (absentCount >= 2) riskLevel = 'HIGH';
  else if (absentCount === 1) riskLevel = 'MEDIUM';

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    try {
      await addProgressNote(student.id, newNote);
      toast.success('Đã thêm ghi chú thành công');
      setNewNote('');
      router.refresh();
    } catch {
      toast.error('Có lỗi xảy ra khi thêm ghi chú');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignClass = async () => {
    if (!selectedClassId) {
      toast.error('Vui lòng chọn lớp');
      return;
    }

    setIsAssigningClass(true);
    try {
      await assignStudentToClass(student.id, selectedClassId);
      toast.success('Đã xếp lớp cho học viên');
      setSelectedClassId('');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xếp lớp cho học viên');
    } finally {
      setIsAssigningClass(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link href="/students" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại danh sách
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left panel: profile and contact */}
        <div className="space-y-6">
          
          {/* Profile card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <div className="relative pt-8 text-center">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-white mx-auto overflow-hidden shadow-sm flex items-center justify-center">
                <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-3xl font-black text-indigo-700">
                  {student.name.charAt(0)}
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-4">{student.name}</h1>
              <p className="text-slate-500 font-medium">Học viên</p>
            </div>

            <div className="mt-8 space-y-4 text-sm">
              <div className="flex items-center text-slate-600">
                <Phone className="w-4 h-4 mr-3 text-slate-400" />
                {student.phone || 'Chưa cập nhật số điện thoại'}
              </div>
              <div className="flex items-center text-slate-600">
                <Calendar className="w-4 h-4 mr-3 text-slate-400" />
                Ngày sinh: {student.dob ? new Date(student.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Lớp đang học
            </h2>

            {student.enrollments && student.enrollments.length > 0 ? (
              <div className="mb-4 flex flex-wrap gap-2">
                {student.enrollments.map((enrollment) => (
                  <span key={enrollment.id} className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    {enrollment.class.classCode}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mb-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm font-medium text-slate-500">
                Học viên chưa được xếp lớp.
              </p>
            )}

            <div className="flex gap-2">
              <select
                value={selectedClassId}
                onChange={(event) => setSelectedClassId(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Chọn lớp</option>
                {availableClasses.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>{classItem.classCode}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAssignClass}
                disabled={isAssigningClass || !selectedClassId}
                className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAssigningClass ? 'Đang xếp...' : 'Xếp lớp'}
              </button>
            </div>
          </div>

          {/* Absence risk */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Cảnh báo nghỉ học
            </h2>
            
            {riskLevel === 'HIGH' && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-rose-700 font-bold mb-2 text-lg">
                  <AlertTriangle className="w-5 h-5" /> Nguy cơ rất cao
                </div>
                <p className="text-sm text-rose-600 font-medium">Học viên đã vắng mặt nhiều buổi gần đây. Cần giáo viên hoặc chăm sóc khách hàng liên hệ phụ huynh sớm.</p>
              </div>
            )}
            {riskLevel === 'MEDIUM' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-700 font-bold mb-2 text-lg">
                  <AlertTriangle className="w-5 h-5" /> Cần theo dõi
                </div>
                <p className="text-sm text-amber-600 font-medium">Học viên có 1 buổi vắng mặt gần đây. Cần theo dõi thêm.</p>
              </div>
            )}
            {riskLevel === 'LOW' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2 text-lg">
                  <ShieldCheck className="w-5 h-5" /> Chuyên cần tốt
                </div>
                <p className="text-sm text-emerald-600 font-medium">Học viên đang theo học đầy đủ, chưa có dấu hiệu rủi ro. Có thể tư vấn gia hạn khóa tiếp theo.</p>
              </div>
            )}
          </div>

          {/* Guardian info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Thông tin phụ huynh</h2>
            {student.guardian ? (
              <div className="space-y-4 text-sm">
                <div className="font-bold text-slate-900 text-base">{student.guardian.name}</div>
                <div className="flex items-center text-slate-600">
                  <Phone className="w-4 h-4 mr-3 text-slate-400" />
                  {student.guardian.phone}
                </div>
                {student.guardian.email && (
                  <div className="flex items-center text-slate-600">
                    <Mail className="w-4 h-4 mr-3 text-slate-400" />
                    {student.guardian.email}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 italic text-sm">Chưa có thông tin phụ huynh</div>
            )}
          </div>

        </div>

        {/* Right panel: learning timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Add note box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <textarea 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Thêm ghi chú học tập, thái độ trên lớp, hoặc nhận xét nhanh..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20"
                ></textarea>
                <div className="flex justify-end mt-3">
                  <button 
                    onClick={handleAddNote}
                    disabled={isSubmitting || !newNote.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Đăng ghi chú
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Nhật ký học tập</h2>
            
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
              {timelineEvents.length === 0 ? (
                <div className="pl-6 text-slate-500 italic text-sm">Chưa có hoạt động nào.</div>
              ) : timelineEvents.map((event) => (
                <div key={event.id} className="relative pl-8">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center ${
                    event.type === 'NOTE' ? 'bg-blue-500' :
                    event.type === 'HOMEWORK' ? 'bg-emerald-500' :
                    (event.status === 'PRESENT' ? 'bg-emerald-500' : event.status === 'LATE' ? 'bg-amber-500' : 'bg-rose-500')
                  }`}>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {event.type === 'NOTE' && <MessageSquare className="w-4 h-4 text-blue-500" />}
                        {event.type === 'ATTENDANCE' && <Clock className="w-4 h-4 text-indigo-500" />}
                        {event.type === 'HOMEWORK' && <FileText className="w-4 h-4 text-emerald-500" />}
                        <span className="font-bold text-slate-900">{event.title}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {event.date.toLocaleDateString('vi-VN')} {event.date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}
                      </span>
                    </div>

                    <div className="text-sm text-slate-700">
                      {event.type === 'NOTE' ? (
                        <p>{event.description}</p>
                      ) : event.type === 'ATTENDANCE' ? (
                        <div className="flex items-center gap-2">
                          <span>{event.description}</span>
                          <span className="text-slate-300">•</span>
                          <span className={`font-bold ${
                            event.status === 'PRESENT' ? 'text-emerald-600' : 
                            event.status === 'LATE' ? 'text-amber-600' : 
                            'text-rose-600'
                          }`}>
                            {event.status === 'PRESENT' ? 'Có mặt' : 
                             event.status === 'LATE' ? 'Đi trễ' : 
                             event.status === 'EXCUSED' ? 'Vắng có phép' : 'Vắng không phép'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{event.description}</span>
                          <span className="text-slate-300">•</span>
                          <span className={`font-bold ${
                            event.status === 'GRADED' ? 'text-emerald-600' : 
                            event.status === 'LATE' ? 'text-amber-600' : 
                            'text-blue-600'
                          }`}>
                            {event.status === 'GRADED' ? `Đã chấm (${event.score || 0}/10)` : 
                             event.status === 'LATE' ? 'Nộp muộn' : 
                             'Đã nộp'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
