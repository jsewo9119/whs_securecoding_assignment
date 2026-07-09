"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function NewProductForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/products", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setErrorMessage(data.message ?? "상품 등록에 실패했습니다.");
      return;
    }

    router.push("/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">상품명</label>
        <input id="title" name="title" type="text" required minLength={2} maxLength={80} />
      </div>

      <div>
        <label htmlFor="description">상품 설명</label>
        <textarea id="description" name="description" required minLength={5} maxLength={2000} />
      </div>

      <div>
        <label htmlFor="price">가격</label>
        <input id="price" name="price" type="number" required min={0} max={100000000} />
      </div>

      <div>
        <label htmlFor="image">상품 이미지</label>
        <input id="image" name="image" type="file" accept="image/png,image/jpeg" />
        <p className="muted">png, jpg, jpeg 파일만 가능하며 최대 2MB까지 업로드할 수 있습니다.</p>
      </div>

      <div className="switch-field">
        <span>
          <strong>흥정 가능</strong>
          <small>구매자가 원하는 가격을 제안할 수 있게 합니다.</small>
        </span>

        <label className="toggle-switch" htmlFor="isNegotiable">
          <input
            id="isNegotiable"
            name="isNegotiable"
            type="checkbox"
            className="toggle-input"
          />
          <span className="toggle-track">
            <span className="toggle-text toggle-text-off">OFF</span>
            <span className="toggle-text toggle-text-on">ON</span>
            <span className="toggle-thumb" />
          </span>
        </label>
      </div>

      {errorMessage && <p>{errorMessage}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "등록 중..." : "상품 등록"}
      </button>
    </form>
  );
}
