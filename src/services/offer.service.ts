import {
  OfferStatus,
  ProductStatus,
  UserStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { CreateOfferInput } from "@/lib/validations/message";

export class OfferNotFoundError extends Error {}
export class OfferForbiddenError extends Error {}
export class OfferNotAllowedError extends Error {}

export async function createOffer(
  productId: string,
  buyerId: string,
  input: CreateOfferInput,
) {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      status: ProductStatus.SELLING,
    },
    select: {
      id: true,
      title: true,
      sellerId: true,
      price: true,
      isNegotiable: true,
      seller: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!product) {
    throw new OfferNotFoundError("흥정할 상품을 찾을 수 없습니다.");
  }

  if (!product.isNegotiable) {
    throw new OfferNotAllowedError("이 상품은 흥정이 불가능합니다.");
  }

  if (product.sellerId === buyerId) {
    throw new OfferNotAllowedError("자신의 상품에는 흥정할 수 없습니다.");
  }

  if (product.seller.status === UserStatus.BLOCKED) {
    throw new OfferNotAllowedError("차단된 판매자의 상품에는 흥정할 수 없습니다.");
  }

  const buyer = await prisma.user.findUnique({
    where: {
      id: buyerId,
    },
    select: {
      status: true,
    },
  });

  if (!buyer || buyer.status === UserStatus.BLOCKED) {
    throw new OfferNotAllowedError("흥정 요청을 보낼 수 없는 사용자입니다.");
  }

  return prisma.$transaction(async (tx) => {
    const conversation = await tx.conversation.upsert({
      where: {
        productId_sellerId_buyerId: {
          productId: product.id,
          sellerId: product.sellerId,
          buyerId,
        },
      },
      update: {},
      create: {
        productId: product.id,
        sellerId: product.sellerId,
        buyerId,
      },
      select: {
        id: true,
        productId: true,
        sellerId: true,
        buyerId: true,
      },
    });

    const offer = await tx.offer.create({
      data: {
        productId: product.id,
        buyerId,
        sellerId: product.sellerId,
        conversationId: conversation.id,
        proposedPrice: input.proposedPrice,
        message: input.message,
      },
      select: {
        id: true,
        proposedPrice: true,
        message: true,
        status: true,
        createdAt: true,
      },
    });

    const messageParts = [
      `[흥정 요청] ${product.title} 상품을 ${input.proposedPrice.toLocaleString()}원에 제안했습니다.`,
    ];

    if (input.message) {
      messageParts.push(input.message);
    }

    const sentMessage = await tx.message.create({
      data: {
        conversationId: conversation.id,
        senderId: buyerId,
        content: messageParts.join("\n"),
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    });

    return {
      conversation,
      offer,
      sentMessage,
    };
  });
}

export async function acceptOffer(offerId: string, sellerId: string) {
  const offer = await prisma.offer.findUnique({
    where: {
      id: offerId,
    },
    select: {
      id: true,
      productId: true,
      sellerId: true,
      buyerId: true,
      conversationId: true,
      proposedPrice: true,
      status: true,
      product: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
  });

  if (!offer) {
    throw new OfferNotFoundError("흥정 요청을 찾을 수 없습니다.");
  }

  if (offer.sellerId !== sellerId) {
    throw new OfferForbiddenError("흥정 요청을 수락할 권한이 없습니다.");
  }

  if (offer.status !== OfferStatus.PENDING) {
    throw new OfferNotAllowedError("이미 처리된 흥정 요청입니다.");
  }

  if (offer.product.status !== ProductStatus.SELLING) {
    throw new OfferNotAllowedError("판매중인 상품의 흥정만 수락할 수 있습니다.");
  }

  return prisma.$transaction(async (tx) => {
    const updatedProduct = await tx.product.update({
      where: {
        id: offer.productId,
      },
      data: {
        price: offer.proposedPrice,
      },
      select: {
        id: true,
        title: true,
        price: true,
        status: true,
      },
    });

    const acceptedOffer = await tx.offer.update({
      where: {
        id: offer.id,
      },
      data: {
        status: OfferStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
      select: {
        id: true,
        proposedPrice: true,
        status: true,
        acceptedAt: true,
      },
    });

    if (offer.conversationId) {
      await tx.message.create({
        data: {
          conversationId: offer.conversationId,
          senderId: sellerId,
          content: `[흥정 수락] 상품 가격이 ${offer.proposedPrice.toLocaleString()}원으로 변경되었습니다.`,
        },
      });
    }

    return {
      offer: acceptedOffer,
      product: updatedProduct,
    };
  });
}
