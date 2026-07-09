import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listAdminChargeRequests } from "@/services/charge.service";
import { ChargeRequestActionButton } from "./ChargeRequestActionButton";

export default async function AdminChargesPage() {
  await requireAdmin();
  const chargeRequests = await listAdminChargeRequests();

  return (
    <main>
      <h1>충전 요청 관리</h1>

      <nav>
        <Link href="/admin">관리자 홈</Link>
      </nav>

      {chargeRequests.length === 0 ? (
        <p>충전 요청이 없습니다.</p>
      ) : (
        <ul>
          {chargeRequests.map((chargeRequest) => (
            <li key={chargeRequest.id}>
              <h2>{chargeRequest.user.nickname}</h2>
              <p>이메일: {chargeRequest.user.email}</p>
              <p>사용자 상태: {chargeRequest.user.status}</p>
              <p>현재 잔액: {chargeRequest.user.balance.toLocaleString()}원</p>
              <p>요청 금액: {chargeRequest.amount.toLocaleString()}원</p>
              {chargeRequest.memo && <p>메모: {chargeRequest.memo}</p>}
              <p>요청 상태: {chargeRequest.status}</p>
              <p>요청일: {chargeRequest.createdAt.toLocaleString("ko-KR")}</p>
              {chargeRequest.approvedAt && (
                <p>승인일: {chargeRequest.approvedAt.toLocaleString("ko-KR")}</p>
              )}
              {chargeRequest.rejectedAt && (
                <p>거절일: {chargeRequest.rejectedAt.toLocaleString("ko-KR")}</p>
              )}

              {chargeRequest.status === "PENDING" && (
                <div className="action-row">
                  <ChargeRequestActionButton
                    chargeRequestId={chargeRequest.id}
                    action="approve"
                    label="승인"
                  />
                  <ChargeRequestActionButton
                    chargeRequestId={chargeRequest.id}
                    action="reject"
                    label="거절"
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
