import React from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ApprovalQueueClient } from './ApprovalQueueClient';

export default function ApprovalQueuePage() {
  return (
    <div className="space-y-6 pb-10 h-full flex flex-col">
      <SectionHeader 
        title="Việc cần kiểm tra (Approval Queue)" 
        description="Kiểm duyệt các bản nháp nhạy cảm hoặc rủi ro cao trước khi gửi cho Phụ huynh / Học viên. AI chỉ đưa vào đây những trường hợp cần con người xác nhận."
      />
      
      <div className="flex-1 min-h-0 bg-white border border-slate-200 rounded-lg shadow-sm">
        <ApprovalQueueClient />
      </div>
    </div>
  );
}
