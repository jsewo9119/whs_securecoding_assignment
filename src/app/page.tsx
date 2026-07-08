import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <p className="muted">Tiny Second-hand Shopping Platform</p>
        <h1>안전한 중고거래를 위한 작은 마켓</h1>
        <p>
          상품 등록, 검색, 사용자 간 문의, 권한 검사를 단계적으로 구현하는
          보안 코딩 과제용 플랫폼입니다.
        </p>

        <div className="action-row">
          <Link href="/products" className="button-link">
            상품 둘러보기
          </Link>
          <Link href="/products/new" className="button-link">
            상품 등록하기
          </Link>
        </div>
      </section>

      <section>
        <h2>현재 구현된 기능</h2>
        <ul>
          <li>회원가입과 로그인</li>
          <li>상품 등록, 검색, 상세 조회</li>
          <li>판매자 전용 수정, 삭제, 상태 변경</li>
          <li>상품 문의와 대화 메시지</li>
        </ul>
      </section>
    </main>
  );
}
