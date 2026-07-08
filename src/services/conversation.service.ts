import { ProductStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { SendMessageInput, StartConversationInput } from "@/lib/validations/message";

export class ConversationNotAllowedError extends Error {}
export class ProductNotFoundForConversationError extends Error {}

export async function startConversation(
  buyerId: string,
  input: StartConversationInput,
) {
  const product = await prisma.product.findFirst({
    where: {
      id: input.productId,
      status: {
        not: ProductStatus.BLOCKED,
      },
    },
    select: {
      id: true,
      sellerId: true,
    },
  });

  if (!product) {
    throw new ProductNotFoundForConversationError(
      "문의할 상품을 찾을 수 없습니다.",
    );
  }

  if (product.sellerId === buyerId) {
    throw new ConversationNotAllowedError(
      "자신의 상품에는 문의할 수 없습니다.",
    );
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

    const message = await tx.message.create({
      data: {
        conversationId: conversation.id,
        senderId: buyerId,
        content: input.content,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    });

    return {
      conversation,
      message,
    };
  });
}

export class ConversationNotFoundError extends Error {}
export class ConversationForbiddenError extends Error {}

export async function getConversationDetail(
  conversationId: string,
  userId: string,
) {
  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    select: {
      id: true,
      sellerId: true,
      buyerId: true,
      createdAt: true,
      updatedAt: true,
      product: {
        select: {
          id: true,
          title: true,
          price: true,
          status: true,
        },
      },
      seller: {
        select: {
          id: true,
          nickname: true,
        },
      },
      buyer: {
        select: {
          id: true,
          nickname: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          sender: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      },
    },
  });

  if (!conversation) {
    throw new ConversationNotFoundError("대화를 찾을 수 없습니다.");
  }

  const isParticipant =
    conversation.sellerId === userId || conversation.buyerId === userId;

  if (!isParticipant) {
    throw new ConversationForbiddenError("대화를 볼 권한이 없습니다.");
  }

  return conversation;
}

export async function sendMessageToConversation(
  conversationId: string,
  senderId: string,
  input: SendMessageInput,
) {
  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    select: {
      id: true,
      sellerId: true,
      buyerId: true,
    },
  });

  if (!conversation) {
    throw new ConversationNotFoundError("대화를 찾을 수 없습니다.");
  }

  const isParticipant =
    conversation.sellerId === senderId || conversation.buyerId === senderId;

  if (!isParticipant) {
    throw new ConversationForbiddenError("메시지를 보낼 권한이 없습니다.");
  }

  return prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId,
      content: input.content,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      sender: {
        select: {
          id: true,
          nickname: true,
        },
      },
    },
  });
}

export async function listMyConversations(userId: string) {
  return prisma.conversation.findMany({
    where: {
      OR: [{ sellerId: userId }, { buyerId: userId }],
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      sellerId: true,
      buyerId: true,
      updatedAt: true,
      product: {
        select: {
          id: true,
          title: true,
          price: true,
          status: true,
        },
      },
      seller: {
        select: {
          id: true,
          nickname: true,
        },
      },
      buyer: {
        select: {
          id: true,
          nickname: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          content: true,
          createdAt: true,
          sender: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      },
    },
  });
}