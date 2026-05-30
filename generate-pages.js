const fs = require('fs');
const path = require('path');

const pages = [
  'login', 'dashboard', 'leads', 'trial-bookings', 'fanpage-inbox', 
  'zalo-groups', 'zalo-inbox', 'students', 'guardians', 'classes', 
  'attendance', 'homework', 'payments', 'renewals', 'reports', 'settings'
];

const titles = {
  'login': 'Đăng nhập',
  'dashboard': 'Tổng quan (CEO Dashboard)',
  'leads': 'Quản lý khách hàng tiềm năng',
  'trial-bookings': 'Lịch học thử',
  'fanpage-inbox': 'Tin nhắn Fanpage',
  'zalo-groups': 'Danh sách nhóm Zalo',
  'zalo-inbox': 'Tin nhắn Zalo',
  'students': 'Quản lý học viên',
  'guardians': 'Quản lý phụ huynh',
  'classes': 'Quản lý lớp học',
  'attendance': 'Điểm danh',
  'homework': 'Chấm bài tập AI',
  'payments': 'Nhắc nợ / Học phí',
  'renewals': 'Tái đăng ký',
  'reports': 'Báo cáo phụ huynh',
  'settings': 'Cài đặt hệ thống'
};

const appDir = path.join(__dirname, 'apps', 'web', 'src', 'app');

if (!fs.existsSync(appDir)) {
  console.error("appDir not found!");
  process.exit(1);
}

for (const page of pages) {
  const dir = path.join(appDir, page);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const content = `import React from 'react';\n\nexport default function Page() {\n  return (\n    <div className="p-8">\n      <h1 className="text-2xl font-bold mb-4">${titles[page]}</h1>\n      <p className="text-gray-600">Đây là trang placeholder cho ${titles[page]}</p>\n      <div className="mt-8 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-500">\n        Table/List Component Placeholder\n      </div>\n    </div>\n  );\n}\n`;
  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
}

console.log("Next.js pages created successfully.");
