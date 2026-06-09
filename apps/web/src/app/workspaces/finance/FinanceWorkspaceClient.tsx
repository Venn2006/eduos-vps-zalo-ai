"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  PiggyBank, ArrowRight, CheckCircle2, Clock, AlertTriangle, Sparkles,
  Wallet, Receipt, Users, FileText, X, UserCheck, Bot
} from 'lucide-react';
import { createPaymentReminder } from '../../actions/finance';
import { toast } from 'sonner';
import { CreateExpenseModal } from './CreateExpenseModal';

interface FinanceWorkspaceClientProps {
  initialMetrics: {
    currentMonthRevenue: number;
    currentMonthCollected: number;
    totalDebt: number;
    estimatedProfit: number;
    totalCost: number;
    expiringSessionsCount: number;
    overdueCount: number;
    approvalRequiredCount: number;
    commissionsByStaff: Record<string, {
      wonStudents: number;
      collectedTuition: number;
      commissionAmount: number;
    }>;
  };
  initialRecords: FinanceRecord[];
  initialExpenses: FinanceExpense[];
}

type FinanceRecord = {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  className: string;
  remainingSessions: number | null;
  totalSessions: number | null;
  tuitionAmount: number;
  paidAmount: number;
  debtAmount: number;
  dueDate: string;
  overdueDays: number;
  status: string;
  approvalRequired: boolean;
  recommendedAction: string;
  owner: string;
};

type FinanceExpense = {
  id: string;
  expenseCode: string;
  category: string;
  recipientName: string;
  amount: number;
  expenseDate: Date | string;
  note?: string | null;
  status: string;
};

// Reusable Action Card
function ActionCard({
  title,
  metric,
  reason,
  severity = "info",
  onClick
}: {
  title: string,
  metric: number | string,
  reason: string,
  severity?: "success" | "warning" | "critical" | "info",
  onClick?: () => void
}) {
  const colorMap = {
    success: "bg-white border-slate-200 border-l-4 border-l-emerald-500 text-slate-900",
    warning: "bg-white border-slate-200 border-l-4 border-l-amber-500 text-slate-900",
    critical: "bg-white border-slate-200 border-l-4 border-l-rose-500 text-slate-900",
    info: "bg-white border-slate-200 border-l-4 border-l-blue-500 text-slate-900"
  };

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    warning: <Clock className="w-5 h-5 text-amber-500" />,
    critical: <AlertTriangle className="w-5 h-5 text-rose-500" />,
    info: <Sparkles className="w-5 h-5 text-blue-500" />
  };

  return (
    <div className={`flex flex-col p-5 rounded-xl border ${colorMap[severity]} shadow-sm`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-sm tracking-tight opacity-80">{title}</h3>
        {iconMap[severity]}
      </div>
      <div className="text-3xl font-black mb-3">
        {metric}
      </div>
      <p className="text-sm opacity-75 flex-1 mb-5 kháching-snug">
        {reason}
      </p>
      {onClick && (
        <button onClick={onClick} className="mt-auto w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-white">
          Xem chi tiết <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function FinanceWorkspaceClient({ initialMetrics, initialRecords, initialExpenses }: FinanceWorkspaceClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'receipts' | 'expenses' | 'việcs'>('overview');
  const [selectedRecord, setSelectedRecord] = useState<FinanceRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const metrics = initialMetrics;
  const records = initialRecords;
  const expenses = initialExpenses;

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã thu đủ': return 'bg-emerald-100 text-emerald-700';
      case 'Còn công nợ': return 'bg-blue-100 text-blue-700';
      case 'Quá hạn': return 'bg-rose-100 text-rose-700';
      case 'Sắp đến hạn': return 'bg-amber-100 text-amber-700';
      case 'Sắp hết buổi': return 'bg-purple-100 text-purple-700';
      case 'Cần quản trị duyệt': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 relative pb-12">
      {/* chờ duyệt Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3 text-sm text-blue-800">
        <Bot className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
        <div>
          <p className="font-bold">Dữ liệu tài chính thật, gửi nhắc phí qua hàng chờ duyệt</p>
          <p className="opacity-90">Hóa đơn, thanh toán và phiếu chi lấy từ hệ thống. Chưa tích hợp ngân hàng; nhắc phí chỉ tạo nháp vào Hàng chờ duyệt, không gửi Zalo thật.</p>
        </div>
      </div>

      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
              <PiggyBank className="h-4 w-4" /> Tài chính
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Báo cáo Tài chính & Doanh thu</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium kháching-6 text-slate-600">
              Kiểm soát doanh thu, công nợ, hoa hồng và các khoản chờ duyệt trong cùng một màn hình vận hành.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm">
            Chế độ: Dữ liệu thật, gửi tin cần duyệt
          </div>
        </div>
      </div>

      <div className="flex max-w-full gap-1 overflow-x-auto rounded-lg border bg-slate-100 p-1 sm:w-fit">
        <button onClick={() => setActiveTab('overview')} className={`shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-white shadow-sm text-primary' : 'text-slate-600 hover:text-slate-900'}`}>Tổng quan báo cáo</button>
        <button onClick={() => setActiveTab('receipts')} className={`shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'receipts' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-600 hover:text-emerald-700'}`}>Phiếu Thu / Hóa đơn</button>
        <button onClick={() => setActiveTab('expenses')} className={`shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'expenses' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-600 hover:text-rose-700'}`}>Phiếu Chi</button>
        <button onClick={() => setActiveTab('việcs')} className={`shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'việcs' ? 'bg-white shadow-sm text-primary flex items-center gap-2' : 'text-slate-600 hover:text-slate-900 flex items-center gap-2'}`}>
          <AlertTriangle className="w-4 h-4"/> Nhắc phí & Cần duyệt
          {metrics.approvalRequiredCount > 0 && <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{metrics.approvalRequiredCount}</span>}
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <section>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-4">Số liệu tháng này</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ActionCard title="Doanh thu tháng này" metric={formatVND(metrics.currentMonthRevenue)} severity="success" reason="Tổng giá trị các khóa học bán ra trong tháng." />
              <ActionCard title="Đã thu học phí" metric={formatVND(metrics.currentMonthCollected)} severity="info" reason="Thực thu tiền mặt/chuyển khoản tháng này." />
              <ActionCard title="Công nợ còn lại" metric={formatVND(metrics.totalDebt)} severity={metrics.totalDebt > 0 ? "warning" : "success"} reason="Tổng tiền học viên còn nợ (Tất cả các tháng)." />
              <ActionCard title="Lợi nhuận ước tính" metric={formatVND(metrics.estimatedProfit)} severity="success" reason="Thực thu trừ đi các chi phí vận hành ước tính." />

              <ActionCard title="Học viên sắp hết buổi" metric={metrics.expiringSessionsCount} severity="info" reason="Chỉ hiển thị khi có dữ liệu buổi học còn lại." onClick={() => setActiveTab('receipts')} />
              <ActionCard title="Thanh toán quá hạn" metric={metrics.overdueCount} severity={metrics.overdueCount > 0 ? "critical" : "success"} reason="Số hóa đơn đã quá hạn cần thu hồi ngay." onClick={() => setActiveTab('receipts')} />
              <ActionCard title="Cần quản trị duyệt" metric={metrics.approvalRequiredCount} severity={metrics.approvalRequiredCount > 0 ? "warning" : "success"} reason="Hóa đơn còn công nợ có thể tạo nháp nhắc phí vào hàng chờ duyệt." onClick={() => setActiveTab('việcs')} />
              <ActionCard title="Hoa hồng tư vấn dự kiến" metric={formatVND(Object.values(metrics.commissionsByStaff).reduce((a, b) => a + b.commissionAmount, 0))} severity="info" reason="Chỉ tính khi có dữ liệu phân bổ doanh thu thật." />
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="bg-slate-50 border-b pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800"><Wallet className="w-5 h-5 text-emerald-600" /> Chi phí vận hành & Lợi nhuận</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <p className="text-xs text-slate-500 italic">Số liệu lấy từ phiếu chi đã lưu. Chưa kết nối kế toán/ngân hàng thật.</p>
                <div className="space-y-3">
                  {expenses.map(c => (
                    <div key={c.id} className="flex justify-between text-sm items-center">
                      <span className="text-slate-600">{c.category}</span>
                      <span className="font-medium text-slate-800">{formatVND(c.amount)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between font-bold text-slate-800">
                    <span>Tổng chi phí ước tính</span>
                    <span className="text-rose-600">-{formatVND(metrics.totalCost)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-black text-lg text-emerald-700">
                    <span>Lợi nhuận ước tính</span>
                    <span>{formatVND(metrics.estimatedProfit)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="bg-slate-50 border-b pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800"><Users className="w-5 h-5 text-blue-600" /> Hoa hồng tư vấn (tạm tính)</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <p className="text-xs text-slate-500 italic">Chưa có dữ liệu quy đổi hoa hồng thật. Khi có dữ liệu phân bổ doanh thu, bảng này sẽ tự cập nhật.</p>
                <div className="space-y-4">
                  {Object.entries(metrics.commissionsByStaff).map(([staff, data]) => (
                    <div key={staff} className="bg-slate-50 border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-800">{staff}</span>
                        <Badge variant="outline" className="bg-white">Đã đối soát</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                        <div>
                          <div className="mb-1">Học viên</div>
                          <div className="font-semibold">{data.wonStudents}</div>
                        </div>
                        <div>
                          <div className="mb-1">Thực thu</div>
                          <div className="font-semibold">{formatVND(data.collectedTuition)}</div>
                        </div>
                        <div>
                          <div className="mb-1 text-primary">Hoa hồng</div>
                          <div className="font-bold text-primary">{formatVND(data.commissionAmount)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {Object.keys(metrics.commissionsByStaff).length === 0 && (
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
                      Chưa có dữ liệu hoa hồng thật để hiển thị.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'receipts' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-emerald-600"/> Quản lý Phiếu Thu (Học phí & Doanh thu)
            </h2>
            <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500">Tạo hóa đơn đang khóa trong dùng thử</span>
          </div>
          <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Mã PT / Lớp</th>
                  <th className="px-4 py-3">Học viên / Phụ huynh</th>
                  <th className="px-4 py-3 text-right">Tổng học phí</th>
                  <th className="px-4 py-3 text-right">Đã thu (Phiếu này)</th>
                  <th className="px-4 py-3 text-right">Công nợ</th>
                  <th className="px-4 py-3">Ngày thu / Hạn thu</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">Chưa có dữ liệu phiếu thu.</td>
                  </tr>
                )}
                {records.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">PT-{record.id.slice(0,6).toUpperCase()}</div>
                      <div className="text-xs text-slate-500">{record.className}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-700">{record.studentName}</div>
                      <div className="text-xs text-slate-500">{record.parentName} • {record.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">{formatVND(record.tuitionAmount)}</td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">{formatVND(record.paidAmount)}</td>
                    <td className="px-4 py-3 text-right font-medium text-rose-600">{record.debtAmount > 0 ? formatVND(record.debtAmount) : '-'}</td>
                    <td className="px-4 py-3">
                      <div className="text-slate-700">{record.dueDate || '-'}</div>
                      {record.overdueDays > 0 && <div className="text-[10px] text-rose-600 font-bold">Trễ {record.overdueDays} ngày</div>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`border-transparent ${getStatusColor(record.status)} whitespace-nowrap`}>
                        {record.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline" className="text-xs h-7 w-full whitespace-nowrap" onClick={() => setSelectedRecord(record)}>
                        {record.approvalRequired ? 'Cần quản trị duyệt' : 'In Phiếu / Zalo'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-rose-600"/> Quản lý Phiếu Chi (Chi phí vận hành)
            </h2>
            <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => setIsExpenseModalOpen(true)}>Tạo Phiếu Chi Mới</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border rounded-xl p-4 shadow-sm border-l-4 border-l-rose-500">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Tổng chi tháng này</p>
              <p className="text-2xl font-black text-slate-800">{formatVND(metrics.totalCost)}</p>
            </div>
            <div className="bg-white border rounded-xl p-4 shadow-sm border-l-4 border-l-amber-500">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Nhắc phí cần duyệt</p>
              <p className="text-2xl font-black text-amber-600">{metrics.approvalRequiredCount}</p>
            </div>
            <div className="bg-white border rounded-xl p-4 shadow-sm border-l-4 border-l-emerald-500">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Phiếu chi đã lưu</p>
              <p className="text-2xl font-black text-emerald-600">{expenses.length}</p>
            </div>
          </div>

          <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Mã PC</th>
                  <th className="px-4 py-3">Loại chi phí</th>
                  <th className="px-4 py-3">Người nhận / Đối tác</th>
                  <th className="px-4 py-3 text-right">Số tiền</th>
                  <th className="px-4 py-3">Ngày chi</th>
                  <th className="px-4 py-3">Ghi chú</th>
                  <th className="px-4 py-3">Trạng thái duyệt</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">Chưa có dữ liệu phiếu chi.</td>
                  </tr>
                )}
                {expenses.map((cost) => (
                  <tr key={cost.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700">{cost.expenseCode}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                        {cost.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-medium">
                      {cost.recipientName}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rose-600">{formatVND(cost.amount)}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(cost.expenseDate).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs max-w-[200px] truncate">
                      {cost.note || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cost.status === 'PAID' ? "bg-emerald-100 text-emerald-700 border-none" : "bg-amber-100 text-amber-700 border-none"}>
                        {cost.status === 'PAID' ? 'Đã thanh toán' : 'Chờ duyệt'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">Đã ghi nhận</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'việcs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
          <Card className="shadow-sm h-fit">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Việc chăm sóc tài chính</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {records.filter(r => r.status !== 'Đã thu đủ').length === 0 && (
                <div className="p-8 text-center text-slate-500">Tuyệt vời! Không có hoá đơn nào cần xử lý.</div>
              )}
              {records.filter(r => r.status !== 'Đã thu đủ').map(record => (
                <div key={record.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{record.recommendedAction}</h4>
                    <p className="text-xs text-slate-500 mt-1">Học viên: <span className="font-medium text-slate-700">{record.studentName}</span> ({record.parentName})</p>
                    <div className="flex gap-2 mt-2">
                      <Badge className={record.approvalRequired ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-none' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-none'}>
                        {record.approvalRequired ? 'ADMIN_APPROVAL_REQUIRED' : 'DRAFT_ONLY'}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-white text-slate-500 border-slate-200">
                        Phụ trách: {record.owner}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => setSelectedRecord(record)}>Xử lý ngay</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Draft Preview Panel */}
          {selectedRecord ? (
            <Card className="shadow-sm border-primary/20 sticky top-4">
              <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                <div className="flex justify-between items-start">
                <CardTitle className="text-lg flex items-center gap-2 text-primary"><Bot className="w-5 h-5" /> Trợ lý nhắc phí</CardTitle>
                  <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Chỉ tạo tin chờ duyệt và ghi lịch sử. Không gửi thật Zalo/Facebook.</p>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="bg-slate-50 p-3 rounded-lg border text-sm">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <span className="text-slate-500">Phụ huynh:</span>
                    <span className="font-bold text-slate-800">{selectedRecord.parentName}</span>
                    <span className="text-slate-500">Bé:</span>
                    <span className="font-medium text-slate-800">{selectedRecord.studentName}</span>
                    <span className="text-slate-500">Trạng thái:</span>
                    <span className="font-medium text-rose-600">{selectedRecord.status}</span>
                  </div>
                  <div className="pt-2 border-t mt-2">
                    <span className="text-slate-500 block mb-1">Tone giọng gợi ý:</span>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-white border-primary text-primary">Lịch sự & Nhẹ nhàng</Badge>
                      <Badge variant="outline" className="bg-white">Nhắc nhở khéo</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nội dung tin nhắn nháp (AI Soạn):</label>
                  <textarea
                    className="w-full h-32 p-3 text-sm border rounded-lg bg-slate-50 focus:bg-white focus:ring-2 ring-primary/20 outline-none resize-none"
                    readOnly
                    value={`Dạ em chào ${selectedRecord.parentName}, em là giáo vụ bên Trung tâm.
Hiện tại bé ${selectedRecord.studentName} đang học lớp ${selectedRecord.className} ${selectedRecord.status === 'Sắp hết buổi' ? `chỉ còn ${selectedRecord.remainingSessions} buổi nữa là kết thúc khóa.` : `và còn khoản phí ${formatVND(selectedRecord.debtAmount)} đang tới hạn.`}
${selectedRecord.status === 'Sắp hết buổi' ? 'Anh/chị xem xét gia hạn khóa mới để bé không bị gián đoạn học tập nhé ạ.' : 'Anh/chị vui lòng kiểm tra và thanh toán giúp trung tâm để hoàn tất hồ sơ cho bé nha.'}
Em cảm ơn anh/chị nhiều ạ!`}
                  />
                </div>

                <div className="flex gap-2">
                  {selectedRecord.approvalRequired ? (
                    <Button
                      className="flex-1 bg-purple-600 hover:bg-purple-700 gap-2"
                      disabled={isSubmitting}
                      onClick={async () => {
                        setIsSubmitting(true);
                        try {
                          await createPaymentReminder(selectedRecord.id);
                          toast.success('Đã tạo nháp nhắc phí trong Hàng chờ duyệt');
                          setSelectedRecord(null);
                        } catch {
                          toast.error('Có lỗi xảy ra');
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                    ><UserCheck className="w-4 h-4"/> Tạo nháp chờ duyệt</Button>
                  ) : (
                    <div className="flex-1 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm font-bold text-emerald-700">
                      Không cần nhắc phí
                    </div>
                  )}
                  <Button variant="outline" onClick={() => setSelectedRecord(null)}>Hủy</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full min-h-[300px] border-2 border-dashed rounded-xl flex items-center justify-center text-slate-400 bg-slate-50/50">
              Chọn một công việc để xem nháp tin nhắn.
            </div>
          )}
        </div>
      )}

      {isExpenseModalOpen && (
        <CreateExpenseModal onClose={() => setIsExpenseModalOpen(false)} />
      )}
    </div>
  );
}
