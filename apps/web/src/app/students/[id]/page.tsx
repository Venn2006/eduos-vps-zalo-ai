import { getSession } from '@/lib/auth';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import StudentProfileClient from './StudentProfileClient';
import { getStudentProfile } from '../../actions/students';
import { notFound } from 'next/navigation';

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/students")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const student = await getStudentProfile(params.id);

  if (!student) {
    notFound();
  }

  return (
    <StudentProfileClient student={student} />
  );
}
