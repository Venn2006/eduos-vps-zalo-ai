import { NextResponse } from 'next/server';
import { createAuditLog, prisma } from '@eduos/db';
import { requireRole } from '@/lib/auth';
import { protectMutation } from '@/lib/request-security';

export async function POST(req: Request) {
  try {
    const guard = await protectMutation(req, 'billing-upgrade', { limit: 5, windowMs: 60 * 1000 });
    if (guard) return guard;

    const session = await requireRole(['OWNER', 'ADMIN']);
    const tenantId = session.activeTenantId;
    const body = await req.json().catch(() => ({}));
    const plan = typeof body.plan === 'string' ? body.plan : 'PILOT_1M';
    const transferCode = typeof body.transferCode === 'string' ? body.transferCode.trim() : '';
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, subscriptionStatus: true }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Không tìm thấy trung tâm hiện tại' }, { status: 404 });
    }

    await createAuditLog(prisma, {
      tenantId,
      actorId: session.userId,
      action: 'BILLING_PAYMENT_CONFIRMATION_REQUESTED',
      entityType: 'Tenant',
      entityId: tenantId,
      beforeJson: { subscriptionStatus: tenant.subscriptionStatus },
      afterJson: { subscriptionStatus: tenant.subscriptionStatus, plan, transferCode },
      metadataJson: { source: 'billing_upgrade_api', requiresManualReview: true },
    });

    return NextResponse.json({ success: true, status: 'PENDING_REVIEW' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Bạn cần đăng nhập để gửi xác nhận thanh toán' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Chỉ chủ trung tâm hoặc quản trị mới được gửi xác nhận thanh toán' }, { status: 403 });
    }
    console.error('Upgrade billing error:', error);
    return NextResponse.json(
      { error: 'Máy chủ chưa xử lý được yêu cầu. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
