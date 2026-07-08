import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listAdminUsers } from "@/services/admin.service";
import { UserStatusButton } from "./UserStatusButton";

export default async function AdminUsersPage() {
  const session = await requireAdmin();
  const users = await listAdminUsers();

  return (
    <main>
      <h1>사용자 관리</h1>

      <nav>
        <Link href="/admin">관리자 홈</Link>
      </nav>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <h2>{user.nickname}</h2>
            <p>이메일: {user.email}</p>
            <p>역할: {user.role}</p>
            <p>상태: {user.status}</p>
            <p>잔액: {user.balance.toLocaleString()}원</p>
            <p>가입일: {user.createdAt.toLocaleString("ko-KR")}</p>

            {user.id === session.user.id ? (
              <p>현재 로그인한 관리자입니다.</p>
            ) : (
              <UserStatusButton userId={user.id} currentStatus={user.status} />
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}