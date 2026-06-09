import { NextResponse } from 'next/server';
import { endOfDay, startOfDay } from 'date-fns';
import { prisma } from '@eduos/db';

import { requireAuthenticated } from '@/lib/auth';
import { protectMutation } from '@/lib/request-security';

type Payload = {
  message?: unknown;
};

const formatMoney = (value: number) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
}).format(value);

export async function POST(request: Request) {
  const guard = await protectMutation(request, 'ceo-chat', { limit: 30, windowMs: 60 * 1000 });
  if (guard) return guard;

  const session = await requireAuthenticated();
  const tenantId = session.activeTenantId;
  const { message } = (await request.json().catch(() => ({}))) as Payload;
  const text = typeof message === 'string' ? message.trim().slice(0, 500) : '';

  if (!text) {
    return NextResponse.json({ error: 'Vui lòng nhập câu hỏi.' }, { status: 400 });
  }

  const today = new Date();
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);
  const now = new Date();

  const [
    leadsToday,
    hotLeads,
    trialsToday,
    openTasks,
    overdueTasks,
    overdueInvoices,
    pendingOutbox,
    zaloInboundToday,
    facebookInboundToday,
    students,
    classes,
  ] = await Promise.all([
    prisma.lead.count({ where: { tenantId, deletedAt: null, createdAt: { gte: dayStart, lte: dayEnd } } }),
    prisma.lead.count({ where: { tenantId, deletedAt: null, temperature: 'HOT' } }),
    prisma.trialBooking.count({ where: { tenantId, trialDate: { gte: dayStart, lte: dayEnd } } }),
    prisma.followUpTask.count({ where: { tenantId, isCompleted: false } }),
    prisma.followUpTask.count({ where: { tenantId, isCompleted: false, dueDate: { lt: now } } }),
    prisma.invoice.aggregate({
      where: { tenantId, deletedAt: null, status: { in: ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'] } },
      _sum: { remainingAmount: true },
      _count: { _all: true },
    }),
    prisma.sandboxOutboxItem.count({ where: { tenantId, status: { in: ['MOCK_READY', 'MOCK_QUEUED', 'MOCK_SENDING'] } } }),
    prisma.zaloMessage.count({ where: { tenantId, direction: 'INBOUND', createdAt: { gte: dayStart, lte: dayEnd } } }),
    prisma.facebookMessage.count({ where: { tenantId, direction: 'INBOUND', createdAt: { gte: dayStart, lte: dayEnd } } }),
    prisma.student.count({ where: { tenantId, deletedAt: null } }),
    prisma.class.count({ where: { tenantId, deletedAt: null } }),
  ]);

  const lower = text.toLowerCase();
  const unreadMessages = zaloInboundToday + facebookInboundToday;
  const debtAmount = overdueInvoices._sum.remainingAmount || 0;

  let answer = 'Hôm nay có ' + leadsToday + ' khách mới, ' + trialsToday + ' lịch học thử, ' + openTasks + ' việc chăm sóc đang mở và ' + overdueTasks + ' việc quá hạn.';

  if (lower.includes('doanh thu') || lower.includes('học phí') || lower.includes('công nợ') || lower.includes('tiền')) {
    answer = 'Tài chính cần chú ý: còn ' + overdueInvoices._count._all + ' hóa đơn chưa tất toán, tổng công nợ ' + formatMoney(debtAmount) + '. Nên ưu tiên xử lý các hóa đơn quá hạn trước khi nhắc phí diện rộng.';
  } else if (lower.includes('khách') || lower.includes('tuyển sinh') || lower.includes('học thử')) {
    answer = 'Tuyển sinh hôm nay: ' + leadsToday + ' khách mới, ' + hotLeads + ' khách nóng và ' + trialsToday + ' lịch học thử. Ưu tiên gọi khách nóng và kiểm tra các lịch học thử trong ngày.';
  } else if (lower.includes('tin nhắn') || lower.includes('zalo') || lower.includes('facebook') || lower.includes('phụ huynh')) {
    answer = 'Tin nhắn hôm nay: có ' + unreadMessages + ' tin mới từ Zalo/Facebook và ' + pendingOutbox + ' tin nháp đang chờ duyệt. Nên duyệt tin nháp trước khi gửi cho phụ huynh.';
  } else if (lower.includes('học viên') || lower.includes('lớp')) {
    answer = 'Vận hành lớp học hiện có ' + students + ' học viên và ' + classes + ' lớp. Nếu cần kiểm tra rủi ro nghỉ học, hãy xem danh sách học viên cần chăm sóc và các việc quá hạn.';
  } else if (overdueTasks > 0 || debtAmount > 0 || pendingOutbox > 0) {
    answer = 'Có việc cần xử lý: ' + overdueTasks + ' việc quá hạn, ' + formatMoney(debtAmount) + ' công nợ và ' + pendingOutbox + ' tin nháp chờ duyệt. Nên xử lý theo thứ tự: việc quá hạn, công nợ, tin nháp.';
  }

  await prisma.aiInteraction.create({
    data: {
      tenantId,
      provider: 'MOCK',
      purpose: 'CEO_DAILY_ASSISTANT',
      inputJson: JSON.stringify({ message: text }),
      outputJson: JSON.stringify({ answer }),
      status: 'COMPLETED',
    },
  });

  return NextResponse.json({ answer });
}
