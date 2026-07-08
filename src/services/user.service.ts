import { UserStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function listTransferReceivers(currentUserId: string) {
  return prisma.user.findMany({
    where: {
      id: {
        not: currentUserId,
      },
      status: UserStatus.ACTIVE,
    },
    orderBy: {
      nickname: "asc",
    },
    select: {
      id: true,
      nickname: true,
      email: true,
    },
  });
}