import { getSession } from '@/lib/auth';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import StudentListClient from './StudentListClient';
import { getStudentsList } from '../actions/students';
import { PageGuidanceBanner } from '@/components/ui/PageGuidanceBanner';

export default async function StudentsPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/students")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const initialStudents = await getStudentsList();

  return (
    <div className="space-y-6 pb-10">
      <PageGuidanceBanner
        title="Học viên"
        description="Xem danh sách học viên, lớp đang học, phụ huynh và các trường hợp cần chăm sóc."
      />
      <StudentListClient initialStudents={initialStudents} />
    </div>
  );
}
