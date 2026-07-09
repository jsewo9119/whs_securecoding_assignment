"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function ChargeRequestForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      amount: Number(formData.get("amount")),
      memo: formData.get("memo") || undefined,
    };

    const response = await fetch("/api/charges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setErrorMessage(data.message ?? "충전 요청에 실패했습니다.");
      return;
    }

    router.push("/mypage");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="amount">충전 요청 금액</label>
        <input
          id="amount"
          name="amount"
          type="number"
          required
          min={1000}
          max={10000000}
          step={1000}
          placeholder="10000"
        />
      </div>

      <div>
        <label htmlFor="memo">메모</label>
        <input
          id="memo"
          name="memo"
          type="text"
          maxLength={100}
          placeholder="예: 과제 테스트용 충전 요청"
        />
      </div>

      {errorMessage && <p className="error">{errorMessage}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "요청 중..." : "충전 요청"}
      </button>
    </form>
  );
}
