import { Metadata } from 'next';
import MockOutboxClient from './MockOutboxClient';
import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';

export const metadata: Metadata = {
  title: 'Hàng chờ duyệt',
  description: 'Kiểm tra quy trình gửi trong duyệt trước.',
};

export default async function MockOutboxPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, '/settings')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  return <MockOutboxClient />;
}
