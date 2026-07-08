import { z } from "zod";

export const startConversationSchema = z
  .object({
    productId: z.string().cuid("올바른 상품 ID가 아닙니다."),

    content: z
      .string()
      .trim()
      .min(1, "메시지를 입력해주세요.")
      .max(1000, "메시지는 1000자 이하여야 합니다."),
  })
  .strict();

export type StartConversationInput = z.infer<
  typeof startConversationSchema
>;

export const sendMessageSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(1, "메시지를 입력해주세요.")
      .max(1000, "메시지는 1000자 이하여야 합니다."),
  })
  .strict();

export type SendMessageInput = z.infer<typeof sendMessageSchema>;