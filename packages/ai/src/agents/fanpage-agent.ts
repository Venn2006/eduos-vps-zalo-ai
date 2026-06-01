import { prisma } from '@eduos/db';
import { MockAiProvider } from '../../index';

// This handles the AI classification and CRM handoff for Fanpage messages
export async function processFanpageMessage(tenantId: string, conversationId: string) {
  // 1. Fetch the conversation and its latest messages
  const conversation = await prisma.facebookConversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 5, // Last 5 messages for context
      },
      page: true,
      lead: true,
    }
  });

  if (!conversation) return;

  const latestMessage = conversation.messages[0];
  // If the last message was outbound (we sent it), don't trigger AI suggestion yet
  if (latestMessage?.direction === 'OUTBOUND') return;

  // Build transcript for AI
  const transcript = conversation.messages.reverse().map(m => 
    `${m.direction === 'INBOUND' ? 'USER' : 'PAGE'}: ${m.text}`
  ).join('\n');

  // 2. Classify intent and generate draft using AI
  const aiProvider = new MockAiProvider();
  const aiInput = {
    task: "CLASSIFY_FANPAGE_MESSAGE",
    pageName: conversation.page.pageName,
    transcript: transcript
  };

  const aiResultStr = await aiProvider.processFanpageTask(JSON.stringify(aiInput));
  
  // The MockAiProvider might return a JSON string depending on implementation, 
  // let's simulate a parsed response for CRM handoff:
  // In a real implementation, we'd parse aiResultStr.
  
  // Fake parsed result from AI
  const parsedIntent = {
    intent: "TRIAL_BOOKING", 
    urgency: "HIGH",
    needsHandoff: true,
    suggestedReply: `Chào bạn, trung tâm ${conversation.page.pageName} đã nhận được tin nhắn của bạn. Bạn muốn đăng ký học thử cho bé đúng không ạ? Bạn vui lòng để lại số điện thoại nhé!`,
    studentName: "Bé", // Extracted if available
    parentName: "Khách hàng FB",
    courseInterest: "Tiếng Anh",
  };

  // If Mock provider actually returns JSON, parse it:
  let actualResult = parsedIntent;
  try {
    actualResult = JSON.parse(aiResultStr);
  } catch (e) {
    // If it's plain string, fallback to our default structure
    actualResult.suggestedReply = aiResultStr;
  }

  // 3. Store AI Suggestion Draft
  await prisma.aiSuggestion.create({
    data: {
      tenantId,
      context: `FACEBOOK_CONVERSATION:${conversation.id}`,
      suggestion: actualResult.suggestedReply,
      isUsed: false,
    }
  });

  // 4. CRM Handoff Logic
  if (actualResult.needsHandoff) {
    let leadId = conversation.leadId;
    
    if (!leadId) {
      // Create new Lead
      const newLead = await prisma.lead.create({
        data: {
          tenantId,
          name: actualResult.parentName || 'Khách FB',
          parentName: actualResult.parentName || 'Khách FB',
          studentName: actualResult.studentName,
          stage: 'NEW',
          temperature: actualResult.urgency === 'HIGH' ? 'HOT' : 'WARM',
          notes: `Created from Fanpage inquiry. Intent: ${actualResult.intent}`,
        }
      });
      leadId = newLead.id;

      // Link Conversation to Lead
      await prisma.facebookConversation.update({
        where: { id: conversation.id },
        data: { leadId }
      });
    } else {
      // Update existing lead temperature if needed
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          temperature: actualResult.urgency === 'HIGH' ? 'HOT' : undefined
        }
      });
    }

    // Record Activity
    await prisma.leadActivity.create({
      data: {
        tenantId,
        leadId,
        type: 'FACEBOOK_INQUIRY',
        notes: `AI Classified Intent: ${actualResult.intent}. Urgency: ${actualResult.urgency}`,
      }
    });

    // Create FollowUpTask
    await prisma.followUpTask.create({
      data: {
        tenantId,
        leadId,
        description: `Phản hồi tin nhắn Fanpage (${actualResult.intent})`,
        dueDate: new Date(), // Due today
        isCompleted: false,
      }
    });
  }

  console.log(`[FANPAGE AGENT] Processed conversation ${conversation.id}. Needs handoff: ${actualResult.needsHandoff}`);
}
