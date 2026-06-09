import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import {  getCurrentTenantOrThrow , getSession } from '@/lib/auth';
import { getFinanceSummaryForTenant, getInvoicesForTenant } from '@eduos/api/src/services/finance.service';

export default async function PaymentsPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/payments")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();
  const summary = await getFinanceSummaryForTenant(tenantId);
  const invoices = await getInvoicesForTenant(tenantId);

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader 
        title="Quản lý Học phí" 
        description="Theo dõi hóa đơn, thanh toán và công nợ"
        action={<Link href="/workspaces/finance" className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90">Mở workspace tài chính</Link>}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100 py-3">
            <CardTitle className="text-sm text-slate-500 font-medium">Thu hôm nay</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-slate-800">{summary.collectedToday.toLocaleString()} đ</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100 py-3">
            <CardTitle className="text-sm text-slate-500 font-medium">Thu tháng này</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-slate-800">{summary.collectedThisMonth.toLocaleString()} đ</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-warning/30">
          <CardHeader className="bg-warning/5 border-b border-warning/10 py-3">
            <CardTitle className="text-sm text-warning font-medium">Chưa thu (Tổng)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-warning-strong">{summary.totalUnpaid.toLocaleString()} đ</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-destructive/30">
          <CardHeader className="bg-destructive/5 border-b border-destructive/10 py-3">
            <CardTitle className="text-sm text-destructive font-medium">Quá hạn</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-destructive-strong">{summary.totalOverdue.toLocaleString()} đ</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Danh sách Hóa đơn</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã HĐ</TableHead>
                <TableHead>Học viên</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Đã thu</TableHead>
                <TableHead>Còn nợ</TableHead>
                <TableHead>Hạn thu</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-slate-500 py-4">Không có hóa đơn nào.</TableCell>
                </TableRow>
              )}
              {invoices.map(inv => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium text-slate-700">{inv.invoiceCode}</TableCell>
                  <TableCell>
                    <div className="font-medium">{inv.student.name}</div>
                    {inv.guardian && <div className="text-xs text-slate-500">PH: {inv.guardian.name}</div>}
                  </TableCell>
                  <TableCell>{inv.totalAmount.toLocaleString()} đ</TableCell>
                  <TableCell className="text-success">{inv.paidAmount.toLocaleString()} đ</TableCell>
                  <TableCell className="text-warning-strong">{inv.remainingAmount.toLocaleString()} đ</TableCell>
                  <TableCell>{inv.dueDate.toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>
                    {inv.status === "PAID" && <Badge variant="success">Đã thanh toán</Badge>}
                    {inv.status === "UNPAID" && <Badge variant="secondary">Chưa thanh toán</Badge>}
                    {inv.status === "PARTIALLY_PAID" && <Badge variant="warning">Đóng một phần</Badge>}
                    {inv.status === "OVERDUE" && <Badge variant="destructive">Quá hạn</Badge>}
                    {inv.status === "CANCELLED" && <Badge variant="outline">Đã hủy</Badge>}
                    {inv.status === "DRAFT" && <Badge variant="outline">Nháp</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href="/workspaces/finance" className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Đối soát</Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
