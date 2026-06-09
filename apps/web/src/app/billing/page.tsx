import React from 'react';
import { prisma } from '@eduos/db';

import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import { canAccessRoute } from '@/lib/rbac';
import { BillingClient } from './BillingClient';

type BillingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const planLabel = (plan?: string | string[]) => {
  const rawPlan = Array.isArray(plan) ? plan[0] : plan;
  if (rawPlan === 'basic') return 'Gói cơ bản';
  if (rawPlan === 'enterprise') return 'Gói doanh nghiệp';
  return 'Gói trải nghiệm 1 triệu';
};

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, '/billing')) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const params = searchParams ? await searchParams : {};
  const selectedPlanLabel = planLabel(params.plan);

  const tenantId = await getCurrentTenantOrThrow();
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      name: true,
      subscriptionStatus: true,
      trialEndsAt: true,
    },
  });

  const isExpired = tenant?.subscriptionStatus === 'EXPIRED'
    || (tenant?.trialEndsAt && new Date(tenant.trialEndsAt) < new Date() && tenant.subscriptionStatus === 'TRIAL');

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">Thanh toán trải nghiệm</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            {isExpired ? 'Gia hạn quyền dùng hệ thống' : 'Trả 1 triệu để dùng thật trước'}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Khách có thể trải nghiệm bằng dữ liệu thật trước khi cam kết gói triển khai lớn. Sau khi chuyển khoản hoặc gửi yêu cầu nhận QR, đội ngũ sẽ đối soát và kích hoạt thủ công.
          </p>
        </div>

        <BillingClient
          tenantId={tenantId}
          tenantName={tenant?.name || 'trung tâm'}
          currentStatus={tenant?.subscriptionStatus || 'TRIAL'}
          selectedPlanLabel={selectedPlanLabel}
          paymentConfig={{
            bankName: process.env.BILLING_BANK_NAME,
            accountNumber: process.env.BILLING_BANK_ACCOUNT_NUMBER,
            accountHolder: process.env.BILLING_BANK_ACCOUNT_HOLDER,
            qrImageUrl: process.env.BILLING_QR_IMAGE_URL,
            supportContact: process.env.BILLING_SUPPORT_CONTACT,
          }}
        />
      </div>
    </div>
  );
}
