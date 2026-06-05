export const demoKpiData = {
  revenueMonth: 125000000,
  newLeadsToday: 15,
  unreadMessages: 42,
  overdueTasks: 8,
  atRiskStudents: 3,
  outstandingDebt: 45000000
};

export const demoCommandFeed = [
  {
    id: 'cmd-1',
    type: 'finance',
    title: 'Duyệt 15 tin nhắc học phí Zalo',
    description: 'AI đã soạn sẵn 15 tin nhắn cho các phụ huynh quá hạn đóng tiền.',
    priority: 'high',
    owner: 'Finance AI',
    relatedRoute: '/zalo-inbox',
    status: 'pending'
  },
  {
    id: 'cmd-2',
    type: 'sales',
    title: 'Chia 5 leads mới từ Facebook',
    description: 'Có 5 phụ huynh vừa inbox hỏi khóa IELTS chiều nay.',
    priority: 'high',
    owner: 'Sales Admin',
    relatedRoute: '/leads',
    status: 'pending'
  },
  {
    id: 'cmd-3',
    type: 'academic',
    title: 'Phụ huynh phàn nàn chất lượng',
    description: 'Mẹ bé Kem phàn nàn bé không hiểu bài trên nhóm lớp Zalo.',
    priority: 'urgent',
    owner: 'CEO AI',
    relatedRoute: '/crm-command-center',
    status: 'urgent'
  },
  {
    id: 'cmd-4',
    type: 'task',
    title: 'Duyệt bảng lương giáo viên tháng 5',
    description: 'Kế toán đã tải lên bảng chấm công và lương.',
    priority: 'normal',
    owner: 'Kế toán',
    relatedRoute: '/workspaces/finance',
    status: 'pending'
  }
];

export const demoStaffWorkload = [
  {
    id: 'staff-1',
    staffName: 'Lan (Sales)',
    role: 'Tư vấn viên',
    isOnline: true,
    activeLeads: 45,
    conversations: 12,
    overdueTasks: 2,
    nextAction: 'Gọi lại 3 khách hẹn chiều nay'
  },
  {
    id: 'staff-2',
    staffName: 'Hương (Kế toán)',
    role: 'Kế toán',
    isOnline: true,
    activeLeads: 0,
    conversations: 5,
    overdueTasks: 0,
    nextAction: 'Chờ CEO duyệt bảng lương'
  },
  {
    id: 'staff-3',
    staffName: 'Thầy Mike',
    role: 'Giáo viên',
    isOnline: false,
    activeLeads: 0,
    conversations: 0,
    overdueTasks: 3,
    nextAction: 'Chưa chấm bài lớp IELTS 101'
  }
];

export const demoAiInsights = [
  {
    id: 'insight-1',
    title: 'Tỷ lệ chốt sale đang giảm',
    reason: 'Thời gian trả lời tin nhắn Facebook trung bình lên tới 45 phút.',
    suggestedAction: 'Bật AI tự động trả lời',
    safetyMode: 'AI chỉ gợi ý',
    route: '/fanpage-inbox'
  },
  {
    id: 'insight-2',
    title: 'Nguy cơ mất 3 học viên',
    reason: '3 học viên lớp Kids đã nghỉ 2 buổi liên tiếp không phép.',
    suggestedAction: 'Xem danh sách điểm danh',
    safetyMode: 'Cần duyệt trước khi gửi',
    route: '/workspaces/teacher'
  }
];

export const demoUrgentAlerts = [
  {
    id: 'alert-1',
    type: 'tuition',
    message: 'Công nợ quá hạn vượt 45 triệu, cần xử lý.'
  },
  {
    id: 'alert-2',
    type: 'complaint',
    message: 'Phụ huynh 0912***678 nhắn tin không hài lòng về chất lượng buổi học.'
  }
];
