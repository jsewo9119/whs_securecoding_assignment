import Link from "next/link";
import { SecurityStory } from "./SecurityStory";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Tiny Second-hand Shopping Platform</p>
        <h1>안전한 중고거래를 위한 작은 마켓</h1>
        <p>
          상품 등록, 검색, 사용자 간 문의, 권한 검사를 단계적으로 구현하는
          보안 코딩 과제용 플랫폼입니다.
        </p>

        <div className="action-row">
          <Link href="/products" className="button-link">
            상품 둘러보기
          </Link>
          <Link href="/products/new" className="button-link secondary-button">
            상품 등록하기
          </Link>
        </div>
      </section>

      <SecurityStory />
    </main>
  );
}
