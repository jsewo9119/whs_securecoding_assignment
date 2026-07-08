import { prisma } from "@/lib/db/prisma";
import type { CreateProductInput, UpdateProductInput, UpdateProductStatusInput } from "@/lib/validations/product";
import { ProductStatus } from "@/generated/prisma/client";

export async function createProduct(
  sellerId: string,
  input: CreateProductInput,
) {
  return prisma.product.create({
    data: {
      sellerId,
      title: input.title,
      description: input.description,
      price: input.price,
      imageUrl: input.imageUrl,
      isNegotiable: input.isNegotiable,
    },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      imageUrl: true,
      status: true,
      isNegotiable: true,
      createdAt: true,
      seller: {
        select: {
          id: true,
          nickname: true,
        },
      },
    },
  });
}

type ListProductsParams = {
  q?: string;
  page?: number;
  pageSize?: number;
};

export async function listProducts(params: ListProductsParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const q = params.q?.trim();

  return prisma.product.findMany({
    where: {
      status: {
        not: ProductStatus.BLOCKED,
      },
      ...(q
        ? {
            OR: [
              {
                title: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      imageUrl: true,
      status: true,
      isNegotiable: true,
      createdAt: true,
      seller: {
        select: {
          id: true,
          nickname: true,
        },
      },
    },
  });
}

export async function getPublicProductById(productId: string) {
  return prisma.product.findFirst({
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
      imageUrl: true,
      status: true,
      isNegotiable: true,
      createdAt: true,
      updatedAt: true,
      seller: {
        select: {
          id: true,
          nickname: true,
        },
      },
    },
  });
}

export class ProductNotFoundError extends Error {}
export class ProductForbiddenError extends Error {}

export async function updateProduct(
  productId: string,
  sellerId: string,
  input: UpdateProductInput,
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      sellerId: true,
      status: true,
    },
  });

  if (!product) {
    throw new ProductNotFoundError("상품을 찾을 수 없습니다.");
  }

  if (product.sellerId !== sellerId) {
    throw new ProductForbiddenError("상품을 수정할 권한이 없습니다.");
  }

  if (product.status === ProductStatus.BLOCKED) {
    throw new ProductForbiddenError("차단된 상품은 수정할 수 없습니다.");
  }

  return prisma.product.update({
    where: { id: productId },
    data: input,
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      imageUrl: true,
      status: true,
      isNegotiable: true,
      updatedAt: true,
    },
  });
}

export async function deleteProduct(productId: string, sellerId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      sellerId: true,
      status: true,
    },
  });

  if (!product) {
    throw new ProductNotFoundError("상품을 찾을 수 없습니다.");
  }

  if (product.sellerId !== sellerId) {
    throw new ProductForbiddenError("상품을 삭제할 권한이 없습니다.");
  }

  if (product.status === ProductStatus.BLOCKED) {
    throw new ProductForbiddenError("차단된 상품은 삭제할 수 없습니다.");
  }

  return prisma.product.delete({
    where: { id: productId },
    select: {
      id: true,
    },
  });
}

export async function getProductForEdit(productId: string, sellerId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      sellerId: true,
      title: true,
      description: true,
      price: true,
      imageUrl: true,
      status: true,
      isNegotiable: true,
    },
  });

  if (!product) {
    throw new ProductNotFoundError("상품을 찾을 수 없습니다.");
  }

  if (product.sellerId !== sellerId) {
    throw new ProductForbiddenError("상품을 수정할 권한이 없습니다.");
  }

  if (product.status === ProductStatus.BLOCKED) {
    throw new ProductForbiddenError("차단된 상품은 수정할 수 없습니다.");
  }

  return product;
}

export async function updateProductStatus(
  productId: string,
  sellerId: string,
  input: UpdateProductStatusInput,
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      sellerId: true,
      status: true,
    },
  });

  if (!product) {
    throw new ProductNotFoundError("상품을 찾을 수 없습니다.");
  }

  if (product.sellerId !== sellerId) {
    throw new ProductForbiddenError("상품 상태를 변경할 권한이 없습니다.");
  }

  if (product.status === ProductStatus.BLOCKED) {
    throw new ProductForbiddenError("차단된 상품은 상태를 변경할 수 없습니다.");
  }

  return prisma.product.update({
    where: { id: productId },
    data: {
      status: input.status,
    },
    select: {
      id: true,
      status: true,
      updatedAt: true,
    },
  });
}
