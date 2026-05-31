import { prisma, SalesQueries } from '@eduos/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { PageShell } from '@/components/layout/PageShell';
import SalesCallingClient from './SalesCallingClient';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_super_secret_for_development");

export default async function SalesCallingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return <div>Unauthorized</div>;

  let session: any;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    session = payload;
  } catch {
    return <div>Invalid token</div>;
  }

  const salesQueries = new SalesQueries(prisma);
  const leads = await salesQueries.getSalesCallingQueueForTenant(session.activeTenantId, session.userId, session.role);

  return (
    <PageShell title="Hàng Đợi Telesale" description="Gọi điện và lưu trạng thái nhanh chóng.">
      <SalesCallingClient initialLeads={leads} saleId={session.userId} />
    </PageShell>
  );
}
