import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { prisma } from '@eduos/db';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import ClassesClient from './ClassesClient';
import { PageGuidanceBanner } from '@/components/ui/PageGuidanceBanner';
export default async function ClassesPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/classes")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();

  const classes = await prisma.class.findMany({
    where: { tenantId },
    include: {
      teacher: true,
      automationSetting: true,
      sessions: {
        include: { attendances: true }
      },
      enrollments: {
        where: { status: 'ACTIVE' },
        include: {
          student: {
            include: { guardian: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const courses = await prisma.course.findMany({
    where: { tenantId, deletedAt: null },
    select: { id: true, name: true, level: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6 pb-10">
      <PageGuidanceBanner
        title="Lớp học"
        description="Bấm vào từng lớp để xem danh sách học viên, giáo viên phụ trách, chuyên cần và lịch học sắp tới."
      />
      <ClassesClient initialClasses={classes} courses={courses} />
    </div>
  );
}
