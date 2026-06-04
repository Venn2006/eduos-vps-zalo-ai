import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { getSession } from '@/lib/auth';
import { FileEdit } from 'lucide-react';
import { HomeworkWorkspaceClient } from './HomeworkWorkspaceClient';

export default async function HomeworkPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/homework")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Quản lý Bài tập & Học vụ" 
        description="Giao bài, duyệt AI chấm nháp và tạo học liệu"
        action={<Button><FileEdit className="w-4 h-4 mr-2" /> Giao bài mới</Button>}
      />
      <HomeworkWorkspaceClient />
    </div>
  );
}
