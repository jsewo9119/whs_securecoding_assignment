"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CheckoutButtonProps = {
  productId: string;
  disabled: boolean;
};

export function CheckoutButton({ productId, disabled }: CheckoutButtonProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    const confirmed = window.confirm("이 상품을 구매 예약하시겠습니까?");

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const response = await fetch(`/api/products/${productId}/purchase`, {
      method: "POST",
    });

    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setErrorMessage(data.message ?? "구매 예약에 실패했습니다.");
      return;
    }

    router.push("/mypage");
    router.refresh();
  }

  return (
    <section>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isSubmitting}
      >
        {isSubmitting ? "구매 예약 중..." : "결제 확인"}
      </button>

      {errorMessage && <p className="error">{errorMessage}</p>}
    </section>
  );
}
