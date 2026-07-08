"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ProductActionsProps = {
  productId: string;
  currentStatus: string;
};



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
    <div>
      <Link href={`/products/${productId}/edit`}>수정</Link>

      <button type="button" onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? "삭제 중..." : "삭제"}
      </button>

      <label htmlFor="status">상품 상태</label>
        <select
        id="status"
        value={status}
        onChange={(event) => handleStatusChange(event.target.value)}
        >
        <option value="SELLING">판매중</option>
        <option value="RESERVED">예약중</option>
        <option value="SOLD">판매완료</option>
        </select>

      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
}
