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
    <form onSubmit={handleSubmit} className="market-search-form">
      <label htmlFor="q" className="sr-only">
        상품 검색
      </label>
      <input
        className="market-search-input"
        id="q"
        name="q"
        type="search"
        defaultValue={defaultQuery}
        maxLength={80}
        placeholder="찾고 싶은 상품을 검색하세요"
      />
      <button className="market-search-button" type="submit" aria-label="상품 검색">
        <span aria-hidden="true">⌕</span>
      </button>
    </form>
  );
}
