export interface MockAcademicTeacher {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface MockAcademicRoom {
  id: string;
  name: string;
  capacity: number;
}

export interface MockAcademicClass {
  id: string;
  name: string;
  level: string;
  studentCount: number;
}

export interface MockAcademicSession {
  id: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  roomId: string;
  roomName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  studentCount: number;
  absentCount: number;
  homeworkMissingCount: number;
  attendanceStatus: 'Đủ' | 'Có học viên vắng' | 'Chưa điểm danh' | 'Cần gọi phụ huynh' | 'Cần giáo viên xác nhận';
  homeworkStatus: 'Đã giao bài' | 'Thiếu bài' | 'AI chấm nháp' | 'Cần giáo viên duyệt' | 'Đã duyệt demo';
  reportStatus: 'Chưa báo bài' | 'AI tạo nháp' | 'Cần giáo viên duyệt' | 'Sẵn sàng gửi sandbox' | 'Đã lưu demo';
  approvalMode: 'TEACHER_APPROVAL_REQUIRED' | 'ADMIN_APPROVAL_REQUIRED' | 'AUTO';
  suggestedAction: string;
}

export const mockTeachers: MockAcademicTeacher[] = [
  { id: 't1', name: 'Nguyễn Văn A', role: 'Giáo viên', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NVA' },
  { id: 't2', name: 'Trần Thị B', role: 'Giáo viên', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TTB' },
  { id: 't3', name: 'Lê Hoàng C', role: 'Học vụ', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LHC' },
];

export const mockRooms: MockAcademicRoom[] = [
  { id: 'r1', name: 'Phòng 101', capacity: 15 },
  { id: 'r2', name: 'Phòng 102', capacity: 20 },
  { id: 'r3', name: 'Phòng 103', capacity: 12 },
];

export const mockClasses: MockAcademicClass[] = [
  { id: 'c1', name: 'IELTS Intensive A', level: 'IELTS 6.5+', studentCount: 12 },
  { id: 'c2', name: 'Giao tiếp B1', level: 'B1', studentCount: 18 },
  { id: 'c3', name: 'Kids Starter', level: 'Starters', studentCount: 10 },
];

// Today's date for deterministic mock
const todayStr = new Date().toISOString().split('T')[0];

export const mockSessions: MockAcademicSession[] = [
  {
    id: 's1',
    classId: 'c1',
    className: 'IELTS Intensive A',
    teacherId: 't1',
    teacherName: 'Nguyễn Văn A',
    roomId: 'r1',
    roomName: 'Phòng 101',
    date: todayStr,
    startTime: '18:00',
    endTime: '20:00',
    studentCount: 12,
    absentCount: 0,
    homeworkMissingCount: 2,
    attendanceStatus: 'Chưa điểm danh',
    homeworkStatus: 'Cần giáo viên duyệt',
    reportStatus: 'AI tạo nháp',
    approvalMode: 'TEACHER_APPROVAL_REQUIRED',
    suggestedAction: 'Duyệt nhận xét AI'
  },
  {
    id: 's2',
    classId: 'c2',
    className: 'Giao tiếp B1',
    teacherId: 't1', // CONFLICT: t1 is teaching s1 from 18:00 to 20:00!
    teacherName: 'Nguyễn Văn A',
    roomId: 'r2',
    roomName: 'Phòng 102',
    date: todayStr,
    startTime: '18:30',
    endTime: '20:30',
    studentCount: 18,
    absentCount: 3,
    homeworkMissingCount: 0,
    attendanceStatus: 'Có học viên vắng',
    homeworkStatus: 'Đã giao bài',
    reportStatus: 'Chưa báo bài',
    approvalMode: 'TEACHER_APPROVAL_REQUIRED',
    suggestedAction: 'Điểm danh demo'
  },
  {
    id: 's3',
    classId: 'c3',
    className: 'Kids Starter',
    teacherId: 't2',
    teacherName: 'Trần Thị B',
    roomId: 'r2', // CONFLICT: room r2 is used by s2 at 18:30-20:30!
    roomName: 'Phòng 102',
    date: todayStr,
    startTime: '19:00',
    endTime: '21:00',
    studentCount: 10,
    absentCount: 0,
    homeworkMissingCount: 0,
    attendanceStatus: 'Đủ',
    homeworkStatus: 'AI chấm nháp',
    reportStatus: 'AI tạo nháp',
    approvalMode: 'TEACHER_APPROVAL_REQUIRED',
    suggestedAction: 'Duyệt điểm demo'
  }
];

export interface MockAcademicTask {
  id: string;
  title: string;
  owner: string;
  dueTime: string;
  className: string;
  reason: string;
  status: 'Mới' | 'Đang xử lý' | 'Quá hạn' | 'Chờ giáo viên duyệt' | 'Hoàn tất demo';
  approvalMode: 'TEACHER_APPROVAL_REQUIRED' | 'ADMIN_APPROVAL_REQUIRED' | 'AUTO';
  suggestedAction: string;
}

export const mockAcademicTasks: MockAcademicTask[] = [
  {
    id: 'tsk1',
    title: 'Duyệt nhận xét AI',
    owner: 'Nguyễn Văn A',
    dueTime: 'Hôm nay, 21:00',
    className: 'IELTS Intensive A',
    reason: 'AI đã tạo xong nháp nhận xét định kỳ',
    status: 'Chờ giáo viên duyệt',
    approvalMode: 'TEACHER_APPROVAL_REQUIRED',
    suggestedAction: 'Duyệt demo'
  },
  {
    id: 'tsk2',
    title: 'Báo học vụ đổi phòng',
    owner: 'Trần Thị B',
    dueTime: 'Hôm nay, 18:00',
    className: 'Kids Starter',
    reason: 'Trùng lịch phòng 102',
    status: 'Quá hạn',
    approvalMode: 'TEACHER_APPROVAL_REQUIRED',
    suggestedAction: 'Gửi yêu cầu demo'
  },
  {
    id: 'tsk3',
    title: 'Gọi phụ huynh báo vắng',
    owner: 'Lê Hoàng C',
    dueTime: 'Hôm nay, 19:00',
    className: 'Giao tiếp B1',
    reason: 'Học viên vắng không phép 2 buổi',
    status: 'Mới',
    approvalMode: 'ADMIN_APPROVAL_REQUIRED',
    suggestedAction: 'Gọi demo'
  }
];
