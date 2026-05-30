/*
  Warnings:

  - A unique constraint covering the columns `[tokenHash]` on the table `ZaloConnectorSession` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ZaloConnectorSession" ADD COLUMN     "tokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ZaloConnectorSession_tokenHash_key" ON "ZaloConnectorSession"("tokenHash");
