import argon2 from "argon2";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { SignupInput } from "@/lib/validations/auth";

export class DuplicateUserError extends Error {}

export async function createUser(input: SignupInput) {
  const email = input.email.trim().toLowerCase();
  const nickname = input.nickname.trim();

  const passwordHash = await argon2.hash(input.password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  try {
    return await prisma.user.create({
      data: {
        email,
        nickname,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        createdAt: true,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new DuplicateUserError("이미 사용 중인 이메일 또는 닉네임입니다.");
    }

    throw error;
  }
}