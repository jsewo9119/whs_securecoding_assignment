"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type StartConversationFormProps = {
  productId: string;
  currentPrice: number;
  isNegotiable: boolean;
};

export function StartConversationForm({
  productId,
  currentPrice,
  isNegotiable,
}: StartConversationFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [includeOffer, setIncludeOffer] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const content = String(formData.get("content") ?? "").trim();

    if (!includeOffer && !content) {
      setErrorMessage("메시지를 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    const endpoint = includeOffer
      ? `/api/products/${productId}/offers`
      : "/api/conversations";

    const body = includeOffer
      ? {
          proposedPrice: Number(formData.get("proposedPrice")),
          message: content || undefined,
        }
      : {
          productId,
          content,
        };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setErrorMessage(data.message ?? "문의 전송에 실패했습니다.");
      return;
    }

    setIsOpen(false);
    router.push(`/conversations/${data.conversation.id}`);
    router.refresh();
  }

  return (
    <>
      <section className="product-contact-card">
        <div>
          <p className="eyebrow">DM</p>
          <h2>판매자와 대화하기</h2>
          <p>궁금한 점을 묻거나 흥정 가능한 상품이면 가격을 제안해보세요.</p>
        </div>

        {isOpen && (
          <div className="inline-dm-panel">
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="content" className="sr-only">
                  메시지
                </label>
                <textarea
                  id="content"
                  name="content"
                  minLength={1}
                  maxLength={1000}
                  placeholder={
                    includeOffer
                      ? "흥정 메시지를 함께 남겨보세요."
                      : "상품에 대해 궁금한 점을 입력하세요."
                  }
                />
              </div>

              {isNegotiable && (
                <div className="contact-offer-addon">
                  <label
                    className="contact-offer-toggle"
                    htmlFor="includeOffer"
                  >
                    <input
                      id="includeOffer"
                      className="offer-toggle-input"
                      type="checkbox"
                      checked={includeOffer}
                      onChange={(event) => setIncludeOffer(event.target.checked)}
                    />
                    <span className="offer-toggle-label">흥정 제안 포함</span>
                    <span
                      className={`offer-toggle-track ${
                        includeOffer ? "is-on" : ""
                      }`}
                    >
                      <span className="offer-toggle-thumb" />
                      <span className="offer-toggle-text offer-toggle-text-off">
                        OFF
                      </span>
                      <span className="offer-toggle-text offer-toggle-text-on">
                        ON
                      </span>
                    </span>
                  </label>

                  {includeOffer && (
                    <div className="contact-offer-fields">
                      <label htmlFor="proposedPrice">제안 가격</label>
                      <input
                        id="proposedPrice"
                        name="proposedPrice"
                        type="number"
                        required={includeOffer}
                        min={1}
                        max={100000000}
                        defaultValue={currentPrice}
                      />
                    </div>
                  )}
                </div>
              )}

              {errorMessage && <p className="error">{errorMessage}</p>}

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "전송 중..."
                  : includeOffer
                    ? "흥정 보내기"
                    : "DM 보내기"}
              </button>
            </form>
          </div>
        )}

        {!isOpen && (
          <button
            type="button"
            className="dm-open-button"
            onClick={() => setIsOpen(true)}
          >
            DM 보내기
          </button>
        )}
      </section>
    </>
  );
}
