import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import {
  getCheckoutProduct,
  PurchaseNotAllowedError,
  PurchaseNotFoundError,
} from "@/services/purchase.service";
import { CheckoutButton } from "./CheckoutButton";

type CheckoutPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/products/${id}/checkout`);
  }

  try {
    const { product, buyer } = await getCheckoutProduct(id, session.user.id);

    return (
      <main>
        <nav>
          <Link href={`/products/${product.id}`}>상품 상세로</Link>
        </nav>

        <section className="hero">
          <p className="eyebrow">Checkout</p>
          <h1>구매 확인</h1>
          <p>
            구매 버튼을 누르면 결제 금액이 내 잔액에서 빠져나가고 상품은 예약
            상태가 됩니다. 판매자에게는 구매 확정 후 정산됩니다.
          </p>
        </section>

        <section>
          <h2>{product.title}</h2>
          <p>{product.description}</p>
          <p className="price">{product.price.toLocaleString()}원</p>
          <p>판매자: {product.seller.nickname}</p>
          <p>상품 상태: {product.status}</p>
        </section>

        <section className="wallet-card">
          <h2>내 잔액</h2>
          <p className="wallet-balance">{buyer.balance.toLocaleString()}원</p>
          {buyer.balance < product.price && (
            <p className="error">잔액이 부족합니다.</p>
          )}
        </section>

        <CheckoutButton
          productId={product.id}
          disabled={buyer.balance < product.price || product.status !== "SELLING"}
        />
      </main>
    );
  } catch (error) {
    if (error instanceof PurchaseNotFoundError) {
      notFound();
    }

    if (error instanceof PurchaseNotAllowedError) {
      redirect(`/products/${id}`);
    }

    throw error;
  }
}
