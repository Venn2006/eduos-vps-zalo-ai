import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { prisma } from '@eduos/db';
import { getCurrentTenantOrThrow, getSession } from '@/lib/auth';
import TrialBookingsClient from './TrialBookingsClient';

export default async function TrialBookingsPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/trial-bookings")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const tenantId = await getCurrentTenantOrThrow();
  const isOwnerOrAdmin = authSession?.role === 'OWNER' || authSession?.role === 'ADMIN';

  if (!isOwnerOrAdmin && !authSession?.userId) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  const bookings = await prisma.trialBooking.findMany({
    where: {
      tenantId,
      ...(isOwnerOrAdmin ? {} : { assignedSaleId: authSession?.userId }),
    },
    orderBy: { trialDate: 'desc' },
    include: {
      course: { select: { name: true } },
      lead: { select: { name: true, stage: true, temperature: true, assignedToId: true } },
    },
  });

  const bookingRows = bookings.map((booking) => ({
    id: booking.id,
    status: booking.status,
    trialDate: booking.trialDate.toISOString(),
    studentName: booking.studentNameSnapshot || booking.lead.name,
    parentName: booking.parentNameSnapshot || '',
    phone: booking.phoneSnapshot || '',
    courseName: booking.course?.name || '',
    leadStage: booking.lead.stage,
    leadTemperature: booking.lead.temperature,
  }));

  return <TrialBookingsClient initialBookings={bookingRows} />;
}
