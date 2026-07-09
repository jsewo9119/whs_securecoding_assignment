import { z } from "zod";

export const createChargeRequestSchema = z
  .object({
    amount: z
      .number()
      .int("충전 금액은 정수여야 합니다.")
      .min(1_000, "충전 금액은 1,000원 이상이어야 합니다.")
      .max(10_000_000, "한 번에 충전 가능한 금액을 초과했습니다."),

    memo: z
      .string()
      .trim()
      .max(100, "메모는 100자 이하여야 합니다.")
      .optional(),
  })
  .strict();

export type CreateChargeRequestInput = z.infer<
  typeof createChargeRequestSchema
>;
