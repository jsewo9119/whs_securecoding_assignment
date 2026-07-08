import Link from "next/link";
import { listProducts } from "@/services/product.service";
import { ProductsSearchForm } from "./ProductsSearchForm";

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  const q = params.q?.trim();
  const page = params.page ? Number(params.page) : 1;

  const safePage = Number.isInteger(page) && page > 0 ? page : 1;

  const products = await listProducts({
    q,
    page: safePage,
    pageSize: 20,
  });

  return (
    <main>
      <h1>상품 목록</h1>

      <nav>
        <Link href="/products/new">상품 등록</Link>
      </nav>

      <ProductsSearchForm defaultQuery={q} />

      {products.length === 0 ? (
        <p>등록된 상품이 없습니다.</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              <Link href={`/products/${product.id}`}>
                <h2>{product.title}</h2>
              </Link>

              <p>{product.description}</p>
              <p>{product.price.toLocaleString()}원</p>
              <p>판매자: {product.seller.nickname}</p>
              <p>상태: {product.status}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}