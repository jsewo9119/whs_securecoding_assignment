"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type OfferActionButtonProps = {
  offerId: string;
};

export function OfferActionButton({ offerId }: OfferActionButtonProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAccept() {
    setErrorMessage("");
    setIsSubmitting(true);

    const response = await fetch(`/api/offers/${offerId}/accept`, {
      method: "POST",
    });

    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setErrorMessage(data.message ?? "흥정 수락에 실패했습니다.");
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <button type="button" onClick={handleAccept} disabled={isSubmitting}>
        {isSubmitting ? "수락 중..." : "수락"}
      </button>
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
}
