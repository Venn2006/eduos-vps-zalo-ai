import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getSession } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { ExternalLink } from 'lucide-react';
import { CrmCommandCenterClient } from './CrmCommandCenterClient';

export default async function CrmCommandCenterPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/crm-command-center")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  // MOCK DATA for Demo
  const staffAccounts = [
    { name: 'Nguyễn Văn A', role: 'Tư vấn', status: 'ONLINE', convs: 45, unanswered: 3, leads: 120, lastActive: 'Vừa xong' },
    { name: 'Trần Thị B', role: 'Tư vấn', status: 'ONLINE', convs: 32, unanswered: 0, leads: 85, lastActive: '5 phút trước' },
    { name: 'Lê Văn C', role: 'Giáo viên', status: 'OFFLINE', convs: 15, unanswered: 0, leads: 0, lastActive: '2 giờ trước' },
    { name: 'Phạm Thị D', role: 'Giáo viên', status: 'ONLINE', convs: 28, unanswered: 5, leads: 0, lastActive: '12 phút trước' },
    { name: 'Hoàng Văn E', role: 'Admin', status: 'NEEDS_RELOGIN', convs: 0, unanswered: 0, leads: 0, lastActive: '1 ngày trước' }
  ];

  const classGroups = [
    { name: 'HSK1-A06 (Tối 2-4-6)', botStatus: 'ACTIVE', members: 15, lastActivity: '10:30', attendance: 'Đã điểm danh', homework: '5/15 nộp' },
    { name: 'IELTS-B02 (Sáng 3-5-7)', botStatus: 'ACTIVE', members: 12, lastActivity: 'Hôm qua', attendance: 'Chưa học', homework: '0/12 nộp' }
  ];

  return (
    <div className="space-y-6 pb-10">
      <SectionHeader 
        title="Trung tâm CRM & Zalo/Fanpage" 
        description="Quản lý khách hàng, phễu tư vấn, tác vụ follow-up và tự động hóa AI."
        action={<Button><ExternalLink className="w-4 h-4 mr-2" /> Tích hợp kênh mới (Demo)</Button>}
      />

      <CrmCommandCenterClient 
        staffAccounts={staffAccounts} 
        classGroups={classGroups} 
      />
    </div>
  );
}
