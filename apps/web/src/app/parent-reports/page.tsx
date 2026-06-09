import Link from 'next/link';
import { prisma } from '@eduos/db';

import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { canAccessRoute } from '@/lib/rbac';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';

type RiskFlag = {
  severity?: string;
  type?: string;
};

export default async function ParentReportsPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, '/parent-reports')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();
  const reports = await prisma.weeklyParentReport.findMany({
    where: { tenantId },
    include: {
      student: true,
      class: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-6 pb-10">
      <SectionHeader
        title="Báo cáo phụ huynh"
        description="Danh sách báo cáo tuần lấy từ DB của tenant. Việc duyệt nội dung nằm trong workspace học vụ; chưa gửi tin thật ra Zalo."
        action={<Link href="/homework" className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90">Mở workspace học vụ</Link>}
      />

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Học viên</TableHead>
              <TableHead>Lớp</TableHead>
              <TableHead>Tuần</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Rủi ro</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-slate-500">Chưa có báo cáo phụ huynh nào.</TableCell>
              </TableRow>
            )}
            {reports.map((report) => {
              const riskTags = parseRiskFlags(report.riskFlagsJson)
                .map((risk) => `[${risk.severity || 'INFO'}] ${risk.type || 'RISK'}`)
                .join(', ');

              return (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.student.name}</TableCell>
                  <TableCell>{report.class ? report.class.classCode : 'N/A'}</TableCell>
                  <TableCell>{`${report.weekStart.toLocaleDateString('vi-VN')} - ${report.weekEnd.toLocaleDateString('vi-VN')}`}</TableCell>
                  <TableCell>{translateReportStatus(report.status)}</TableCell>
                  <TableCell className="text-rose-600">{riskTags || 'Không có'}</TableCell>
                  <TableCell>
                    <Link href="/homework" className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      Duyệt trong học vụ
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function parseRiskFlags(raw: string): RiskFlag[] {
  try {
    const parsed = JSON.parse(raw || '[]') as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is RiskFlag => Boolean(item) && typeof item === 'object');
  } catch {
    return [];
  }
}

function translateReportStatus(status: string) {
  const labels: Record<string, string> = {
    DRAFT: 'Nháp',
    TEACHER_REVIEW: 'Chờ giáo viên duyệt',
    APPROVED: 'Đã duyệt',
    SENT: 'Đã gửi',
    FAILED: 'Lỗi gửi',
  };

  return labels[status] || status;
}
