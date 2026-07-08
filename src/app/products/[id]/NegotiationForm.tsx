"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type NegotiationFormProps = {
  productId: string;
  currentPrice: number;
};

export function NegotiationForm({
  productId,
  currentPrice,
}: NegotiationFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      proposedPrice: Number(formData.get("proposedPrice")),
      message: formData.get("message") || undefined,
    };

    const response = await fetch(`/api/products/${productId}/offers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setErrorMessage(data.message ?? "흥정 요청에 실패했습니다.");
      return;
    }

    router.push(`/conversations/${data.conversation.id}`);
    router.refresh();
  }

  return (
    <section>
      <h2>흥정하기</h2>
      <p>
        원하는 가격을 제안하면 판매자에게 흥정 메시지가 전송됩니다. 판매자가
        수락하면 상품 가격이 변경됩니다.
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="proposedPrice">제안 가격</label>
          <input
            id="proposedPrice"
            name="proposedPrice"
            type="number"
            required
            min={1}
            max={100000000}
            defaultValue={currentPrice}
          />
        </div>

        <div>
          <label htmlFor="message">메시지</label>
          <textarea
            id="message"
            name="message"
            maxLength={500}
            placeholder="예: 바로 거래 가능하면 이 가격에 구매하고 싶습니다."
          />
        </div>

        {errorMessage && <p>{errorMessage}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "전송 중..." : "흥정 요청"}
        </button>
      </form>
    </section>
  );
}
