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
      <section className="hero">
        <p className="eyebrow">Market</p>
        <h1>상품 목록</h1>
        <p>마음에 드는 상품을 찾고, 판매자에게 문의해보세요.</p>

        <div className="action-row">
          <Link href="/products/new" className="button-link">
            상품 등록
          </Link>
          <Link href="/conversations" className="button-link secondary-button">
            내 대화
          </Link>
        </div>
      </section>

      <ProductsSearchForm defaultQuery={q} />

      {products.length === 0 ? (
        <div className="empty-state">
          <p>등록된 상품이 없습니다.</p>
        </div>
      ) : (
        <ul className="product-grid">
          {products.map((product) => (
            <li key={product.id} className="product-card">
              <Link href={`/products/${product.id}`}>
                <h2 className="product-title">{product.title}</h2>
              </Link>

              <p className="product-description">{product.description}</p>
              <p className="price">{product.price.toLocaleString()}원</p>
              <div className="meta-row">
                <span className="badge">판매자 {product.seller.nickname}</span>
                <span className={`badge badge-${product.status.toLowerCase()}`}>
                  {product.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
