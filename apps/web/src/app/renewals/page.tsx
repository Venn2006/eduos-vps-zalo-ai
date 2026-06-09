import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { prisma } from '@eduos/db';
import {  getCurrentTenantOrThrow , getSession } from '@/lib/auth';
import { Repeat } from 'lucide-react';

export default async function RenewalsPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/renewals")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();
  const candidates = await prisma.renewalCandidate.findMany({
    where: { tenantId },
    include: {
      student: true,
      class: true,
      course: true,
      enrollment: true
    },
    orderBy: { expectedEndDate: 'asc' }
  });

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader 
        title="Quản lý Tái phí" 
        description="Theo dõi học viên sắp hết khóa và tư vấn gia hạn"
      />

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-primary" /> Danh sách Tư vấn tái phí
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Học viên</TableHead>
                <TableHead>Lớp / Khóa hiện tại</TableHead>
                <TableHead>Số buổi còn lại</TableHead>
                <TableHead>Ngày dự kiến KT</TableHead>
                <TableHead>Đề xuất học tiếp</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500 py-4">Chưa có học viên nào đến hạn tái phí.</TableCell>
                </TableRow>
              )}
              {candidates.map(candidate => (
                <TableRow key={candidate.id}>
                  <TableCell className="font-medium text-slate-700">{candidate.student.name}</TableCell>
                  <TableCell>
                    {candidate.class?.classCode || candidate.course?.name || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={candidate.remainingSessions <= 2 ? "destructive" : "warning"}>
                      {candidate.remainingSessions} buổi
                    </Badge>
                  </TableCell>
                  <TableCell>{candidate.expectedEndDate ? candidate.expectedEndDate.toLocaleDateString('vi-VN') : "N/A"}</TableCell>
                  <TableCell className="text-primary font-medium">{candidate.suggestedRenewalCourse || "N/A"}</TableCell>
                  <TableCell>
                    {candidate.status === "NEW" && <Badge variant="secondary">Mới</Badge>}
                    {candidate.status === "CONTACTED" && <Badge variant="outline" className="border-info text-info">Đã liên hệ</Badge>}
                    {candidate.status === "INTERESTED" && <Badge variant="warning">Đang quan tâm</Badge>}
                    {candidate.status === "RENEWED" && <Badge variant="success">Đã tái phí</Badge>}
                    {candidate.status === "LOST" && <Badge variant="destructive">Bỏ học</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">Theo dõi trong CRM/Finance</span>
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
