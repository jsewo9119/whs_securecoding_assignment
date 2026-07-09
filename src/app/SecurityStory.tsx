"use client";

import { useEffect, useRef } from "react";

const securityItems = [
  {
    number: "01",
    label: "Account",
    title: "거래의 시작은 안전한 계정에서",
    description:
      "입력값 검증과 로그인 검사를 통해 기본적인 접근 흐름을 단단하게 만들고, 차단된 사용자는 서비스 이용을 제한합니다.",
  },
  {
    number: "02",
    label: "Escrow",
    title: "돈은 바로 넘어가지 않습니다",
    description:
      "구매자가 결제해도 판매자에게 즉시 정산하지 않고 보류합니다. 구매 확정 이후에만 금액이 이동하도록 설계했습니다.",
  },
  {
    number: "03",
    label: "Message",
    title: "대화와 흥정은 기록으로 남습니다",
    description:
      "문의, 가격 제안, 판매자 응답이 대화 안에 남아 거래 조건을 다시 확인할 수 있습니다. 말로만 끝나는 거래를 줄입니다.",
  },
  {
    number: "04",
    label: "Admin",
    title: "위험한 사용자와 상품은 관리됩니다",
    description:
      "관리자는 사용자와 상품 상태를 확인하고 조치할 수 있습니다. 악성 계정과 의심 상품이 플랫폼에 오래 남지 않도록 대응합니다.",
  },
];

export function SecurityStory() {
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      {
        rootMargin: "-18% 0px -22% 0px",
        threshold: 0.22,
      },
    );

    itemRefs.current.forEach((item) => {
      if (item) {
        observer.observe(item);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="security-story" aria-labelledby="security-story-title">
      <div className="security-story-intro">
        <p className="eyebrow">Security first</p>
        <h2 id="security-story-title">안심하고 거래할 수 있도록.</h2>
        <p>
          Tiny Market은 예쁜 상품 목록보다 먼저, 계정·결제·대화·관리 흐름이
          안전하게 이어지는 중고거래 경험을 생각합니다.
        </p>
      </div>

      <ul className="security-story-list">
        {securityItems.map((item, index) => (
          <li
            className="security-story-item"
            key={item.number}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
          >
            <div className="security-visual" aria-hidden="true">
              <span>{item.number}</span>
            </div>
            <article className="security-copy">
              <p>{item.label}</p>
              <h3>{item.title}</h3>
              <span>{item.description}</span>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
