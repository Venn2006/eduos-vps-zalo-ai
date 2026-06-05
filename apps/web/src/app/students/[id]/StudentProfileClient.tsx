"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Phone, Mail, MapPin, Calendar, CheckCircle2, XCircle, 
  Clock, AlertTriangle, ShieldCheck, FileText, Send, MessageSquare
} from 'lucide-react';
import { addProgressNote } from '../../actions/students';
import { toast } from 'sonner';

interface StudentProfileClientProps {
  student: any;
}

export default function StudentProfileClient({ student }: StudentProfileClientProps) {
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate unified timeline
  const timelineEvents: any[] = [];

  // 1. Add Attendances
  student.attendances?.forEach((att: any) => {
    timelineEvents.push({
      id: `att_${att.id}`,
      type: 'ATTENDANCE',
      date: new Date(att.session.startTime),
      title: 'Điểm danh',
      description: `Lớp ${att.session.class.classCode} (${new Date(att.session.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})} - ${new Date(att.session.endTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})})`,
      status: att.status
    });
  });

  // 2. Add Homework
  student.homeworkSubmissions?.forEach((hw: any) => {
    timelineEvents.push({
      id: `hw_${hw.id}`,
      type: 'HOMEWORK',
      date: new Date(hw.submittedAt || hw.createdAt),
      title: 'Bài tập về nhà',
      description: hw.homework.title,
      status: hw.status,
      score: hw.score
    });
  });

  // 3. Add Notes
  student.progressNotes?.forEach((note: any) => {
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

  // Calculate Churn Risk
  let absentCount = 0;
  student.attendances?.forEach((att: any) => {
    if (att.status === 'ABSENT') absentCount++;
  });

  let riskLevel = 'LOW';
  if (absentCount >= 2) riskLevel = 'HIGH';
  else if (absentCount === 1) riskLevel = 'MEDIUM';

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    try {
      await addProgressNote(student.id, newNote);
      toast.success('Đã thêm ghi chú thành công');
      setNewNote('');
    } catch (e) {
      toast.error('Có lỗi xảy ra khi thêm ghi chú');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link href="/students" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại danh sách
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT PANEL: Student 360 & Contact */}
        <div className="space-y-6">
          
          {/* Profile Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <div className="relative pt-8 text-center">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-white mx-auto overflow-hidden shadow-sm flex items-center justify-center">
                <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-3xl font-black text-indigo-700">
                  {student.name.charAt(0)}
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-4">{student.name}</h1>
              <p className="text-slate-500 font-medium">Học viên EduOS</p>
            </div>

            <div className="mt-8 space-y-4 text-sm">
              <div className="flex items-center text-slate-600">
                <Phone className="w-4 h-4 mr-3 text-slate-400" />
                {student.phone || 'Chưa cập nhật SĐT'}
              </div>
              <div className="flex items-center text-slate-600">
                <Calendar className="w-4 h-4 mr-3 text-slate-400" />
                Ngày sinh: {student.dob ? new Date(student.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
              </div>
            </div>
          </div>

          {/* AI Churn Risk Gauge */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> AI Dự báo Nghỉ học
            </h2>
            
            {riskLevel === 'HIGH' && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-rose-700 font-bold mb-2 text-lg">
                  <AlertTriangle className="w-5 h-5" /> Nguy cơ Rất Cao (75%)
                </div>
                <p className="text-sm text-rose-600 font-medium">Học viên đã vắng mặt nhiều buổi liên tiếp gần đây. Cần giáo viên hoặc CSKH liên hệ phụ huynh khẩn cấp!</p>
              </div>
            )}
            {riskLevel === 'MEDIUM' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-700 font-bold mb-2 text-lg">
                  <AlertTriangle className="w-5 h-5" /> Nguy cơ Trung Bình (30%)
                </div>
                <p className="text-sm text-amber-600 font-medium">Học viên có 1 buổi vắng mặt gần đây. Cần theo dõi thêm.</p>
              </div>
            )}
            {riskLevel === 'LOW' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2 text-lg">
                  <ShieldCheck className="w-5 h-5" /> Chuyên cần Tốt
                </div>
                <p className="text-sm text-emerald-600 font-medium">Học viên đang theo học đầy đủ, không có dấu hiệu rủi ro. Có thể tư vấn gia hạn khoá tiếp theo.</p>
              </div>
            )}
          </div>

          {/* Guardian Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Thông tin Phụ huynh</h2>
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

        {/* RIGHT PANEL: Unified Learning Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Add Note Box */}
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

          {/* The Timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Nhật ký 360 Độ</h2>
            
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
              {timelineEvents.length === 0 ? (
                <div className="pl-6 text-slate-500 italic text-sm">Chưa có hoạt động nào.</div>
              ) : timelineEvents.map((event, index) => (
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
                             event.status === 'EXCUSED' ? 'Vắng (Có phép)' : 'Vắng (Không phép)'}
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
