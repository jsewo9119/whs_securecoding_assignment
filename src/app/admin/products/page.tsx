import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listAdminProducts } from "@/services/admin.service";
import { ProductStatusButton } from "./ProductStatusButton";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await listAdminProducts();

  return (
    <main>
      <h1>상품 관리</h1>

      <nav>
        <Link href="/admin">관리자 홈</Link>
      </nav>

      {products.length === 0 ? (
        <p>등록된 상품이 없습니다.</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              <h2>{product.title}</h2>
              <p>{product.description}</p>
              <p>가격: {product.price.toLocaleString()}원</p>
              <p>상태: {product.status}</p>
              <p>
                판매자: {product.seller.nickname} ({product.seller.email})
              </p>
              <p>판매자 상태: {product.seller.status}</p>
              <p>등록일: {product.createdAt.toLocaleString("ko-KR")}</p>

              <div className="action-row">
                <Link href={`/products/${product.id}`}>상품 보기</Link>
                <ProductStatusButton
                  productId={product.id}
                  currentStatus={product.status}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}