-- AlterTable
ALTER TABLE "ConversationParticipant" ADD COLUMN "lastReadAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "DirectMessage" ADD COLUMN "deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "DirectMessage" ADD COLUMN "replyToId" TEXT;

-- CreateIndex
CREATE INDEX "DirectMessage_conversationId_createdAt_idx" ON "DirectMessage"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "DirectMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
