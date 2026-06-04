"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  PiggyBank, ArrowRight, CheckCircle2, Clock, AlertTriangle, Sparkles, 
  Wallet, Receipt, Users, Calculator, FileText, X, Send, UserCheck, Bot 
} from 'lucide-react';
import { MOCK_FINANCE_RECORDS, MOCK_COSTS, FinanceRecord } from '@/lib/financeDemoData';
import { calculateFinanceMetrics } from '@/lib/financeReporting';

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
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    critical: "bg-rose-50 border-rose-200 text-rose-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
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
      <p className="text-sm opacity-75 flex-1 mb-5 leading-snug">
        {reason}
      </p>
      {onClick && (
        <button onClick={onClick} className="mt-auto w-full flex items-center justify-center gap-2 bg-white/60 hover:bg-white text-sm font-bold py-2 rounded-lg border border-white/40 transition-colors shadow-sm">
          Xem chi tiết <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function FinanceWorkspaceClient() {
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'tasks'>('overview');
  const [selectedRecord, setSelectedRecord] = useState<FinanceRecord | null>(null);

  const metrics = calculateFinanceMetrics();

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
      case 'Cần admin duyệt': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 relative pb-12">
      {/* Sandbox Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3 text-sm text-blue-800">
        <Bot className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
        <div>
          <p className="font-bold">Hệ thống báo cáo tài chính mô phỏng (Sandbox / Demo)</p>
          <p className="opacity-90">Không có dữ liệu thật. Không có tích hợp ngân hàng. Các tính năng nhắc phí đều cần Admin duyệt và chỉ là tạo nháp demo.</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-900 to-teal-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3">
            <PiggyBank className="w-8 h-8 opacity-80" />
            Báo cáo Tài chính & Doanh thu
          </h1>
          <p className="text-emerald-100 max-w-2xl text-lg leading-relaxed">
            Kiểm soát doanh thu, công nợ, hoa hồng và các khoản chờ duyệt.
          </p>
        </div>
      </div>

      <div className="flex space-x-1 bg-slate-100/50 p-1 rounded-lg w-fit border">
        <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-white shadow-sm text-primary' : 'text-slate-600 hover:text-slate-900'}`}>Tổng quan báo cáo</button>
        <button onClick={() => setActiveTab('records')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'records' ? 'bg-white shadow-sm text-primary' : 'text-slate-600 hover:text-slate-900'}`}>Danh sách Học phí / Công nợ</button>
        <button onClick={() => setActiveTab('tasks')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'tasks' ? 'bg-white shadow-sm text-primary flex items-center gap-2' : 'text-slate-600 hover:text-slate-900 flex items-center gap-2'}`}>
          <AlertTriangle className="w-4 h-4"/> Nhắc phí & Cần duyệt
          {metrics.approvalRequiredCount > 0 && <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{metrics.approvalRequiredCount}</span>}
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <section>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-4">📊 Số liệu Tháng này (Demo)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ActionCard title="Doanh thu tháng này" metric={formatVND(metrics.currentMonthRevenue)} severity="success" reason="Tổng giá trị các khóa học bán ra trong tháng." />
              <ActionCard title="Đã thu học phí" metric={formatVND(metrics.currentMonthCollected)} severity="info" reason="Thực thu tiền mặt/chuyển khoản tháng này." />
              <ActionCard title="Công nợ còn lại" metric={formatVND(metrics.totalDebt)} severity={metrics.totalDebt > 0 ? "warning" : "success"} reason="Tổng tiền học viên còn nợ (Tất cả các tháng)." />
              <ActionCard title="Lợi nhuận ước tính" metric={formatVND(metrics.estimatedProfit)} severity="success" reason="Thực thu trừ đi các chi phí vận hành ước tính." />
              
              <ActionCard title="Học viên sắp hết buổi" metric={metrics.expiringSessionsCount} severity="info" reason="Số học viên còn dưới 5 buổi học." onClick={() => setActiveTab('records')} />
              <ActionCard title="Thanh toán quá hạn" metric={metrics.overdueCount} severity={metrics.overdueCount > 0 ? "critical" : "success"} reason="Số hóa đơn đã quá hạn cần thu hồi ngay." onClick={() => setActiveTab('records')} />
              <ActionCard title="Cần admin duyệt" metric={metrics.approvalRequiredCount} severity={metrics.approvalRequiredCount > 0 ? "warning" : "success"} reason="Tin nhắn nhắc phí/chăm sóc do AI tạo nháp." onClick={() => setActiveTab('tasks')} />
              <ActionCard title="Hoa hồng sale dự kiến" metric={formatVND(Object.values(metrics.commissionsByStaff).reduce((a, b) => a + b.commissionAmount, 0))} severity="info" reason="Tạm tính dựa trên thực thu." />
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="bg-slate-50 border-b pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800"><Wallet className="w-5 h-5 text-emerald-600" /> Chi phí vận hành & Lợi nhuận</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <p className="text-xs text-slate-500 italic">Số liệu demo phục vụ báo cáo, chưa kết nối kế toán/ngân hàng thật.</p>
                <div className="space-y-3">
                  {MOCK_COSTS.map(c => (
                    <div key={c.category} className="flex justify-between text-sm items-center">
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
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800"><Users className="w-5 h-5 text-blue-600" /> Hoa hồng Sale (Tạm tính)</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <p className="text-xs text-slate-500 italic">Hoa hồng chỉ là số tạm tính trong demo. Chưa kết nối payroll.</p>
                <div className="space-y-4">
                  {Object.entries(metrics.commissionsByStaff).map(([staff, data]) => (
                    <div key={staff} className="bg-slate-50 border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-800">{staff}</span>
                        <Badge variant="outline" className="bg-white">Đã đối soát demo</Badge>
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'records' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2"><Receipt className="w-6 h-6 text-primary"/> Danh sách Học phí & Công nợ</h2>
          </div>
          <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Học viên / Phụ huynh</th>
                  <th className="px-4 py-3">Lớp / Gói</th>
                  <th className="px-4 py-3 text-right">Học phí</th>
                  <th className="px-4 py-3 text-right">Đã thu</th>
                  <th className="px-4 py-3 text-right">Công nợ</th>
                  <th className="px-4 py-3">Thời hạn</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Thao tác (Demo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_FINANCE_RECORDS.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{record.studentName}</div>
                      <div className="text-xs text-slate-500">{record.parentName} • {record.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-700">{record.className}</div>
                      <div className="text-xs text-slate-500">Còn {record.remainingSessions}/{record.totalSessions} buổi</div>
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
                        {record.approvalRequired ? 'Cần admin duyệt' : 'Xem / Nháp tin'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
          <Card className="shadow-sm h-fit">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Finance Follow-up Tasks</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {MOCK_FINANCE_RECORDS.filter(r => r.status !== 'Đã thu đủ').map(record => (
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
                  <CardTitle className="text-lg flex items-center gap-2 text-primary"><Bot className="w-5 h-5" /> Trợ lý Nhắc phí (Demo)</CardTitle>
                  <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Bản demo chỉ tạo nháp, chưa gửi thật Zalo/Facebook.</p>
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
                    <Button className="flex-1 bg-purple-600 hover:bg-purple-700 gap-2"><UserCheck className="w-4 h-4"/> Duyệt & Chờ gửi (Demo)</Button>
                  ) : (
                    <Button className="flex-1 gap-2"><Send className="w-4 h-4"/> Lưu Nháp (Demo)</Button>
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
    </div>
  );
}
