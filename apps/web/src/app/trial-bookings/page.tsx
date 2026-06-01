import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { prisma, SalesQueries } from '@eduos/db';
import {  getCurrentTenantOrThrow , getSession } from '@/lib/auth';
import TrialBookingsClient from './TrialBookingsClient';

export default async function TrialBookingsPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/trial-bookings")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();

  const salesQueries = new SalesQueries(prisma);
  const bookings = await salesQueries.getTrialBookingsForTenant(tenantId);

  return <TrialBookingsClient initialBookings={bookings} />;
}
