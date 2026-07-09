import { ChargeRequestStatus, UserStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { CreateChargeRequestInput } from "@/lib/validations/charge";

export class ChargeRequestNotFoundError extends Error {}
export class ChargeRequestNotAllowedError extends Error {}

export async function createChargeRequest(
  userId: string,
  input: CreateChargeRequestInput,
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!user || user.status !== UserStatus.ACTIVE) {
    throw new ChargeRequestNotAllowedError("충전 요청을 만들 수 없는 사용자입니다.");
  }

  return prisma.chargeRequest.create({
    data: {
      userId: user.id,
      amount: input.amount,
      memo: input.memo,
    },
    select: {
      id: true,
      amount: true,
      memo: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function listAdminChargeRequests() {
  return prisma.chargeRequest.findMany({
    orderBy: [
      {
        status: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      amount: true,
      memo: true,
      status: true,
      createdAt: true,
      approvedAt: true,
      rejectedAt: true,
      user: {
        select: {
          id: true,
          email: true,
          nickname: true,
          status: true,
          balance: true,
        },
      },
    },
  });
}

export async function approveChargeRequest(chargeRequestId: string) {
  const chargeRequest = await prisma.chargeRequest.findUnique({
    where: {
      id: chargeRequestId,
    },
    select: {
      id: true,
      userId: true,
      amount: true,
      status: true,
      user: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!chargeRequest) {
    throw new ChargeRequestNotFoundError("충전 요청을 찾을 수 없습니다.");
  }

  if (chargeRequest.status !== ChargeRequestStatus.PENDING) {
    throw new ChargeRequestNotAllowedError("이미 처리된 충전 요청입니다.");
  }

  if (chargeRequest.user.status !== UserStatus.ACTIVE) {
    throw new ChargeRequestNotAllowedError("차단된 사용자의 충전 요청은 승인할 수 없습니다.");
  }

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id: chargeRequest.userId,
      },
      data: {
        balance: {
          increment: chargeRequest.amount,
        },
      },
    });

    return tx.chargeRequest.update({
      where: {
        id: chargeRequest.id,
      },
      data: {
        status: ChargeRequestStatus.APPROVED,
        approvedAt: new Date(),
      },
      select: {
        id: true,
        amount: true,
        status: true,
        approvedAt: true,
      },
    });
  });
}

export async function rejectChargeRequest(chargeRequestId: string) {
  const chargeRequest = await prisma.chargeRequest.findUnique({
    where: {
      id: chargeRequestId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!chargeRequest) {
    throw new ChargeRequestNotFoundError("충전 요청을 찾을 수 없습니다.");
  }

  if (chargeRequest.status !== ChargeRequestStatus.PENDING) {
    throw new ChargeRequestNotAllowedError("이미 처리된 충전 요청입니다.");
  }

  return prisma.chargeRequest.update({
    where: {
      id: chargeRequest.id,
    },
    data: {
      status: ChargeRequestStatus.REJECTED,
      rejectedAt: new Date(),
    },
    select: {
      id: true,
      amount: true,
      status: true,
      rejectedAt: true,
    },
  });
}
