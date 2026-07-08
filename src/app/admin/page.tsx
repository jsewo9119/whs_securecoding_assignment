import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <main>
      <h1>관리자 페이지</h1>

      <section>
        <h2>플랫폼 관리</h2>
        <p>사용자와 상품 상태를 관리합니다.</p>

        <div className="action-row">
          <Link href="/admin/users" className="button-link">
            사용자 관리
          </Link>
          <Link href="/admin/products" className="button-link">
            상품 관리
          </Link>
        </div>
      </section>
    </main>
  );
}