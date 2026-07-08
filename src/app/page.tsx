import Link from "next/link";

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

      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Features</p>
            <h2>현재 구현된 기능</h2>
          </div>
        </div>
        <ul className="product-grid">
          <li className="product-card">
            <h2>회원</h2>
            <p>회원가입, 로그인, 차단 사용자 로그인 방지를 제공합니다.</p>
          </li>
          <li className="product-card">
            <h2>상품</h2>
            <p>상품 등록, 검색, 상세 조회, 판매자 전용 관리를 제공합니다.</p>
          </li>
          <li className="product-card">
            <h2>대화</h2>
            <p>상품 문의와 대화방 메시지 기능을 제공합니다.</p>
          </li>
          <li className="product-card">
            <h2>송금 / 관리자</h2>
            <p>송금, 잔액 확인, 사용자 및 상품 차단 기능을 제공합니다.</p>
          </li>
        </ul>
      </section>
    </main>
  );
}
