"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ProductActionsProps = {
  productId: string;
  currentStatus: string;
};

const PRODUCT_STATUS_OPTIONS = [
  { value: "SELLING", label: "판매중" },
  { value: "RESERVED", label: "예약" },
  { value: "SOLD", label: "판매 완료" },
] as const;

export function ProductActions({ productId, currentStatus }: ProductActionsProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  async function handleDelete() {
    const confirmed = window.confirm("정말 이 상품을 삭제하시겠습니까?");

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setIsDeleting(true);

    const response = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });

    setIsDeleting(false);

    if (!response.ok) {
      const data = await response.json();
      setErrorMessage(data.message ?? "상품 삭제에 실패했습니다.");
      return;
    }

    router.push("/products");
    router.refresh();
  }

  async function handleStatusChange(nextStatus: string) {
    setErrorMessage("");

    const response = await fetch(`/api/products/${productId}/status`, {
        method: "PATCH",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        status: nextStatus,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        setErrorMessage(data.message ?? "상품 상태 변경에 실패했습니다.");
        return;
    }

    setStatus(data.product.status);
    router.refresh();
  }

  return (
    <section className="seller-action-card">
      <div className="seller-action-header">
        <p className="seller-tools-label">Seller tools</p>

        <div className="seller-quick-actions">
        <Link
          href={`/products/${productId}/edit`}
            className="seller-mini-action"
        >
          수정
        </Link>

        <button
          type="button"
            className="seller-mini-action danger"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "삭제 중..." : "삭제"}
        </button>
        </div>
      </div>

      <div className="seller-status-control">
        <p className="seller-status-label">상태 변경</p>
        <div
          className={`status-segmented status-segmented-${status.toLowerCase()}`}
          role="radiogroup"
          aria-label="상품 상태"
        >
          <span className="status-segmented-indicator" aria-hidden="true" />

          {PRODUCT_STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className="status-segmented-option"
              role="radio"
              aria-checked={status === option.value}
              disabled={status === option.value}
              onClick={() => handleStatusChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && <p className="error">{errorMessage}</p>}
    </section>
  );
}
