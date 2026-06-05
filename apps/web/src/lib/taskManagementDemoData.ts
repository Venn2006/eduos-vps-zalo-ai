export type TaskStatus = 'NEW' | 'IN_PROGRESS' | 'WAITING_APPROVAL' | 'OVERDUE' | 'DONE_DEMO';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  type: string; // 'Gọi phụ huynh', 'Trả lời Zalo', 'Chốt lịch học thử', 'Nhắc học phí', 'Duyệt báo cáo phụ huynh', 'Kiểm tra bài tập', 'Xử lý khiếu nại'
  status: TaskStatus;
  priority: 'High' | 'Medium' | 'Low';
  ownerName: string;
  ownerRole: string;
  dueTime: string;
  channel: string; // 'Zalo', 'Call', 'Internal'
  relatedPerson: string;
  relatedType: 'Học viên' | 'Phụ huynh' | 'Khách hàng';
  maskedPhone: string;
  route: string;
  safetyMode: string;
  suggestedDraft?: string;
  timeline: { time: string; text: string; }[];
  notes: string;
  tags: string[];
}

export const taskManagementDemoTasks: TaskItem[] = [
  {
    id: "TASK-001",
    title: "Phụ huynh hỏi về lịch học tuần sau",
    description: "Khách hàng nhắn tin qua Zalo OA hỏi về lịch học bù cho tuần sau.",
    type: "Trả lời Zalo",
    status: "NEW",
    priority: "High",
    ownerName: "Mai Nguyễn",
    ownerRole: "Tư vấn viên",
    dueTime: "Hôm nay, 10:00 AM",
    channel: "Zalo",
    relatedPerson: "Mẹ bé Thỏ",
    relatedType: "Phụ huynh",
    maskedPhone: "0901***456",
    route: "/fanpage-inbox?thread=123",
    safetyMode: "Chỉ AI nháp, người gửi",
    suggestedDraft: "Dạ chào mẹ bé Thỏ, lịch học bù của bé vào tuần sau có thể xếp vào thứ 4 hoặc thứ 6 lúc 18h ạ. Mẹ xem lịch nào tiện cho bé nhé!",
    timeline: [
      { time: "09:15 AM", text: "Khách nhắn tin Zalo OA" },
      { time: "09:16 AM", text: "AI tự động phân loại: Hỏi lịch học" }
    ],
    notes: "Khách hàng VIP, cần phản hồi nhanh dưới 30p.",
    tags: ["Lịch học", "Zalo OA", "VIP"]
  },
  {
    id: "TASK-002",
    title: "Chốt lịch học thử môn Tiếng Anh",
    description: "Lead từ Facebook Ads cần gọi điện chốt lịch học thử cuối tuần.",
    type: "Chốt lịch học thử",
    status: "IN_PROGRESS",
    priority: "High",
    ownerName: "Tuấn Trần",
    ownerRole: "Sale Manager",
    dueTime: "Hôm nay, 14:00 PM",
    channel: "Call",
    relatedPerson: "Anh Cường",
    relatedType: "Khách hàng",
    maskedPhone: "0912***789",
    route: "/leads?id=456",
    safetyMode: "Local state only",
    timeline: [
      { time: "Hôm qua 20:00", text: "Lead đăng ký qua Landing page" },
      { time: "08:00 AM", text: "Hệ thống tự phân bổ cho Tuấn Trần" }
    ],
    notes: "Chú ý giới thiệu gói học phí 1 năm đang có khuyến mãi.",
    tags: ["Học thử", "Lead FB"]
  },
  {
    id: "TASK-003",
    title: "Duyệt báo cáo học tập tháng 5",
    description: "Giáo viên đã soạn xong báo cáo, cần Quản lý học vụ duyệt trước khi gửi Zalo.",
    type: "Duyệt báo cáo phụ huynh",
    status: "WAITING_APPROVAL",
    priority: "Medium",
    ownerName: "Lan Phạm",
    ownerRole: "Quản lý học vụ",
    dueTime: "Hôm nay, 16:00 PM",
    channel: "Internal",
    relatedPerson: "Bé Gấu",
    relatedType: "Học viên",
    maskedPhone: "0988***112",
    route: "/approval-queue",
    safetyMode: "Demo: chưa gửi thật",
    timeline: [
      { time: "Hôm qua", text: "Giáo viên Nhập điểm" },
      { time: "08:30 AM", text: "Giáo viên gửi yêu cầu duyệt báo cáo" }
    ],
    notes: "Báo cáo có tiến bộ môn Nghe, cần khen ngợi.",
    tags: ["Báo cáo tháng", "Chờ duyệt"]
  },
  {
    id: "TASK-004",
    title: "Nhắc học phí tháng 6",
    description: "Phụ huynh đã quá hạn đóng học phí 3 ngày.",
    type: "Nhắc học phí",
    status: "OVERDUE",
    priority: "High",
    ownerName: "Hương Lê",
    ownerRole: "Kế toán",
    dueTime: "Hôm qua, 17:00 PM",
    channel: "Zalo",
    relatedPerson: "Chị Linh",
    relatedType: "Phụ huynh",
    maskedPhone: "0933***445",
    route: "/workspaces/finance",
    safetyMode: "Chỉ AI nháp",
    suggestedDraft: "Dạ EduOS xin chào chị Linh, hiện tại hệ thống ghi nhận khoản học phí tháng 6 của bé nhà mình chưa được thanh toán. Chị kiểm tra và thanh toán giúp trung tâm nhé ạ. EduOS cảm ơn chị!",
    timeline: [
      { time: "Mùng 1", text: "Gửi thông báo học phí" },
      { time: "Hôm qua", text: "Quá hạn thanh toán 3 ngày" }
    ],
    notes: "Nhắn tin Zalo trước, nếu không phản hồi thì gọi.",
    tags: ["Học phí", "Quá hạn"]
  },
  {
    id: "TASK-005",
    title: "Xử lý khiếu nại chất lượng mạng",
    description: "Phụ huynh phản ánh học trực tuyến mạng bị lag.",
    type: "Xử lý khiếu nại",
    status: "NEW",
    priority: "Medium",
    ownerName: "Bảo Trợ giảng",
    ownerRole: "Trợ giảng",
    dueTime: "Hôm nay, 11:30 AM",
    channel: "Zalo",
    relatedPerson: "Bố bé Nam",
    relatedType: "Phụ huynh",
    maskedPhone: "0977***666",
    route: "/fanpage-inbox?thread=999",
    safetyMode: "Chỉ AI nháp",
    suggestedDraft: "Dạ trung tâm xin lỗi anh về sự cố mạng tối qua ạ. Đội kỹ thuật đã kiểm tra và khắc phục. Trung tâm xin gửi tặng bé 1 buổi học bù ạ.",
    timeline: [
      { time: "10:00 AM", text: "Phụ huynh nhắn tin phản ánh" },
      { time: "10:05 AM", text: "AI gán nhãn: Khiếu nại" }
    ],
    notes: "Xoa dịu phụ huynh và đề xuất học bù.",
    tags: ["Khiếu nại", "Kỹ thuật"]
  }
];

export const taskManagementDemoStats = {
  totalToday: 24,
  overdue: 3,
  inProgress: 8,
  waitingApproval: 5,
  doneDemo: 12
};

export const taskManagementDemoStaff = [
  {
    id: "STAFF-01",
    name: "Mai Nguyễn",
    role: "Tư vấn viên",
    activeTasks: 5,
    overdueTasks: 0,
    inboxWorkload: "Cao",
    nextAction: "Trả lời Zalo",
    onlineStatus: "Online"
  },
  {
    id: "STAFF-02",
    name: "Tuấn Trần",
    role: "Sale Manager",
    activeTasks: 8,
    overdueTasks: 1,
    inboxWorkload: "Trung bình",
    nextAction: "Gọi điện chốt sale",
    onlineStatus: "Online"
  },
  {
    id: "STAFF-03",
    name: "Lan Phạm",
    role: "Quản lý học vụ",
    activeTasks: 3,
    overdueTasks: 0,
    inboxWorkload: "Thấp",
    nextAction: "Duyệt báo cáo",
    onlineStatus: "Away"
  },
  {
    id: "STAFF-04",
    name: "Hương Lê",
    role: "Kế toán",
    activeTasks: 4,
    overdueTasks: 2,
    inboxWorkload: "Trung bình",
    nextAction: "Nhắc học phí",
    onlineStatus: "Offline"
  }
];
