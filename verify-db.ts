import { PrismaClient } from "@prisma/client";
import { MockAiProvider } from "@eduos/ai";

const prisma = new PrismaClient();

async function main() {
  const email = "omlis@example.com";
  let user = await prisma.user.findUnique({ where: { email }});
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: "ceo-1",
        email,
        passwordHash: "x"
      }
    });
  }

  const tenant = await prisma.tenant.findFirst();
  if (!tenant) throw new Error("No tenant found");

  const tenantId = tenant.id;

  console.log("=== BEFORE COUNTS ===");
  console.log("AiCommandThread:", await prisma.aiCommandThread.count());
  console.log("AiCommandMessage:", await prisma.aiCommandMessage.count());
  console.log("AiCommandRun:", await prisma.aiCommandRun.count());
  console.log("AiAgentFinding:", await prisma.aiAgentFinding.count());
  console.log("AiActionDraft:", await prisma.aiActionDraft.count());

  console.log("\n=== EXECUTING CEO CHAT REQUEST ===");
  const messageText = "Hôm nay có vấn đề gì nghiêm trọng không?";
  console.log("User Message:", messageText);

  // 1. Thread
  const thread = await prisma.aiCommandThread.create({
    data: {
      tenantId,
      userId: user.id,
      title: messageText.substring(0, 50)
    }
  });

  // 2. Message
  await prisma.aiCommandMessage.create({
    data: {
      tenantId,
      threadId: thread.id,
      role: "USER",
      content: messageText
    }
  });

  // 3. Process
  const aiProvider = new MockAiProvider();
  const response = await aiProvider.answerCeoQuery(messageText, tenantId);

  // 4. Save Response
  const aiMessage = await prisma.aiCommandMessage.create({
    data: {
      tenantId,
      threadId: thread.id,
      role: "ASSISTANT",
      content: response.answer,
      evidenceJson: response.evidenceJson ? JSON.stringify(response.evidenceJson) : null,
      suggestedActionsJson: response.suggestedActionsJson ? JSON.stringify(response.suggestedActionsJson) : null,
      severity: response.severity
    }
  });

  // 5. Run Info
  const run = await prisma.aiCommandRun.create({
    data: {
      tenantId,
      messageId: aiMessage.id,
      sourceModule: response.sourceModule,
      rawResultJson: response.rawResultJson ? JSON.stringify(response.rawResultJson) : null,
    }
  });

  // 6. Findings
  if (response.severity !== "LOW") {
    await prisma.aiAgentFinding.create({
      data: {
        tenantId,
        runId: run.id,
        findingType: "RISK",
        description: response.answer,
        severity: response.severity
      }
    });
  }

  // 7. Action Drafts
  const suggestedActions = response.suggestedActionsJson as any[];
  if (suggestedActions && suggestedActions.length > 0) {
    for (const action of suggestedActions) {
      await prisma.aiActionDraft.create({
        data: {
          tenantId,
          messageId: aiMessage.id,
          actionType: action.actionType,
          payloadJson: JSON.stringify(action.payload),
          status: "PENDING_APPROVAL"
        }
      });
    }
  }

  console.log("\n=== AFTER COUNTS ===");
  console.log("AiCommandThread:", await prisma.aiCommandThread.count());
  console.log("AiCommandMessage:", await prisma.aiCommandMessage.count());
  console.log("AiCommandRun:", await prisma.aiCommandRun.count());
  console.log("AiAgentFinding:", await prisma.aiAgentFinding.count());
  console.log("AiActionDraft:", await prisma.aiActionDraft.count());

  console.log("\n=== SAMPLE PERSISTED RECORD SUMMARY ===");
  console.log("Thread Title:", thread.title);
  console.log("Thread User ID:", thread.userId);
  console.log("Thread Tenant ID:", thread.tenantId);
  console.log("Assistant Message Severity:", aiMessage.severity);
  console.log("Source Module:", run.sourceModule);
  console.log("Command Runs Created: 1 (ID: " + run.id + ")");
  
  const findingCount = await prisma.aiAgentFinding.count({ where: { runId: run.id } });
  console.log("Findings Created:", findingCount);
  
  const drafts = await prisma.aiActionDraft.findMany({ where: { messageId: aiMessage.id } });
  console.log("Action Drafts Created:", drafts.length);
  if (drafts.length > 0) {
    drafts.forEach((d, i) => {
      console.log(`  Draft ${i+1}: ActionType=${d.actionType}, Status=${d.status}, Payload=${d.payloadJson}`);
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
