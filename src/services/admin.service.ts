import { ProductStatus, UserStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

export class AdminActionNotAllowedError extends Error {}
export class AdminTargetNotFoundError extends Error {}

export async function listAdminUsers() {
  return prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      email: true,
      nickname: true,
      role: true,
      status: true,
      balance: true,
      createdAt: true,
    },
  });
}

export async function updateUserStatusByAdmin(
  adminId: string,
  userId: string,
  status: UserStatus,
) {
  if (adminId === userId) {
    throw new AdminActionNotAllowedError("자기 자신은 차단할 수 없습니다.");
  }

  const targetUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  });

  if (!targetUser) {
    throw new AdminTargetNotFoundError("사용자를 찾을 수 없습니다.");
  }

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status,
    },
    select: {
      id: true,
      email: true,
      nickname: true,
      role: true,
      status: true,
    },
  });
}

export async function listAdminProducts() {
  return prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      status: true,
      createdAt: true,
      seller: {
        select: {
          id: true,
          nickname: true,
          email: true,
          status: true,
        },
      },
    },
  });
}

export async function updateProductStatusByAdmin(
  productId: string,
  status: ProductStatus,
) {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
    },
  });

  if (!product) {
    throw new AdminTargetNotFoundError("상품을 찾을 수 없습니다.");
  }

  return prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      status,
    },
    select: {
      id: true,
      title: true,
      status: true,
    },
  });
}