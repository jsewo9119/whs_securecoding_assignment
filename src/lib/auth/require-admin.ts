import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Role } from "@/generated/prisma/client";
import { authOptions } from "@/lib/auth/options";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== Role.ADMIN) {
    redirect("/");
  }

  return session;
}