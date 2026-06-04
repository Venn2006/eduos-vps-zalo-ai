export type PaymentStatus = 'Đã thu đủ' | 'Còn công nợ' | 'Quá hạn' | 'Sắp đến hạn' | 'Sắp hết buổi' | 'Cần admin duyệt';
export type FinanceRiskLevel = 'Bình thường' | 'Cần nhắc nhẹ' | 'Quá hạn thanh toán' | 'Sắp hết buổi' | 'Nguy cơ nghỉ vì công nợ';

export interface FinanceRecord {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  className: string;
  packageName: string;
  totalSessions: number;
  usedSessions: number;
  remainingSessions: number;
  tuitionAmount: number;
  paidAmount: number;
  debtAmount: number;
  dueDate: string | null;
  overdueDays: number;
  status: PaymentStatus;
  owner: string;
  commissionRate: number;
  commissionAmount: number;
  revenueMonth: string; // '2026-06'
  riskLevel: FinanceRiskLevel;
  recommendedAction: string;
  approvalRequired: boolean;
}

export const MOCK_FINANCE_RECORDS: FinanceRecord[] = [
  {
    id: 'F01',
    studentName: 'Nguyễn Văn Tuấn',
    parentName: 'Chị Lan',
    phone: '[SĐT đã ẩn]',
    className: 'IELTS 6.5 K42',
    packageName: 'Khóa 6 tháng',
    totalSessions: 48,
    usedSessions: 46,
    remainingSessions: 2,
    tuitionAmount: 12000000,
    paidAmount: 12000000,
    debtAmount: 0,
    dueDate: null,
    overdueDays: 0,
    status: 'Sắp hết buổi',
    owner: 'Hoàng Văn E',
    commissionRate: 0.05,
    commissionAmount: 600000,
    revenueMonth: '2026-01',
    riskLevel: 'Sắp hết buổi',
    recommendedAction: 'Gọi tư vấn tái phí khóa mới',
    approvalRequired: false,
  },
  {
    id: 'F02',
    studentName: 'Trần Thị Mai',
    parentName: 'Anh Bình',
    phone: '[SĐT đã ẩn]',
    className: 'Giao Tiếp Cơ Bản',
    packageName: 'Khóa 3 tháng',
    totalSessions: 24,
    usedSessions: 10,
    remainingSessions: 14,
    tuitionAmount: 6000000,
    paidAmount: 3000000,
    debtAmount: 3000000,
    dueDate: '2026-05-20',
    overdueDays: 15,
    status: 'Quá hạn',
    owner: 'Trần Thị B',
    commissionRate: 0.05,
    commissionAmount: 300000,
    revenueMonth: '2026-05',
    riskLevel: 'Quá hạn thanh toán',
    recommendedAction: 'Tạo nhắc phí gửi Zalo (Cần admin duyệt)',
    approvalRequired: true,
  },
  {
    id: 'F03',
    studentName: 'Lê Hoàng Nam',
    parentName: 'Chị Ngọc',
    phone: '[SĐT đã ẩn]',
    className: 'Tiếng Anh Trẻ Em C1',
    packageName: 'Khóa 12 tháng',
    totalSessions: 96,
    usedSessions: 5,
    remainingSessions: 91,
    tuitionAmount: 18000000,
    paidAmount: 18000000,
    debtAmount: 0,
    dueDate: null,
    overdueDays: 0,
    status: 'Đã thu đủ',
    owner: 'Nguyễn Văn A',
    commissionRate: 0.10,
    commissionAmount: 1800000,
    revenueMonth: '2026-06',
    riskLevel: 'Bình thường',
    recommendedAction: 'Chăm sóc thường kỳ',
    approvalRequired: false,
  },
  {
    id: 'F04',
    studentName: 'Phạm Bảo Hân',
    parentName: 'Bố Bảo Hân',
    phone: '[SĐT đã ẩn]',
    className: 'IELTS 7.0 K12',
    packageName: 'Khóa 6 tháng',
    totalSessions: 48,
    usedSessions: 20,
    remainingSessions: 28,
    tuitionAmount: 15000000,
    paidAmount: 10000000,
    debtAmount: 5000000,
    dueDate: '2026-06-02',
    overdueDays: 2,
    status: 'Còn công nợ',
    owner: 'Hoàng Văn E',
    commissionRate: 0.05,
    commissionAmount: 500000,
    revenueMonth: '2026-05',
    riskLevel: 'Cần nhắc nhẹ',
    recommendedAction: 'Nhắc khéo qua Zalo OA',
    approvalRequired: true,
  },
  {
    id: 'F05',
    studentName: 'Vũ Đức Minh',
    parentName: 'Mẹ Đức Minh',
    phone: '[SĐT đã ẩn]',
    className: 'TOEIC 600',
    packageName: 'Khóa 3 tháng',
    totalSessions: 24,
    usedSessions: 24,
    remainingSessions: 0,
    tuitionAmount: 4500000,
    paidAmount: 2000000,
    debtAmount: 2500000,
    dueDate: '2026-04-15',
    overdueDays: 50,
    status: 'Cần admin duyệt',
    owner: 'Trần Thị B',
    commissionRate: 0.0, // Không hoa hồng nếu nợ lâu
    commissionAmount: 0,
    revenueMonth: '2026-04',
    riskLevel: 'Nguy cơ nghỉ vì công nợ',
    recommendedAction: 'Khóa tài khoản học, gọi điện trực tiếp',
    approvalRequired: true,
  }
];

export interface CostRecord {
  category: string;
  amount: number;
}

export const MOCK_COSTS: CostRecord[] = [
  { category: 'Lương giáo viên', amount: 45000000 },
  { category: 'Marketing', amount: 15000000 },
  { category: 'Thuê mặt bằng', amount: 20000000 },
  { category: 'Công cụ/phần mềm', amount: 5000000 },
  { category: 'Khác', amount: 3000000 },
];
