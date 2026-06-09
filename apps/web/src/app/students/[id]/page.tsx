import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import StudentProfileClient from './StudentProfileClient';
import { getStudentProfile } from '../../actions/students';
import { notFound } from 'next/navigation';
import { prisma } from '@eduos/db';

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/students")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const [student, tenantId] = await Promise.all([
    getStudentProfile(id),
    getCurrentTenantOrThrow()
  ]);

  if (!student) {
    notFound();
  }

  const availableClasses = await prisma.class.findMany({
    where: { tenantId, status: 'ACTIVE' },
    select: { id: true, classCode: true, status: true },
    orderBy: { classCode: 'asc' }
  });

  return (
    <StudentProfileClient student={student} availableClasses={availableClasses} />
  );
}
