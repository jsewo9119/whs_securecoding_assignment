"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ChargeRequestActionButtonProps = {
  chargeRequestId: string;
  action: "approve" | "reject";
  label: string;
};

export function ChargeRequestActionButton({
  chargeRequestId,
  action,
  label,
}: ChargeRequestActionButtonProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    setErrorMessage("");
    setIsSubmitting(true);

    const response = await fetch(
      `/api/admin/charges/${chargeRequestId}/${action}`,
      {
        method: "POST",
      },
    );

    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setErrorMessage(data.message ?? "충전 요청 처리에 실패했습니다.");
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <button type="button" onClick={handleClick} disabled={isSubmitting}>
        {isSubmitting ? "처리 중..." : label}
      </button>
      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
}
