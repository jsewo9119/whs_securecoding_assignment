"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ProductStatus = "SELLING" | "RESERVED" | "SOLD" | "BLOCKED";

type ProductStatusButtonProps = {
  productId: string;
  currentStatus: ProductStatus;
};

export function ProductStatusButton({
  productId,
  currentStatus,
}: ProductStatusButtonProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStatus = currentStatus === "BLOCKED" ? "SELLING" : "BLOCKED";

  async function handleClick() {
    setErrorMessage("");
    setIsSubmitting(true);

    const response = await fetch(`/api/admin/products/${productId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: nextStatus,
      }),
    });

    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setErrorMessage(data.message ?? "상품 상태 변경에 실패했습니다.");
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <button type="button" onClick={handleClick} disabled={isSubmitting}>
        {isSubmitting
          ? "처리 중..."
          : nextStatus === "BLOCKED"
            ? "상품 차단"
            : "차단 해제"}
      </button>

      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
}