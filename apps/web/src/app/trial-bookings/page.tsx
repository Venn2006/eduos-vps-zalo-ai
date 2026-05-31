import React from 'react';
import { prisma, SalesQueries } from '@eduos/db';
import { getCurrentTenantOrThrow } from '@/lib/auth';
import TrialBookingsClient from './TrialBookingsClient';

export default async function TrialBookingsPage() {
  const tenantId = await getCurrentTenantOrThrow();

  const salesQueries = new SalesQueries(prisma);
  const bookings = await salesQueries.getTrialBookingsForTenant(tenantId);

  return <TrialBookingsClient initialBookings={bookings} />;
}
