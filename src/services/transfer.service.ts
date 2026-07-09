import { UserStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { CreateTransferInput } from "@/lib/validations/transfer";

export class TransferNotAllowedError extends Error {}
export class ReceiverNotFoundError extends Error {}
export class InsufficientBalanceError extends Error {}

export async function createTransfer(
  senderId: string,
  input: CreateTransferInput,
) {
  if (senderId === input.receiverId) {
    throw new TransferNotAllowedError("자기 자신에게는 송금할 수 없습니다.");
  }

  return prisma.$transaction(async (tx) => {
    const sender = await tx.user.findUnique({
    where: {
        id: senderId,
    },
    select: {
        id: true,
        status: true,
    },
    });

    if (!sender || sender.status !== UserStatus.ACTIVE) {
      throw new TransferNotAllowedError("송금할 수 없는 사용자입니다.");
    }

    const receiver = await tx.user.findUnique({
      where: {
        id: input.receiverId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!receiver || receiver.status !== UserStatus.ACTIVE) {
      throw new ReceiverNotFoundError("받는 사용자를 찾을 수 없습니다.");
    }

    const decrementResult = await tx.user.updateMany({
        where: {
            id: sender.id,
            balance: {
            gte: input.amount,
            },
        },
        data: {
            balance: {
            decrement: input.amount,
            },
        },
        });

        if (decrementResult.count !== 1) {
        throw new InsufficientBalanceError("잔액이 부족합니다.");
        }
    await tx.user.update({
      where: {
        id: receiver.id,
      },
      data: {
        balance: {
          increment: input.amount,
        },
      },
    });

    return tx.transfer.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        amount: input.amount,
        memo: input.memo,
      },
      select: {
        id: true,
        amount: true,
        memo: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            nickname: true,
          },
        },
        receiver: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });
  });
}

export async function getMyWallet(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      nickname: true,
      balance: true,
      chargeRequests: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        select: {
          id: true,
          amount: true,
          memo: true,
          status: true,
          createdAt: true,
          approvedAt: true,
          rejectedAt: true,
        },
      },
      sentTransfers: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        select: {
          id: true,
          amount: true,
          memo: true,
          createdAt: true,
          receiver: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      },
      receivedTransfers: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        select: {
          id: true,
          amount: true,
          memo: true,
          createdAt: true,
          sender: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      },
      purchases: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          seller: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      },
      sales: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          buyer: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new TransferNotAllowedError("사용자를 찾을 수 없습니다.");
  }

  return user;
}
