import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { ChargeRequestForm } from "./ChargeRequestForm";

export default async function ChargePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/wallet/charge");
  }

  return (
    <main>
      <nav>
        <Link href="/mypage">마이페이지로</Link>
      </nav>

      <section className="hero">
        <p className="eyebrow">Wallet</p>
        <h1>지갑 충전 요청</h1>
        <p>
          충전 요청을 만들면 관리자가 확인 후 승인합니다. 승인된 금액만 내
          잔액에 반영됩니다.
        </p>
      </section>

      <ChargeRequestForm />
    </main>
  );
}
