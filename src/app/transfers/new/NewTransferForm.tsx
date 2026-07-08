"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Receiver = {
  id: string;
  nickname: string;
  email: string;
};

type NewTransferFormProps = {
  receivers: Receiver[];
};

export function NewTransferForm({ receivers }: NewTransferFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch("/api/transfers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiverId: formData.get("receiverId"),
        amount: Number(formData.get("amount")),
        memo: formData.get("memo") || undefined,
      }),
    });

    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setErrorMessage(data.message ?? "송금에 실패했습니다.");
      return;
    }

    setSuccessMessage("송금이 완료되었습니다.");
    form.reset();
    router.refresh();
  }

  if (receivers.length === 0) {
    return <p>송금 가능한 사용자가 없습니다.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="receiverId">받는 사람</label>
        <select id="receiverId" name="receiverId" required>
          <option value="">받는 사람을 선택하세요</option>
          {receivers.map((receiver) => (
            <option key={receiver.id} value={receiver.id}>
              {receiver.nickname} ({receiver.email})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="amount">금액</label>
        <input
          id="amount"
          name="amount"
          type="number"
          required
          min={1}
          max={10000000}
        />
      </div>

      <div>
        <label htmlFor="memo">메모</label>
        <input id="memo" name="memo" type="text" maxLength={100} />
      </div>

      {errorMessage && <p className="error">{errorMessage}</p>}
      {successMessage && <p>{successMessage}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "송금 중..." : "송금하기"}
      </button>
    </form>
  );
}