import { z } from "zod";
import { ProductStatus } from "@/generated/prisma/client";

export const createProductSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "상품명은 2자 이상이어야 합니다.")
      .max(80, "상품명은 80자 이하여야 합니다."),

    description: z
      .string()
      .trim()
      .min(5, "상품 설명은 5자 이상이어야 합니다.")
      .max(2000, "상품 설명은 2000자 이하여야 합니다."),

    price: z
      .number()
      .int("가격은 정수여야 합니다.")
      .min(0, "가격은 0원 이상이어야 합니다.")
      .max(100_000_000, "가격이 너무 큽니다."),

    imageUrl: z
      .string()
      .trim()
      .url("올바른 이미지 URL 형식이 아닙니다.")
      .max(2048, "이미지 URL이 너무 깁니다.")
      .optional(),

    isNegotiable: z.boolean().optional().default(false),
  })
  .strict();

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial().strict();

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const updateProductStatusSchema = z
  .object({
    status: z.enum([
      ProductStatus.SELLING,
      ProductStatus.RESERVED,
      ProductStatus.SOLD,
    ]),
  })
  .strict();

export type UpdateProductStatusInput = z.infer<
  typeof updateProductStatusSchema
>;
