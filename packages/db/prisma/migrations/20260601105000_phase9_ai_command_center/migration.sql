-- CreateTable
CREATE TABLE "AiCommandThread" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiCommandThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiCommandMessage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "evidenceJson" TEXT,
    "suggestedActionsJson" TEXT,
    "severity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiCommandMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiCommandRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "sourceModule" TEXT NOT NULL,
    "dbQueryContext" TEXT,
    "rawResultJson" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMs" INTEGER,

    CONSTRAINT "AiCommandRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiAgentFinding" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "findingType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT,
    "metadataJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiAgentFinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiActionDraft" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "approvedById" TEXT,
    "executedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiActionDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiCommandThread_tenantId_userId_idx" ON "AiCommandThread"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "AiCommandMessage_tenantId_threadId_idx" ON "AiCommandMessage"("tenantId", "threadId");

-- CreateIndex
CREATE INDEX "AiCommandMessage_tenantId_createdAt_idx" ON "AiCommandMessage"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "AiCommandRun_tenantId_messageId_idx" ON "AiCommandRun"("tenantId", "messageId");

-- CreateIndex
CREATE INDEX "AiCommandRun_tenantId_sourceModule_idx" ON "AiCommandRun"("tenantId", "sourceModule");

-- CreateIndex
CREATE INDEX "AiAgentFinding_tenantId_runId_idx" ON "AiAgentFinding"("tenantId", "runId");

-- CreateIndex
CREATE INDEX "AiAgentFinding_tenantId_severity_idx" ON "AiAgentFinding"("tenantId", "severity");

-- CreateIndex
CREATE INDEX "AiActionDraft_tenantId_messageId_idx" ON "AiActionDraft"("tenantId", "messageId");

-- CreateIndex
CREATE INDEX "AiActionDraft_tenantId_status_idx" ON "AiActionDraft"("tenantId", "status");

-- CreateIndex
CREATE INDEX "AiActionDraft_approvedById_idx" ON "AiActionDraft"("approvedById");

-- AddForeignKey
ALTER TABLE "AiCommandThread" ADD CONSTRAINT "AiCommandThread_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiCommandThread" ADD CONSTRAINT "AiCommandThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiCommandMessage" ADD CONSTRAINT "AiCommandMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "AiCommandThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiCommandMessage" ADD CONSTRAINT "AiCommandMessage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiCommandRun" ADD CONSTRAINT "AiCommandRun_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "AiCommandMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiCommandRun" ADD CONSTRAINT "AiCommandRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAgentFinding" ADD CONSTRAINT "AiAgentFinding_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AiCommandRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAgentFinding" ADD CONSTRAINT "AiAgentFinding_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiActionDraft" ADD CONSTRAINT "AiActionDraft_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "AiCommandMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiActionDraft" ADD CONSTRAINT "AiActionDraft_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiActionDraft" ADD CONSTRAINT "AiActionDraft_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

