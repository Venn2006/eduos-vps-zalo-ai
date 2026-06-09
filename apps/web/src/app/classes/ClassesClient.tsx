"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, Clock, CheckSquare, Plus, X, Phone, UserRound, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { formatVietnamDateTime } from '@/lib/date-format';

type DateLike = string | Date;

interface ClassAttendance {
  status: string;
}

interface ClassSessionItem {
  startTime: DateLike;
  endTime?: DateLike;
  attendances?: ClassAttendance[];
}

interface ClassEnrollmentStudent {
  id: string;
  name?: string | null;
  phone?: string | null;
  guardian?: {
    name?: string | null;
    phone?: string | null;
  } | null;
}

interface ClassEnrollment {
  id: string;
  status?: string | null;
  student: ClassEnrollmentStudent;
}

interface ClassItem {
  id: string;
  classCode: string;
  status?: string | null;
  teacher?: { name?: string | null } | null;
  automationSetting?: { classReminderEnabled?: boolean | null } | null;
  sessions?: ClassSessionItem[];
  enrollments?: ClassEnrollment[];
}

interface CourseOption {
  id: string;
  name: string;
  level?: string | null;
}

const classStatusLabel = (status?: string | null) => {
  if (status === 'ACTIVE') return 'Đang học';
  if (status === 'DRAFT') return 'Đang chuẩn bị';
  if (status === 'COMPLETED') return 'Đã kết thúc';
  if (status === 'CANCELLED') return 'Đã hủy';
  return 'Đang chuẩn bị';
};

const enrollmentStatusLabel = (status?: string | null) => {
  if (status === 'ACTIVE') return 'Đang học';
  if (status === 'PAUSED') return 'Tạm nghỉ';
  if (status === 'COMPLETED') return 'Đã hoàn thành';
  if (status === 'DROPPED') return 'Đã nghỉ';
  return 'Đang học';
};

export default function ClassesClient({ initialClasses, courses }: { initialClasses: ClassItem[]; courses: CourseOption[] }) {
  const [classes, setClasses] = useState(initialClasses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ classCode: '', courseId: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.classCode) return toast.error('Vui lòng nhập mã lớp');
    if (!formData.courseId) return toast.error('Vui lòng chọn khóa học');

    setLoading(true);
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const newClass = await res.json() as ClassItem;
        setClasses([newClass, ...classes]);
        setIsModalOpen(false);
        setFormData({ classCode: '', courseId: '' });
        toast.success('Tạo lớp thành công');
      } else {
        const payload = await res.json().catch(() => null) as { error?: string } | null;
        toast.error(payload?.error || 'Lỗi khi tạo lớp');
      }
    } catch {
      toast.error('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="Lớp học"
      description="Quản lý danh sách lớp học và chuyên cần"
      action={
        <Button onClick={() => setIsModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 font-bold">
          <Plus className="w-4 h-4 mr-2" /> Thêm lớp học
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {classes.length === 0 && (
          <div className="col-span-2 text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
            Chưa có lớp học nào. Bấm Thêm lớp học để tạo lớp mới.
          </div>
        )}
        {classes.map(cls => {
          let totalPresent = 0;
          let totalAttendances = 0;
          let nextSession: ClassSessionItem | null = null;
          const now = new Date();

          for (const session of cls.sessions || []) {
            const sessionStart = new Date(session.startTime);
            if (sessionStart > now && (!nextSession || sessionStart < new Date(nextSession.startTime))) {
              nextSession = session;
            }

            totalAttendances += (session.attendances || []).length;
            (session.attendances || []).forEach((a) => {
              if (a.status === 'PRESENT') totalPresent++;
            });
          }

          const rate = totalAttendances > 0 ? Math.round((totalPresent / totalAttendances) * 100) : null;

          return (
            <Card
              key={cls.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedClass(cls)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelectedClass(cls);
                }
              }}
              className="border-slate-200 cursor-pointer transition-colors hover:border-indigo-300 hover:bg-slate-50/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between py-4">
                <div>
                  <CardTitle className="text-xl text-indigo-700">{cls.classCode}</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">Giáo viên: {cls.teacher?.name || 'Chưa phân công'}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${cls.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                    {classStatusLabel(cls.status)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center text-slate-600">
                    <CheckSquare className="w-4 h-4 mr-2" /> Tỷ lệ chuyên cần
                  </div>
                  <div className="font-semibold text-slate-900">
                    {rate !== null ? `${rate}%` : 'Chưa có dữ liệu'}
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center text-slate-600">
                    <Clock className="w-4 h-4 mr-2" /> Ca học tiếp theo
                  </div>
                  <div className="font-semibold text-slate-900">
                    {nextSession ? formatVietnamDateTime(nextSession.startTime) : 'Trống'}
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center text-slate-600">
                    <Users className="w-4 h-4 mr-2" /> Nhắc lịch tự động
                  </div>
                  <div className="font-semibold text-slate-900">
                    {cls.automationSetting?.classReminderEnabled ?
                      <span className="text-emerald-600">Đang bật, trước giờ học 60 phút</span> :
                      <span className="text-slate-500">Đã tắt</span>
                    }
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
                  <div className="flex items-center text-slate-600">
                    <BookOpen className="w-4 h-4 mr-2" /> Danh sách học viên
                  </div>
                  <div className="font-semibold text-indigo-700">
                    {(cls.enrollments || []).length} học viên - Bấm để xem
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedClass && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedClass(null)}>
          <div
            className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-200 p-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Danh sách học viên</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{selectedClass.classCode}</h2>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  Giáo viên: {selectedClass.teacher?.name || 'Chưa phân công'}
                </p>
              </div>
              <button
                onClick={() => setSelectedClass(null)}
                className="rounded-md border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                aria-label="Đóng danh sách học viên"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 border-b border-slate-200 bg-slate-50 p-4">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Học viên</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{(selectedClass.enrollments || []).length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Chuyên cần</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{(() => {
                  let present = 0;
                  let total = 0;
                  (selectedClass.sessions || []).forEach((session) => {
                    total += (session.attendances || []).length;
                    (session.attendances || []).forEach((attendance) => {
                      if (attendance.status === 'PRESENT') present++;
                    });
                  });
                  return total > 0 ? `${Math.round((present / total) * 100)}%` : '--';
                })()}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Trạng thái</p>
                <p className="mt-1 text-sm font-black text-emerald-700">{classStatusLabel(selectedClass.status)}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {(selectedClass.enrollments || []).length === 0 ? (
                <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <UserRound className="mb-3 h-10 w-10 text-slate-300" />
                  <h3 className="text-base font-bold text-slate-900">Lớp này chưa có học viên</h3>
                  <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-slate-500">
                    Khi khách được chuyển thành học viên và ghi danh vào lớp, danh sách sẽ hiển thị ở đây.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(selectedClass.enrollments || []).map((enrollment) => {
                    const student = enrollment.student;
                    return (
                      <Link href={`/students/${student.id}`} key={enrollment.id} className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50/30">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-bold text-slate-900">{student?.name || 'Học viên chưa rõ tên'}</h3>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1">
                                <Phone className="h-3 w-3" /> {student?.phone || student?.guardian?.phone || 'Chưa có số điện thoại'}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1">
                                <Users className="h-3 w-3" /> Phụ huynh: {student?.guardian?.name || 'Chưa cập nhật'}
                              </span>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                            {enrollmentStatusLabel(enrollment.status)}
                          </span>
                        </div>
                        <div className="mt-3 text-xs font-bold text-indigo-700">Mở hồ sơ học viên</div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Tạo lớp học mới</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {courses.length === 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                  Chưa có khóa học. Cần tạo khóa học trước khi mở lớp.
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mã lớp</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Vd: IELTS-A01"
                  value={formData.classCode}
                  onChange={(e) => setFormData({...formData, classCode: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Khóa học</label>
                <select
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  disabled={courses.length === 0}
                >
                  <option value="">Chọn khóa học</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}{course.level ? ` - ${course.level}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={loading || courses.length === 0} className="w-full bg-purple-600 hover:bg-purple-700">
                {loading ? 'Đang tạo...' : 'Tạo lớp học'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}
