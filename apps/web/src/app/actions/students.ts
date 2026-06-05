"use server";

import { prisma } from '@eduos/db';
import { getCurrentTenantOrThrow } from '@/lib/auth';
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
    let missedHomework = 0;
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

  const student = await prisma.student.findUnique({
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
  const tenantId = await getCurrentTenantOrThrow();

  await prisma.studentProgressNote.create({
    data: {
      tenantId,
      studentId,
      note
    }
  });

  revalidatePath(`/students/${studentId}`);
  revalidatePath(`/students`);
}
