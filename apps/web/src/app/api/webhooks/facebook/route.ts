import { NextResponse } from 'next/server';
import { prisma } from '@eduos/db';

const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'eduos_fb_verify_token_xyz';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[FB WEBHOOK] Verified!');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (appSecret) {
      if (!signature) {
        console.warn('[FB WEBHOOK] Missing signature but FACEBOOK_APP_SECRET is configured. Rejecting.');
        return new NextResponse('Missing signature', { status: 401 });
      }
      
      const expectedHash = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
      const expectedSignature = `sha256=${expectedHash}`;

      if (signature !== expectedSignature) {
        console.warn('[FB WEBHOOK] Invalid signature detected. Rejecting.');
        return new NextResponse('Invalid signature', { status: 403 });
      }
    } else {
      console.warn('[FB WEBHOOK] WARNING: FACEBOOK_APP_SECRET is not configured. Signature enforcement is disabled. This is ONLY safe for local development.');
    }

    const body: any = JSON.parse(rawBody);

    if (body.object === 'page') {
      for (const entry of body.entry) {
        const pageId = entry.id;

        // Verify page is known
        const page = await prisma.facebookPage.findUnique({
          where: { pageId }
        });

        if (!page) {
          console.warn(`[FB WEBHOOK] Received event for unknown page: ${pageId}`);
          continue;
        }

        const tenantId = page.tenantId;

        for (const messagingEvent of entry.messaging) {
          const senderId = messagingEvent.sender.id;
          const recipientId = messagingEvent.recipient.id;
          const message = messagingEvent.message;

          if (message && message.text) {
            const messageId = message.mid;

            // Check idempotency
            const existingEvent = await prisma.facebookWebhookEvent.findFirst({
              where: { tenantId, eventId: messageId }
            });

            if (existingEvent) {
              console.log(`[FB WEBHOOK] Duplicate event ignored: ${messageId}`);
              continue;
            }

            // Save event
            await prisma.facebookWebhookEvent.create({
              data: {
                tenantId,
                eventId: messageId,
                payloadJson: JSON.stringify(messagingEvent),
              }
            });

            // Upsert conversation
            const conversation = await prisma.facebookConversation.upsert({
              where: {
                tenantId_pageId_psid: {
                  tenantId,
                  pageId: page.id,
                  psid: senderId,
                }
              },
              create: {
                tenantId,
                pageId: page.id,
                psid: senderId,
                lastMessage: new Date(messagingEvent.timestamp),
              },
              update: {
                lastMessage: new Date(messagingEvent.timestamp),
              }
            });

            // Create message
            await prisma.facebookMessage.create({
              data: {
                tenantId,
                conversationId: conversation.id,
                messageId: messageId,
                direction: 'INBOUND',
                text: message.text,
                payloadJson: JSON.stringify(message),
              }
            });

            // Trigger AI processing in background (we don't await this so webhook responds fast)
            processFanpageMessageInBackground(tenantId, conversation.id).catch(console.error);
          }
        }
      }

      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    }

    return new NextResponse('Not Found', { status: 404 });
  } catch (error) {
    console.error('[FB WEBHOOK] Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Background handler proxy
async function processFanpageMessageInBackground(tenantId: string, conversationId: string) {
  // We'll call the actual AI agent here
  const { processFanpageMessage } = await import('@eduos/ai/src/agents/fanpage-agent');
  await processFanpageMessage(tenantId, conversationId);
}
