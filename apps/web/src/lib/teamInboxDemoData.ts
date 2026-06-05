export const teamInboxSummaryMetrics = {
  totalUnread: 14,
  unassignedConversations: 5,
  overdueSla: 3,
  activeStaff: 8,
  hotlineThreads: 42,
  resolvedToday: 128,
  waitingApprovalDrafts: 6
};

export const mockChannelsAndAccounts = [
  { id: 'c1', type: 'HOTLINE', name: 'Zalo Hotline trung tâm', unreadCount: 5, status: 'active' },
  { id: 'c2', type: 'OA', name: 'Zalo OA demo', unreadCount: 2, status: 'active' },
  { id: 'c3', type: 'FANPAGE', name: 'Fanpage chính', unreadCount: 7, status: 'active' },
  { id: 'c4', type: 'FANPAGE', name: 'Fanpage tuyển sinh', unreadCount: 0, status: 'active' },
];

export const mockStaffProfiles = [
  { id: 's1', staffName: 'Nguyễn Văn CEO', role: 'CEO/Admin', workChannelName: 'Zalo Work - CEO', status: 'online', assignedConversations: 2, unreadCount: 0, slaRisk: 0, permissionLevel: 'CEO/Admin', consentLabel: 'Có phân quyền', lastActivity: 'Vừa xong' },
  { id: 's2', staffName: 'Trần Thị Quản Lý', role: 'Quản lý', workChannelName: 'Zalo Work - QL', status: 'online', assignedConversations: 8, unreadCount: 1, slaRisk: 0, permissionLevel: 'Quản lý', consentLabel: 'Có phân quyền', lastActivity: '5p trước' },
  { id: 's3', staffName: 'Lê Sale 1', role: 'Sale', workChannelName: 'Zalo Work - Sale 1', status: 'online', assignedConversations: 15, unreadCount: 4, slaRisk: 2, permissionLevel: 'Sale', consentLabel: 'Tài khoản công việc demo', lastActivity: 'Vừa xong' },
  { id: 's4', staffName: 'Phạm Sale 2', role: 'Sale', workChannelName: 'Zalo Work - Sale 2', status: 'offline', assignedConversations: 5, unreadCount: 2, slaRisk: 1, permissionLevel: 'Sale', consentLabel: 'Tài khoản công việc demo', lastActivity: '2h trước' },
  { id: 's5', staffName: 'Hoàng Giáo Viên 1', role: 'Giáo viên', workChannelName: 'Zalo Work - GV 1', status: 'online', assignedConversations: 4, unreadCount: 0, slaRisk: 0, permissionLevel: 'Giáo viên', consentLabel: 'Không giám sát cá nhân', lastActivity: '15p trước' },
  { id: 's6', staffName: 'Vũ Giáo Viên 2', role: 'Giáo viên', workChannelName: 'Zalo Work - GV 2', status: 'busy', assignedConversations: 6, unreadCount: 2, slaRisk: 0, permissionLevel: 'Giáo viên', consentLabel: 'Không giám sát cá nhân', lastActivity: 'Vừa xong' },
  { id: 's7', staffName: 'Đặng Kế Toán', role: 'Kế toán', workChannelName: 'Zalo Work - KT', status: 'online', assignedConversations: 3, unreadCount: 0, slaRisk: 0, permissionLevel: 'Kế toán', consentLabel: 'Tài khoản công việc demo', lastActivity: '1h trước' },
  { id: 's8', staffName: 'Bùi Sale 3', role: 'Sale', workChannelName: 'Zalo Work - Sale 3', status: 'online', assignedConversations: 12, unreadCount: 3, slaRisk: 0, permissionLevel: 'Sale', consentLabel: 'Tài khoản công việc demo', lastActivity: 'Vừa xong' },
  { id: 's9', staffName: 'Đỗ CSKH 1', role: 'CSKH', workChannelName: 'Zalo Work - CSKH 1', status: 'online', assignedConversations: 18, unreadCount: 5, slaRisk: 1, permissionLevel: 'Sale', consentLabel: 'Hotline trung tâm', lastActivity: 'Vừa xong' },
  { id: 's10', staffName: 'Ngô CSKH 2', role: 'CSKH', workChannelName: 'Zalo Work - CSKH 2', status: 'offline', assignedConversations: 2, unreadCount: 1, slaRisk: 0, permissionLevel: 'Sale', consentLabel: 'Hotline trung tâm', lastActivity: '1 ngày trước' },
];

export const mockConversations = [
  {
    id: 'conv1',
    customerName: 'Phụ huynh bé Linh',
    studentName: 'Linh',
    maskedPhone: '[SĐT đã ẩn]',
    channel: 'Zalo Hotline trung tâm',
    sourceAccount: 'Hotline',
    assignedStaff: 'Đỗ CSKH 1',
    status: 'Đang xử lý',
    priority: 'Cao',
    slaStatus: 'Bình thường',
    lastMessagePreview: 'Trung tâm cho mình hỏi lịch học bù tuần này với ạ.',
    tags: ['Học vụ', 'Lịch học'],
    relatedRoute: '/students/linh',
    sentiment: 'neutral',
    createdAtLabel: 'Hôm nay 08:30',
    lastActivityLabel: '10p trước'
  },
  {
    id: 'conv2',
    customerName: 'Anh Tuấn',
    studentName: '',
    maskedPhone: '[SĐT đã ẩn]',
    channel: 'Fanpage chính',
    sourceAccount: 'Fanpage',
    assignedStaff: 'Chưa ai nhận',
    status: 'Chưa nhận',
    priority: 'Nóng',
    slaStatus: 'Quá SLA',
    lastMessagePreview: 'Mình muốn đăng ký khóa IELTS mục tiêu 6.5 cho con.',
    tags: ['Tư vấn mới', 'IELTS'],
    relatedRoute: '/leads/tuan',
    sentiment: 'positive',
    createdAtLabel: 'Hôm qua 21:00',
    lastActivityLabel: '12h trước'
  },
  {
    id: 'conv3',
    customerName: 'Chị Hoa',
    studentName: 'Bé Na',
    maskedPhone: '[SĐT đã ẩn]',
    channel: 'Zalo Work - KT',
    sourceAccount: 'Zalo Cá Nhân (Work)',
    assignedStaff: 'Đặng Kế Toán',
    status: 'Chờ duyệt nháp',
    priority: 'Bình thường',
    slaStatus: 'Bình thường',
    lastMessagePreview: 'Đã nhận được biên lai học phí chưa em?',
    tags: ['Học phí'],
    relatedRoute: '/payments/na',
    sentiment: 'neutral',
    createdAtLabel: 'Hôm nay 09:15',
    lastActivityLabel: '5p trước'
  },
  {
    id: 'conv4',
    customerName: 'Bạn Minh',
    studentName: 'Minh',
    maskedPhone: '[SĐT đã ẩn]',
    channel: 'Zalo Work - Sale 1',
    sourceAccount: 'Zalo Cá Nhân (Work)',
    assignedStaff: 'Lê Sale 1',
    status: 'Cần chuyển người',
    priority: 'Cao',
    slaStatus: 'Quá SLA',
    lastMessagePreview: 'Dạ phần nghe bài test hôm qua em làm chưa tốt lắm...',
    tags: ['Hỗ trợ học tập'],
    relatedRoute: '/students/minh',
    sentiment: 'negative',
    createdAtLabel: 'Hôm qua 15:20',
    lastActivityLabel: '3h trước'
  },
  {
    id: 'conv5',
    customerName: 'Phụ huynh Khang',
    studentName: 'Khang',
    maskedPhone: '[SĐT đã ẩn]',
    channel: 'Zalo Hotline trung tâm',
    sourceAccount: 'Hotline',
    assignedStaff: 'Lê Sale 1',
    status: 'Đã xử lý demo',
    priority: 'Thấp',
    slaStatus: 'Bình thường',
    lastMessagePreview: 'Cảm ơn cô giáo, cháu nhà mình thích học lắm.',
    tags: ['Feedback'],
    relatedRoute: '/students/khang',
    sentiment: 'positive',
    createdAtLabel: 'Hôm nay 07:00',
    lastActivityLabel: '1h trước'
  }
];

export const mockMessageThreads: Record<string, any[]> = {
  'conv1': [
    { senderType: 'parent', message: 'Chào trung tâm, cho mình hỏi lịch học bù tuần này cho bé Linh với ạ.', time: '08:30' },
    { senderType: 'internal_note', message: 'Bé Linh lớp Starters 2 nghỉ thứ 4. Đã xếp lịch học bù chiều T7.', time: '08:45' },
  ],
  'conv2': [
    { senderType: 'parent', message: 'Chào admin, Mình muốn đăng ký khóa IELTS mục tiêu 6.5 cho con đang học lớp 10. Tư vấn giúp mình nhé.', time: 'Hôm qua 21:00' },
  ],
  'conv3': [
    { senderType: 'parent', message: 'Chị vừa chuyển khoản học phí tháng này rồi nhé.', time: '09:00' },
    { senderType: 'parent', message: 'Đã nhận được biên lai học phí chưa em?', time: '09:15' },
    { senderType: 'ai', draftOnly: true, approvalRequired: true, message: 'Dạ trung tâm đã nhận được khoản thanh toán của chị Hoa rồi ạ. Kế toán đang xuất hóa đơn và sẽ gửi lại chị trong sáng nay nhé.', time: '09:16' }
  ],
  'conv4': [
    { senderType: 'parent', message: 'Dạ phần nghe bài test hôm qua em làm chưa tốt lắm...', time: '15:20' }
  ],
  'conv5': [
    { senderType: 'parent', message: 'Cảm ơn cô giáo, cháu nhà mình thích học lắm.', time: '07:00' }
  ]
};

export const mockAiSuggestions: Record<string, any> = {
  'conv1': {
    draftText: 'Dạ em chào chị ạ. Bé Linh tuần này có thể học bù vào ca 15:00 - 17:00 chiều Thứ 7 chị nhé. Lớp Starters 2 phòng 101 ạ.',
    reason: 'Phát hiện câu hỏi về lịch học bù. Hệ thống đã check lịch trống lớp Starters 2.',
    safetyMode: 'STAFF_HANDOFF',
    suggestedNextAction: 'Nhân viên cần xác nhận lại lịch rảnh của phụ huynh trước khi gửi.'
  },
  'conv2': {
    draftText: 'Chào anh Tuấn! Cảm ơn anh đã quan tâm đến chương trình IELTS tại EduOS. Đối với học sinh lớp 10 mục tiêu 6.5, trung tâm có lộ trình chuyên sâu 12 tháng. Anh có thể để lại số điện thoại để chuyên viên tư vấn gọi hỗ trợ chi tiết hơn không ạ?',
    reason: 'Lead mới quan tâm khóa IELTS. Cần xin số điện thoại để chốt sale.',
    safetyMode: 'DRAFT_ONLY',
    suggestedNextAction: 'Phân công ngay cho Sale để gọi điện tư vấn.'
  },
  'conv3': {
    draftText: 'Dạ trung tâm đã nhận được khoản thanh toán của chị Hoa rồi ạ. Kế toán đang xuất hóa đơn và sẽ gửi lại chị trong sáng nay nhé.',
    reason: 'Xác nhận đã nhận chuyển khoản thành công từ hệ thống ngân hàng.',
    safetyMode: 'ADMIN_APPROVAL_REQUIRED',
    suggestedNextAction: 'Kế toán trưởng cần duyệt trước khi phản hồi liên quan đến tài chính.'
  }
};
