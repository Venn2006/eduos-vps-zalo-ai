import { getSession } from '@/lib/auth';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import StudentListClient from './StudentListClient';
import { getStudentsList } from '../actions/students';

export default async function StudentsPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/students")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const initialStudents = await getStudentsList();

  return (
    <StudentListClient initialStudents={initialStudents} />
  );
}
