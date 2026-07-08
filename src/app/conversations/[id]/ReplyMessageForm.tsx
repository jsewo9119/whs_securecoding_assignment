"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type ReplyMessageFormProps = {
  conversationId: string;
};

export function ReplyMessageForm({ conversationId }: ReplyMessageFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: formData.get("content"),
      }),
    });

    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setErrorMessage(data.message ?? "메시지 전송에 실패했습니다.");
      return;
    }

    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="content">답장</label>
        <textarea
          id="content"
          name="content"
          required
          minLength={1}
          maxLength={1000}
          placeholder="메시지를 입력하세요."
        />
      </div>

      {errorMessage && <p>{errorMessage}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "전송 중..." : "보내기"}
      </button>
    </form>
  );
}