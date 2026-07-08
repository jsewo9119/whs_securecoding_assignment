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
    <main>
      <nav>
        <Link href="/products">상품 목록으로</Link>
      </nav>

      <div className="detail-layout">
        <section className="detail-panel">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.title} width={720} />
          ) : (
            <div className="image-placeholder">상품 이미지 없음</div>
          )}

          <div>
            <p className="eyebrow">Description</p>
            <p>{product.description}</p>
          </div>
        </section>

        <aside className="detail-panel">
          <section>
            <div className="meta-row">
              <span className={`badge badge-${product.status.toLowerCase()}`}>
                {product.status}
              </span>
              <span className="badge">판매자 {product.seller.nickname}</span>
            </div>

            <h1>{product.title}</h1>
            <p className="price">{product.price.toLocaleString()}원</p>
            <p>등록일: {product.createdAt.toLocaleString("ko-KR")}</p>
          </section>

          {isSeller && (
            <ProductActions
              productId={product.id}
              currentStatus={product.status}
            />
          )}

          {canContactSeller && <StartConversationForm productId={product.id} />}

          {!session?.user?.id && (
            <section>
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
    </main>
  );
}
