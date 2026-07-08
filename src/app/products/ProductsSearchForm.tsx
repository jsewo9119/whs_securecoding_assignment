"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";

type ProductsSearchFormProps = {
  defaultQuery?: string;
};

export function ProductsSearchForm({ defaultQuery = "" }: ProductsSearchFormProps) {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const q = String(formData.get("q") ?? "").trim();

    if (!q) {
      router.push("/products");
      return;
    }

    router.push(`/products?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="q">상품 검색</label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={defaultQuery}
        maxLength={80}
        placeholder="상품명을 검색하세요"
      />
      <button type="submit">검색</button>
    </form>
  );
}