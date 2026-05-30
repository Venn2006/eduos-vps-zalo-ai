const fs = require('fs');
const pages = {
  'classes': ['Lớp học', 'Quản lý danh sách lớp học và giáo viên', 'Thêm lớp học'],
  'students': ['Học viên', 'Hồ sơ học viên và lịch sử học tập', 'Thêm học viên'],
  'attendance': ['Điểm danh', 'Quản lý điểm danh hàng ngày', ''],
  'homework': ['Bài tập', 'Giao và chấm bài tập qua Zalo', 'Giao bài mới'],
  'payments': ['Học phí', 'Quản lý thu chi học phí', 'Tạo hóa đơn'],
  'renewals': ['Tái phí', 'Theo dõi học viên sắp hết hạn và tái phí', ''],
  'reports': ['Báo cáo', 'Báo cáo thống kê trung tâm', ''],
  'fanpage-inbox': ['Fanpage Inbox', 'Quản lý tin nhắn từ Facebook Fanpage', ''],
  'zalo-groups': ['Zalo Groups', 'Quản lý các nhóm Zalo lớp học', ''],
  'zalo-inbox': ['Zalo Inbox', 'Tin nhắn Zalo cá nhân', ''],
  'trial-bookings': ['Học thử', 'Quản lý lịch học thử và chuyển đổi', 'Thêm lịch học thử'],
  'settings': ['Cài đặt', 'Cấu hình hệ thống và trung tâm', ''],
  'guardians': ['Phụ huynh', 'Quản lý thông tin phụ huynh', 'Thêm phụ huynh']
};

for (const [dir, [title, desc, btn]] of Object.entries(pages)) {
  const content = `import React from 'react';
import { PageShell } from '@/components/layout/PageShell';

export default function ${dir.replace(/-./g, x=>x[1].toUpperCase()).replace(/^./, x=>x.toUpperCase())}Page() {
  return (
    <PageShell 
      title="${title}" 
      description="${desc}"
      ${btn ? `primaryAction="${btn}"` : ''}
    />
  );
}
`;
  fs.mkdirSync(`src/app/${dir}`, { recursive: true });
  fs.writeFileSync(`src/app/${dir}/page.tsx`, content);
}
