import { ProductStatus, PurchaseStatus, UserStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

export class PurchaseNotFoundError extends Error {}
export class PurchaseForbiddenError extends Error {}
export class PurchaseNotAllowedError extends Error {}
export class PurchaseInsufficientBalanceError extends Error {}

export async function getCheckoutProduct(productId: string, buyerId: string) {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      status: {
        not: ProductStatus.BLOCKED,
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      status: true,
      seller: {
        select: {
          id: true,
          nickname: true,
          status: true,
        },
      },
    },
  });

  if (!product) {
    throw new PurchaseNotFoundError("상품을 찾을 수 없습니다.");
  }

  if (product.seller.id === buyerId) {
    throw new PurchaseNotAllowedError("자신의 상품은 구매할 수 없습니다.");
  }

  const buyer = await prisma.user.findUnique({
    where: {
      id: buyerId,
    },
    select: {
      id: true,
      balance: true,
      status: true,
    },
  });

  if (!buyer || buyer.status !== UserStatus.ACTIVE) {
    throw new PurchaseNotAllowedError("구매할 수 없는 사용자입니다.");
  }

  return {
    product,
    buyer,
  };
}

export async function reservePurchase(productId: string, buyerId: string) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: {
        id: productId,
        status: ProductStatus.SELLING,
      },
      select: {
        id: true,
        sellerId: true,
        title: true,
        price: true,
      },
    });

    if (!product) {
      throw new PurchaseNotFoundError("구매 가능한 상품을 찾을 수 없습니다.");
    }

    if (product.sellerId === buyerId) {
      throw new PurchaseNotAllowedError("자신의 상품은 구매할 수 없습니다.");
    }

    const buyer = await tx.user.findUnique({
      where: {
        id: buyerId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!buyer || buyer.status !== UserStatus.ACTIVE) {
      throw new PurchaseNotAllowedError("구매할 수 없는 사용자입니다.");
    }

    const seller = await tx.user.findUnique({
      where: {
        id: product.sellerId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!seller || seller.status !== UserStatus.ACTIVE) {
      throw new PurchaseNotAllowedError("판매자 상태로 인해 구매할 수 없습니다.");
    }

    const decrementResult = await tx.user.updateMany({
      where: {
        id: buyer.id,
        balance: {
          gte: product.price,
        },
      },
      data: {
        balance: {
          decrement: product.price,
        },
      },
    });

    if (decrementResult.count !== 1) {
      throw new PurchaseInsufficientBalanceError("잔액이 부족합니다.");
    }

    const purchase = await tx.purchase.create({
      data: {
        productId: product.id,
        buyerId: buyer.id,
        sellerId: seller.id,
        amount: product.price,
      },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    const updatedProduct = await tx.product.update({
      where: {
        id: product.id,
      },
      data: {
        status: ProductStatus.RESERVED,
      },
      select: {
        id: true,
        title: true,
        price: true,
        status: true,
      },
    });

    return {
      purchase,
      product: updatedProduct,
    };
  });
}

export async function confirmPurchase(purchaseId: string, buyerId: string) {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUnique({
      where: {
        id: purchaseId,
      },
      select: {
        id: true,
        productId: true,
        buyerId: true,
        sellerId: true,
        amount: true,
        status: true,
        product: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new PurchaseNotFoundError("구매 내역을 찾을 수 없습니다.");
    }

    if (purchase.buyerId !== buyerId) {
      throw new PurchaseForbiddenError("구매 확정 권한이 없습니다.");
    }

    if (purchase.status !== PurchaseStatus.RESERVED) {
      throw new PurchaseNotAllowedError("구매 확정할 수 없는 상태입니다.");
    }

    await tx.user.update({
      where: {
        id: purchase.sellerId,
      },
      data: {
        balance: {
          increment: purchase.amount,
        },
      },
    });

    await tx.product.update({
      where: {
        id: purchase.productId,
      },
      data: {
        status: ProductStatus.SOLD,
      },
    });

    const updatedPurchase = await tx.purchase.update({
      where: {
        id: purchase.id,
      },
      data: {
        status: PurchaseStatus.COMPLETED,
        completedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        completedAt: true,
      },
    });

    const transfer = await tx.transfer.create({
      data: {
        senderId: purchase.buyerId,
        receiverId: purchase.sellerId,
        amount: purchase.amount,
        memo: `${purchase.product.title} 구매 확정`,
      },
      select: {
        id: true,
        amount: true,
        createdAt: true,
      },
    });

    return {
      purchase: updatedPurchase,
      transfer,
    };
  });
}

export async function requestPurchaseCancel(
  purchaseId: string,
  buyerId: string,
) {
  const purchase = await prisma.purchase.findUnique({
    where: {
      id: purchaseId,
    },
    select: {
      id: true,
      buyerId: true,
      status: true,
    },
  });

  if (!purchase) {
    throw new PurchaseNotFoundError("구매 내역을 찾을 수 없습니다.");
  }

  if (purchase.buyerId !== buyerId) {
    throw new PurchaseForbiddenError("구매 취소 요청 권한이 없습니다.");
  }

  if (purchase.status !== PurchaseStatus.RESERVED) {
    throw new PurchaseNotAllowedError("구매 취소 요청을 할 수 없는 상태입니다.");
  }

  return prisma.purchase.update({
    where: {
      id: purchase.id,
    },
    data: {
      status: PurchaseStatus.CANCEL_REQUESTED,
      cancelRequestedAt: new Date(),
    },
    select: {
      id: true,
      status: true,
      cancelRequestedAt: true,
    },
  });
}

export async function approvePurchaseCancel(
  purchaseId: string,
  sellerId: string,
) {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUnique({
      where: {
        id: purchaseId,
      },
      select: {
        id: true,
        productId: true,
        buyerId: true,
        sellerId: true,
        amount: true,
        status: true,
      },
    });

    if (!purchase) {
      throw new PurchaseNotFoundError("구매 내역을 찾을 수 없습니다.");
    }

    if (purchase.sellerId !== sellerId) {
      throw new PurchaseForbiddenError("구매 취소 동의 권한이 없습니다.");
    }

    if (purchase.status !== PurchaseStatus.CANCEL_REQUESTED) {
      throw new PurchaseNotAllowedError("구매 취소 동의를 할 수 없는 상태입니다.");
    }

    await tx.user.update({
      where: {
        id: purchase.buyerId,
      },
      data: {
        balance: {
          increment: purchase.amount,
        },
      },
    });

    await tx.product.update({
      where: {
        id: purchase.productId,
      },
      data: {
        status: ProductStatus.SELLING,
      },
    });

    return tx.purchase.update({
      where: {
        id: purchase.id,
      },
      data: {
        status: PurchaseStatus.CANCELED,
        canceledAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        canceledAt: true,
      },
    });
  });
}
