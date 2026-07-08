import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getMyWallet } from "@/services/transfer.service";

export default async function MyPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/mypage");
  }

  const wallet = await getMyWallet(session.user.id);

  return (
    <main>
      <h1>마이페이지</h1>

      <section>
        <h2>내 정보</h2>
        <p>닉네임: {wallet.nickname}</p>
        <p>이메일: {wallet.email}</p>
        <p>잔액: {wallet.balance.toLocaleString()}원</p>

        <div className="action-row">
          <Link href="/transfers/new" className="button-link">
            송금하기
          </Link>
        </div>
      </section>

      <section>
        <h2>최근 보낸 송금</h2>

        {wallet.sentTransfers.length === 0 ? (
          <p>보낸 송금 내역이 없습니다.</p>
        ) : (
          <ul>
            {wallet.sentTransfers.map((transfer) => (
              <li key={transfer.id}>
                <p>받는 사람: {transfer.receiver.nickname}</p>
                <p>금액: -{transfer.amount.toLocaleString()}원</p>
                {transfer.memo && <p>메모: {transfer.memo}</p>}
                <p>{transfer.createdAt.toLocaleString("ko-KR")}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>최근 받은 송금</h2>

        {wallet.receivedTransfers.length === 0 ? (
          <p>받은 송금 내역이 없습니다.</p>
        ) : (
          <ul>
            {wallet.receivedTransfers.map((transfer) => (
              <li key={transfer.id}>
                <p>보낸 사람: {transfer.sender.nickname}</p>
                <p>금액: +{transfer.amount.toLocaleString()}원</p>
                {transfer.memo && <p>메모: {transfer.memo}</p>}
                <p>{transfer.createdAt.toLocaleString("ko-KR")}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}