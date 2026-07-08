"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type UserStatus = "ACTIVE" | "BLOCKED";

type UserStatusButtonProps = {
  userId: string;
  currentStatus: UserStatus;
};

export function UserStatusButton({
  userId,
  currentStatus,
}: UserStatusButtonProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStatus =
    currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";

  async function handleClick() {
    setErrorMessage("");
    setIsSubmitting(true);

    const response = await fetch(`/api/admin/users/${userId}/status`, {
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
      setErrorMessage(data.message ?? "사용자 상태 변경에 실패했습니다.");
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
            ? "차단하기"
            : "차단 해제"}
      </button>

      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
}