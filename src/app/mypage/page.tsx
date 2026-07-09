import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getMyWallet } from "@/services/transfer.service";
import { PurchaseActionButton } from "@/app/purchases/PurchaseActionButton";

export default async function MyPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/mypage");
  }

  const wallet = await getMyWallet(session.user.id);

  return (
    <main>
      <h1>마이페이지</h1>

      <section className="wallet-card">
        <h2>내 정보</h2>
        <p>닉네임: {wallet.nickname}</p>
        <p>이메일: {wallet.email}</p>
        <p className="wallet-balance">{wallet.balance.toLocaleString()}원</p>

        <div className="action-row">
          <Link href="/wallet/charge" className="button-link">
            충전 요청
          </Link>
          <Link href="/transfers/new" className="button-link">
            송금하기
          </Link>
        </div>
      </section>

      <section>
        <h2>최근 충전 요청</h2>

        {wallet.chargeRequests.length === 0 ? (
          <p>충전 요청 내역이 없습니다.</p>
        ) : (
          <ul>
            {wallet.chargeRequests.map((chargeRequest) => (
              <li key={chargeRequest.id}>
                <p>금액: +{chargeRequest.amount.toLocaleString()}원</p>
                <p>상태: {chargeRequest.status}</p>
                {chargeRequest.memo && <p>메모: {chargeRequest.memo}</p>}
                <p>요청일: {chargeRequest.createdAt.toLocaleString("ko-KR")}</p>
                {chargeRequest.approvedAt && (
                  <p>승인일: {chargeRequest.approvedAt.toLocaleString("ko-KR")}</p>
                )}
                {chargeRequest.rejectedAt && (
                  <p>거절일: {chargeRequest.rejectedAt.toLocaleString("ko-KR")}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>내 구매 내역</h2>

        {wallet.purchases.length === 0 ? (
          <p>구매 내역이 없습니다.</p>
        ) : (
          <ul>
            {wallet.purchases.map((purchase) => (
              <li key={purchase.id}>
                <Link href={`/products/${purchase.product.id}`}>
                  <h2>{purchase.product.title}</h2>
                </Link>
                <p>판매자: {purchase.seller.nickname}</p>
                <p>금액: {purchase.amount.toLocaleString()}원</p>
                <p>구매 상태: {purchase.status}</p>
                <p>상품 상태: {purchase.product.status}</p>
                <p>{purchase.createdAt.toLocaleString("ko-KR")}</p>

                {purchase.status === "RESERVED" && (
                  <div className="action-row">
                    <PurchaseActionButton
                      purchaseId={purchase.id}
                      action="confirm"
                      label="구매 확정"
                      confirmMessage="상품을 수령했고 구매를 확정하시겠습니까?"
                    />
                    <PurchaseActionButton
                      purchaseId={purchase.id}
                      action="cancel-request"
                      label="구매 취소 요청"
                      confirmMessage="판매자에게 구매 취소를 요청하시겠습니까?"
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>내 판매 내역</h2>

        {wallet.sales.length === 0 ? (
          <p>판매 내역이 없습니다.</p>
        ) : (
          <ul>
            {wallet.sales.map((sale) => (
              <li key={sale.id}>
                <Link href={`/products/${sale.product.id}`}>
                  <h2>{sale.product.title}</h2>
                </Link>
                <p>구매자: {sale.buyer.nickname}</p>
                <p>금액: {sale.amount.toLocaleString()}원</p>
                <p>판매 상태: {sale.status}</p>
                <p>상품 상태: {sale.product.status}</p>
                <p>{sale.createdAt.toLocaleString("ko-KR")}</p>

                {sale.status === "CANCEL_REQUESTED" && (
                  <div className="action-row">
                    <PurchaseActionButton
                      purchaseId={sale.id}
                      action="cancel-approve"
                      label="취소 동의"
                      confirmMessage="구매 취소에 동의하고 구매자에게 환불하시겠습니까?"
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
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
