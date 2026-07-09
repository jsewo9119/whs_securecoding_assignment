-- CreateEnum
CREATE TYPE "ChargeRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "ChargeRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "memo" TEXT,
    "status" "ChargeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),

    CONSTRAINT "ChargeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChargeRequest_userId_createdAt_idx" ON "ChargeRequest"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ChargeRequest_status_createdAt_idx" ON "ChargeRequest"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "ChargeRequest" ADD CONSTRAINT "ChargeRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
