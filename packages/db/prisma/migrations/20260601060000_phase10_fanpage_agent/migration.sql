-- AlterTable
ALTER TABLE "FacebookConversation" ADD COLUMN     "leadId" TEXT;

-- AddForeignKey
ALTER TABLE "FacebookConversation" ADD CONSTRAINT "FacebookConversation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

