import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { listTransferReceivers } from "@/services/user.service";
import { NewTransferForm } from "./NewTransferForm";

export default async function NewTransferPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/transfers/new");
  }

  const receivers = await listTransferReceivers(session.user.id);

  return (
    <main>
      <h1>송금하기</h1>
      <NewTransferForm receivers={receivers} />
    </main>
  );
}