"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type StartConversationFormProps = {
  productId: string;
};

export function StartConversationForm({
  productId,
}: StartConversationFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        content: formData.get("content"),
      }),
    });

    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setErrorMessage(data.message ?? "문의 전송에 실패했습니다.");
      return;
    }

    router.push(`/conversations/${data.conversation.id}`);
    router.refresh();
  }

  return (
    <section>
      <h2>판매자에게 문의하기</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="content">메시지</label>
          <textarea
            id="content"
            name="content"
            required
            minLength={1}
            maxLength={1000}
            placeholder="상품에 대해 궁금한 점을 입력하세요."
          />
        </div>

        {errorMessage && <p>{errorMessage}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "전송 중..." : "문의하기"}
        </button>
      </form>
    </section>
  );
}

