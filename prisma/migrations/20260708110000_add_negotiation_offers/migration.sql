-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "isNegotiable" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "conversationId" TEXT,
    "proposedPrice" INTEGER NOT NULL,
    "message" TEXT,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Offer_productId_status_idx" ON "Offer"("productId", "status");

-- CreateIndex
CREATE INDEX "Offer_buyerId_createdAt_idx" ON "Offer"("buyerId", "createdAt");

-- CreateIndex
CREATE INDEX "Offer_sellerId_createdAt_idx" ON "Offer"("sellerId", "createdAt");

-- CreateIndex
CREATE INDEX "Offer_conversationId_idx" ON "Offer"("conversationId");

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
