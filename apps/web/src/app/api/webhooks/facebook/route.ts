import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@eduos/db';

function getFacebookVerifyToken() {
  return process.env.FACEBOOK_VERIFY_TOKEN?.trim() || null;
}

function getFacebookAppSecret() {
  return process.env.FACEBOOK_APP_SECRET?.trim() || null;
}

function allowUnsignedFacebookWebhook() {
  return process.env.NODE_ENV !== 'production' && process.env.ALLOW_UNSIGNED_FACEBOOK_WEBHOOK === 'true';
}

function hasValidSignature(rawBody: string, signature: string, appSecret: string) {
  const expectedHash = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
  const expectedSignature = `sha256=${expectedHash}`;
  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

type FacebookWebhookPayload = {
  object?: string;
  entry?: Array<{
    id?: string;
    messaging?: Array<{
      sender?: { id?: string };
      recipient?: { id?: string };
      timestamp?: number;
      message?: {
        mid?: string;
        text?: string;
      };
    }>;
  }>;
};

export async function GET(request: Request) {
  const verifyToken = getFacebookVerifyToken();
  if (!verifyToken) {
    console.warn('[FB WEBHOOK] FACEBOOK_VERIFY_TOKEN is not configured. Rejecting verification.');
    return new NextResponse('Verify token not configured', { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const appSecret = getFacebookAppSecret();

    if (!appSecret) {
      if (!allowUnsignedFacebookWebhook()) {
        console.warn('[FB WEBHOOK] FACEBOOK_APP_SECRET is not configured. Rejecting unsigned webhook.');
        return new NextResponse('App secret not configured', { status: 503 });
      }
    } else {
      if (!signature) {
        console.warn('[FB WEBHOOK] Missing signature. Rejecting.');
        return new NextResponse('Missing signature', { status: 401 });
      }

      if (!hasValidSignature(rawBody, signature, appSecret)) {
        console.warn('[FB WEBHOOK] Invalid signature detected. Rejecting.');
        return new NextResponse('Invalid signature', { status: 403 });
      }
    }

    const body = JSON.parse(rawBody) as FacebookWebhookPayload;

    if (body.object !== 'page') {
      return new NextResponse('Not Found', { status: 404 });
    }

    for (const entry of body.entry || []) {
      const pageId = entry.id;
      if (!pageId) continue;

      const page = await prisma.facebookPage.findUnique({
        where: { pageId },
      });

      if (!page) {
        console.warn(`[FB WEBHOOK] Received event for unknown page: ${pageId}`);
        continue;
      }

      const tenantId = page.tenantId;

      for (const messagingEvent of entry.messaging || []) {
        const senderId = messagingEvent.sender?.id;
        const message = messagingEvent.message;
        const messageId = message?.mid;

        if (!senderId || !messageId || !message?.text) continue;

        const existingEvent = await prisma.facebookWebhookEvent.findFirst({
          where: { tenantId, eventId: messageId },
        });

        if (existingEvent) {
          console.log(`[FB WEBHOOK] Duplicate event ignored: ${messageId}`);
          continue;
        }

        await prisma.facebookWebhookEvent.create({
          data: {
            tenantId,
            eventId: messageId,
            payloadJson: JSON.stringify(messagingEvent),
          },
        });

        const conversation = await prisma.facebookConversation.upsert({
          where: {
            tenantId_pageId_psid: {
              tenantId,
              pageId: page.id,
              psid: senderId,
            },
          },
          create: {
            tenantId,
            pageId: page.id,
            psid: senderId,
            lastMessage: new Date(messagingEvent.timestamp || Date.now()),
          },
          update: {
            lastMessage: new Date(messagingEvent.timestamp || Date.now()),
          },
        });

        await prisma.facebookMessage.create({
          data: {
            tenantId,
            conversationId: conversation.id,
            messageId,
            direction: 'INBOUND',
            text: message.text,
            payloadJson: JSON.stringify(message),
          },
        });

        processFanpageMessageInBackground(tenantId, conversation.id).catch(console.error);
      }
    }

    return new NextResponse('EVENT_RECEIVED', { status: 200 });
  } catch (error) {
    console.error('[FB WEBHOOK] Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function processFanpageMessageInBackground(tenantId: string, conversationId: string) {
  const { processFanpageMessage } = await import('@eduos/ai/src/agents/fanpage-agent');
  await processFanpageMessage(tenantId, conversationId);
}
