import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicProductById } from "@/services/product.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { ProductActions } from "./ProductActions";
import { StartConversationForm } from "./StartConversationForm";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  const product = await getPublicProductById(id);

  if (!product) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const isSeller = session?.user?.id === product.seller.id;
  const canContactSeller = session?.user?.id && !isSeller;

  return (
    <main className="product-detail-page">
      <nav className="product-detail-nav">
        <Link href="/products">상품 목록으로</Link>
      </nav>

      <div className="product-detail-layout">
        <section className="product-media-card">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.title} />
          ) : (
            <div className="image-placeholder">상품 이미지 없음</div>
          )}
        </section>

        <aside className="product-detail-sidebar">
          <section className="product-summary-card">
            <div className="meta-row">
              <span className={`badge badge-${product.status.toLowerCase()}`}>
                {product.status}
              </span>
              {product.isNegotiable && <span className="badge">흥정 가능</span>}
              <span className="badge">판매자 {product.seller.nickname}</span>
            </div>

            <h1>{product.title}</h1>
            <p className="price">{product.price.toLocaleString()}원</p>
            <p className="muted">
              등록일 {product.createdAt.toLocaleString("ko-KR")}
            </p>

            {canContactSeller && product.status === "SELLING" && (
              <div className="product-summary-actions">
                <Link
                  href={`/products/${product.id}/checkout`}
                  className="button-link"
                >
                  구매하기
                </Link>
              </div>
            )}
          </section>

          {isSeller && (
            <ProductActions
              productId={product.id}
              currentStatus={product.status}
            />
          )}

          {canContactSeller && (
            <StartConversationForm
              productId={product.id}
              currentPrice={product.price}
              isNegotiable={
                product.status === "SELLING" && product.isNegotiable
              }
            />
          )}

          {!session?.user?.id && (
            <section className="product-login-card">
              <p>
                문의하려면{" "}
                <Link href={`/login?callbackUrl=/products/${product.id}`}>
                  로그인
                </Link>
                이 필요합니다.
              </p>
            </section>
          )}
        </aside>
      </div>

      <section className="product-description-card">
        <p className="eyebrow">Description</p>
        <h2>상품 설명</h2>
        <p>{product.description}</p>
      </section>
    </main>
  );
}
