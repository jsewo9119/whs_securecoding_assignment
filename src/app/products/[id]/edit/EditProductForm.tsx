"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type EditableProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isNegotiable: boolean;
};

type EditProductFormProps = {
  product: EditableProduct;
};

export function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      title: formData.get("title"),
      description: formData.get("description"),
      price: Number(formData.get("price")),
      imageUrl: formData.get("imageUrl") || undefined,
      isNegotiable: formData.get("isNegotiable") === "on",
    };

    const response = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setErrorMessage(data.message ?? "상품 수정에 실패했습니다.");
      return;
    }

    router.push(`/products/${product.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">상품명</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={2}
          maxLength={80}
          defaultValue={product.title}
        />
      </div>

      <div>
        <label htmlFor="description">상품 설명</label>
        <textarea
          id="description"
          name="description"
          required
          minLength={5}
          maxLength={2000}
          defaultValue={product.description}
        />
      </div>

      <div>
        <label htmlFor="price">가격</label>
        <input
          id="price"
          name="price"
          type="number"
          required
          min={0}
          max={100000000}
          defaultValue={product.price}
        />
      </div>

      <div>
        <label htmlFor="imageUrl">이미지 URL</label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          maxLength={2048}
          defaultValue={product.imageUrl ?? ""}
        />
      </div>

      <div>
        <label htmlFor="isNegotiable">
          <input
            id="isNegotiable"
            name="isNegotiable"
            type="checkbox"
            defaultChecked={product.isNegotiable}
          />
          흥정 가능
        </label>
      </div>

      {errorMessage && <p>{errorMessage}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "수정 중..." : "수정하기"}
      </button>
    </form>
  );
}
