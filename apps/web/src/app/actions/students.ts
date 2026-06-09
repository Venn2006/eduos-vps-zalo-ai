"use server";

import { createAuditLog, prisma } from '@eduos/db';
import { getCurrentTenantOrThrow, requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getStudentsList() {
  const tenantId = await getCurrentTenantOrThrow();

  const students = await prisma.student.findMany({
    where: { tenantId },
    include: {
      guardian: true,
      enrollments: {
        where: { status: 'ACTIVE' },
        include: {
          class: true
        }
      },
      attendances: {
        orderBy: { session: { startTime: 'desc' } },
        take: 5,
        include: { session: true }
      },
      homeworkSubmissions: {
        orderBy: { submittedAt: 'desc' },
        take: 5
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate Churn Risk on the fly
  return students.map(student => {
    let absentCount = 0;
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let riskReason = '';

    // Check recent attendances for absences
    for (const att of student.attendances) {
      if (att.status === 'ABSENT') {
        absentCount++;
      }
    }

    // Removed homework heuristic for Pilot

    if (absentCount >= 2) {
      riskLevel = 'HIGH';
      riskReason = `Học viên đã vắng mặt ${absentCount} buổi gần đây.`;
    } else if (absentCount === 1) {
      riskLevel = 'MEDIUM';
      riskReason = 'Học viên vắng mặt 1 buổi gần đây.';
    } else {
      riskLevel = 'LOW';
      riskReason = 'Chuyên cần tốt, không có dấu hiệu rủi ro.';
    }

    return {
      id: student.id,
      name: student.name,
      phone: student.phone,
      guardianName: student.guardian?.name || 'Chưa cập nhật',
      guardianPhone: student.guardian?.phone || 'Chưa cập nhật',
      enrolledClasses: student.enrollments.map(e => e.class.classCode).join(', ') || 'Chưa xếp lớp',
      riskLevel,
      riskReason
    };
  });
}

export async function getStudentProfile(studentId: string) {
  const tenantId = await getCurrentTenantOrThrow();

  const student = await prisma.student.findFirst({
    where: { id: studentId, tenantId },
    include: {
      guardian: true,
      enrollments: {
        include: {
          class: true
        }
      },
      attendances: {
        include: {
          session: {
            include: { class: true }
          }
        },
        orderBy: { session: { startTime: 'desc' } }
      },
      homeworkSubmissions: {
        include: {
          homework: true
        },
        orderBy: { submittedAt: 'desc' }
      },
      progressNotes: {
        orderBy: { createdAt: 'desc' },
        include: {
          // If we had a creator relation, we'd include it here.
        }
      }
    }
  });

  return student;
}

export async function addProgressNote(studentId: string, note: string) {
  const session = await requireRole(['OWNER', 'ADMIN', 'TEACHER']);
  const tenantId = session.activeTenantId;

  const student = await prisma.student.findFirst({ where: { id: studentId, tenantId }, select: { id: true } });
  if (!student) throw new Error('Student not found');

  const progressNote = await prisma.studentProgressNote.create({
    data: {
      tenantId,
      studentId,
      note
    }
  });

  await createAuditLog(prisma, {
    tenantId,
    actorId: session.userId,
    action: 'STUDENT_PROGRESS_NOTE_CREATED',
    entityType: 'StudentProgressNote',
    entityId: progressNote.id,
    afterJson: { studentId, noteLength: note.length },
    metadataJson: { source: 'student_action' },
  });

  revalidatePath(`/students/${studentId}`);
  revalidatePath(`/students`);
}

export async function assignStudentToClass(studentId: string, classId: string) {
  const session = await requireRole(['OWNER', 'ADMIN', 'SALE']);
  const tenantId = session.activeTenantId;

  const [student, classRecord] = await Promise.all([
    prisma.student.findFirst({ where: { id: studentId, tenantId }, select: { id: true, name: true } }),
    prisma.class.findFirst({ where: { id: classId, tenantId }, select: { id: true, classCode: true } })
  ]);

  if (!student) throw new Error('Student not found');
  if (!classRecord) throw new Error('Class not found');

  const enrollment = await prisma.enrollment.upsert({
    where: {
      tenantId_studentId_classId: {
        tenantId,
        studentId,
        classId
      }
    },
    update: { status: 'ACTIVE' },
    create: {
      tenantId,
      studentId,
      classId,
      status: 'ACTIVE'
    }
  });

  await createAuditLog(prisma, {
    tenantId,
    actorId: session.userId,
    action: 'STUDENT_ASSIGNED_TO_CLASS',
    entityType: 'Enrollment',
    entityId: enrollment.id,
    afterJson: { studentId, studentName: student.name, classId, classCode: classRecord.classCode },
    metadataJson: { source: 'student_action' },
  });

  revalidatePath(`/students/${studentId}`);
  revalidatePath('/students');
  revalidatePath('/classes');

  return enrollment;
}
