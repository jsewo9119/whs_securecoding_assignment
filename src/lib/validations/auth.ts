import { z } from "zod";

export const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .email("올바른 이메일 형식이 아닙니다.")
    .max(254, "이메일이 너무 깁니다."),

  nickname: z
    .string()
    .trim()
    .min(2, "닉네임은 2자 이상이어야 합니다.")
    .max(20, "닉네임은 20자 이하여야 합니다.")
    .regex(
      /^[가-힣a-zA-Z0-9_]+$/,
      "닉네임에는 한글, 영문, 숫자, 밑줄만 사용할 수 있습니다.",
    ),

  password: z
    .string()
    .min(12, "비밀번호는 12자 이상이어야 합니다.")
    .max(128, "비밀번호는 128자 이하여야 합니다."),
})
.strict();

export type SignupInput = z.infer<typeof signupSchema>;