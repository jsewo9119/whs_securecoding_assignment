import argon2 from "argon2";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validations/auth";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const result = loginSchema.safeParse({
            email: credentials?.email,
            password: credentials?.password,
            });

        if (!result.success) {
          return null;
        }

        const email = result.data.email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            nickname: true,
            passwordHash: true,
            role: true,
            status: true,
          },
        });

        if (!user) {
          return null;
        }

        if (user.status !== "ACTIVE") {
          return null;
        }

        const isValidPassword = await argon2.verify(
          user.passwordHash,
          result.data.password,
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.nickname,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};