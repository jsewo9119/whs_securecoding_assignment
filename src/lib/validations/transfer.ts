import { z } from "zod";

export const createTransferSchema = z
  .object({
    receiverId: z.string().cuid("받는 사용자 ID가 올바르지 않습니다."),

    amount: z
      .number()
      .int("송금 금액은 정수여야 합니다.")
      .min(1, "송금 금액은 1원 이상이어야 합니다.")
      .max(10_000_000, "한 번에 송금 가능한 금액을 초과했습니다."),

    memo: z
      .string()
      .trim()
      .max(100, "메모는 100자 이하여야 합니다.")
      .optional(),
  })
  .strict();

export type CreateTransferInput = z.infer<typeof createTransferSchema>;