import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';
import { prisma } from '@eduos/db';
import { ContactsClient, type ContactRow } from './ContactsClient';

type ContactsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const { q } = await searchParams;
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, '/contacts')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();

  const [students, guardians, leads, teachers, members] = await Promise.all([
    prisma.student.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        guardian: true,
        enrollments: { include: { class: true }, where: { status: 'ACTIVE' } },
        attendances: { orderBy: { updatedAt: 'desc' }, take: 1 },
        homeworkSubmissions: { orderBy: { updatedAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    }),
    prisma.guardian.findMany({
      where: { tenantId, deletedAt: null },
      include: { students: true },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    }),
    prisma.lead.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        course: true,
        source: true,
        activities: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    }),
    prisma.teacher.findMany({
      where: { tenantId, deletedAt: null },
      include: { classes: true },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    }),
    prisma.tenantMember.findMany({
      where: { tenantId },
      include: { user: { select: { email: true } } },
    }),
  ]);

  const memberByUserId = new Map(members.map((member) => [member.userId, member.user.email]));

  const contactRows: ContactRow[] = [
    ...students.map((student): ContactRow => ({
      id: `student:${student.id}`,
      name: student.name,
      phone: student.phone || student.guardian?.phone || 'Chưa có SĐT',
      role: 'STUDENT',
      linkedEntity: student.enrollments.map((enrollment) => enrollment.class.classCode).join(', ') || 'Chưa xếp lớp',
      labels: [student.guardian ? `PH: ${student.guardian.name}` : 'Chưa gắn phụ huynh'],
      ...contactTime([student.updatedAt, student.attendances[0]?.updatedAt, student.homeworkSubmissions[0]?.updatedAt]),
      assignedStaff: 'Theo lớp học',
      source: 'Học viên',
      href: `/students/${student.id}`,
    })),
    ...guardians.map((guardian): ContactRow => ({
      id: `guardian:${guardian.id}`,
      name: guardian.name,
      phone: guardian.phone,
      role: 'GUARDIAN',
      linkedEntity: guardian.students.map((student) => student.name).join(', ') || 'Chưa gắn học viên',
      labels: [`${guardian.students.length} học viên`],
      ...contactTime([guardian.updatedAt]),
      assignedStaff: 'CSKH',
      source: 'Phụ huynh',
      href: '/guardians',
    })),
    ...leads.map((lead): ContactRow => ({
      id: `lead:${lead.id}`,
      name: lead.name,
      phone: lead.phone || 'Chưa có SĐT',
      role: 'LEAD',
      linkedEntity: lead.parentName || lead.studentName || lead.course?.name || 'Lead chưa gắn khóa',
      labels: [leadStageLabel(String(lead.stage)), leadTemperatureLabel(String(lead.temperature))].filter(Boolean),
      ...contactTime([lead.activities[0]?.createdAt, lead.updatedAt]),
      assignedStaff: lead.assignedToId ? memberByUserId.get(lead.assignedToId) || 'Chưa rõ nhân sự' : 'Chưa chia',
      source: lead.source?.name || 'Tuyển sinh',
      href: '/crm-command-center',
    })),
    ...teachers.map((teacher): ContactRow => ({
      id: `teacher:${teacher.id}`,
      name: teacher.name,
      phone: teacher.phone || 'Chưa có SĐT',
      role: 'TEACHER',
      linkedEntity: teacher.classes.map((classItem) => classItem.classCode).join(', ') || 'Chưa phân lớp',
      labels: [teacher.isActive ? 'Đang hoạt động' : 'Tạm ngưng'],
      ...contactTime([teacher.updatedAt]),
      assignedStaff: 'Academic',
      source: 'Giáo viên',
      href: '/workspaces/teacher',
    })),
  ].sort((left, right) => right.lastInteractionMs - left.lastInteractionMs);

  return (
    <div className="space-y-6 pb-10">
      <SectionHeader
        title="Danh bạ khách hàng"
        description="Tìm nhanh khách, học viên, phụ huynh và giáo viên trong trung tâm."
        action={
          <Link href="/leads" className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-white hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Thêm khách
          </Link>
        }
      />
      <ContactsClient contacts={contactRows} initialQuery={q || ''} />
      <div className="text-xs text-slate-500">
        Muốn thêm khách mới: dùng <Link href="/leads" className="font-semibold text-indigo-600 hover:text-indigo-700">mục Khách tiềm năng</Link>. Muốn thêm học viên: chuyển khách đã đăng ký thành hồ sơ học viên.
      </div>
    </div>
  );
}

function leadStageLabel(stage: string) {
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

function leadTemperatureLabel(value: string) {
  if (value === 'HOT') return 'Nóng';
  if (value === 'COLD') return 'Lạnh';
  return 'Ấm';
}

function contactTime(dates: Array<Date | null | undefined>) {
  const latest = dates.filter(Boolean).sort((left, right) => right!.getTime() - left!.getTime())[0];
  const value = latest || new Date(0);
  return {
    lastInteraction: latest ? value.toLocaleString('vi-VN') : 'Chưa có tương tác',
    lastInteractionMs: value.getTime(),
  };
}
