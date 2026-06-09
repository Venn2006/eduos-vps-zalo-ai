import React from 'react';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { TeacherWorkspaceClient } from './TeacherWorkspaceClient';
import { prisma } from '@eduos/db';

const DONE_ATTENDANCE_STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

export default async function TeacherWorkspacePage() {
  const authSession = await getSession();

  if (!canAccessRoute(authSession?.role, '/workspaces/teacher')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();

  const [classes, todaySessions, pendingGradeDrafts] = await Promise.all([
    prisma.class.findMany({
      where: { tenantId },
      include: {
        course: true,
        teacher: true,
        enrollments: { include: { student: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.classSession.findMany({
      where: {
        tenantId,
        startTime: {
          gte: startOfToday(),
          lte: endOfToday(),
        },
      },
      include: {
        class: {
          include: {
            teacher: true,
            enrollments: true,
          },
        },
        attendances: { include: { student: true } },
        homeworks: { include: { submissions: true } },
      },
      orderBy: { startTime: 'asc' },
    }),
    prisma.aiGradeDraft.findMany({
      where: { tenantId, isApproved: false },
      include: {
        submission: {
          include: {
            student: true,
            homework: {
              include: {
                class: { include: { teacher: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  const mappedClasses = classes.map((classItem) => ({
    id: classItem.id,
    classCode: classItem.classCode,
    courseName: classItem.course?.name || 'Chưa cấu hình khóa học',
    teacherName: classItem.teacher?.name || 'Chưa phân công',
    studentCount: classItem.enrollments.length,
    status: classItem.status,
  }));

  const mappedSessions = todaySessions.map((session) => {
    const expectedStudentCount = session.class.enrollments.length;
    const assignedHomeworkCount = session.homeworks.length;
    const missingSubmissionCount = session.homeworks.reduce((total, homework) => {
      return total + Math.max(expectedStudentCount - homework.submissions.length, 0);
    }, 0);
    const attendanceComplete =
      session.attendances.length > 0 &&
      session.attendances.every((attendance) => DONE_ATTENDANCE_STATUSES.includes(attendance.status));

    return {
      id: session.id,
      className: session.class.classCode,
      teacherName: session.class.teacher?.name || 'Chưa phân công',
      roomName: 'Chưa cấu hình phòng',
      startTime: session.startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      endTime: session.endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      startMs: session.startTime.getTime(),
      endMs: session.endTime.getTime(),
      studentCount: expectedStudentCount,
      attendances: session.attendances.map((attendance) => ({
        id: attendance.id,
        studentId: attendance.student.id,
        studentName: attendance.student.name,
        status: attendance.status,
      })),
      attendanceStatus: attendanceComplete
        ? 'Đủ'
        : session.attendances.length === 0
          ? 'Chưa điểm danh'
          : 'Thiếu',
      homeworkStatus:
        assignedHomeworkCount === 0 ? 'Chưa giao bài' : missingSubmissionCount > 0 ? 'Thiếu bài' : 'Đủ bài',
      assignedHomeworkCount,
      missingSubmissionCount,
    };
  });

  const mappedApprovalDrafts = pendingGradeDrafts.map((draft) => ({
    id: draft.id,
    title: draft.submission.homework.title,
    studentName: draft.submission.student.name,
    className: draft.submission.homework.class.classCode,
    teacherName: draft.submission.homework.class.teacher?.name || 'Chưa phân công',
    score: draft.score,
    createdAt: draft.createdAt.toLocaleString('vi-VN'),
    comment: draft.comment,
  }));

  return (
    <TeacherWorkspaceClient
      initialClasses={mappedClasses}
      initialSessions={mappedSessions}
      initialApprovalDrafts={mappedApprovalDrafts}
    />
  );
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
}

function endOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
}
