"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PurchaseActionButtonProps = {
  purchaseId: string;
  action: "confirm" | "cancel-request" | "cancel-approve";
  label: string;
  confirmMessage: string;
};

export function PurchaseActionButton({
  purchaseId,
  action,
  label,
  confirmMessage,
}: PurchaseActionButtonProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const response = await fetch(`/api/purchases/${purchaseId}/${action}`, {
      method: "POST",
    });

    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setErrorMessage(data.message ?? "요청 처리에 실패했습니다.");
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
