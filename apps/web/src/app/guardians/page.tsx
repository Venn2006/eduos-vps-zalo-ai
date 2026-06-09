import React from 'react';
import Link from 'next/link';
import { prisma } from '@eduos/db';

import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { PageShell } from '@/components/layout/PageShell';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { canAccessRoute } from '@/lib/rbac';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';

export default async function GuardiansPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, '/guardians')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();
  const guardians = await prisma.guardian.findMany({
    where: { tenantId, deletedAt: null },
    include: {
      students: {
        where: { deletedAt: null },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  });

  return (
    <PageShell
      title="Phụ huynh"
      description="Danh sách phụ huynh lấy từ DB của tenant hiện tại. Thêm phụ huynh mới thông qua luồng tạo lead hoặc hồ sơ học viên."
    >
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phụ huynh</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Học viên liên kết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guardians.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center text-slate-500">Chưa có phụ huynh nào.</TableCell>
              </TableRow>
            )}
            {guardians.map((guardian) => (
              <TableRow key={guardian.id}>
                <TableCell className="font-medium text-slate-900">{guardian.name}</TableCell>
                <TableCell>{guardian.phone}</TableCell>
                <TableCell>{guardian.email || '-'}</TableCell>
                <TableCell>
                  {guardian.students.length === 0 ? (
                    <span className="text-slate-500">Chưa gắn học viên</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {guardian.students.map((student) => (
                        <Link key={student.id} href={`/students/${student.id}`} className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">
                          {student.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PageShell>
  );
}
