import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import {
  ConversationForbiddenError,
  ConversationNotFoundError,
  getConversationDetail,
} from "@/services/conversation.service";
import { ReplyMessageForm } from "./ReplyMessageForm";
import { OfferActionButton } from "./OfferActionButton";

type ConversationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ConversationDetailPage({
  params,
}: ConversationDetailPageProps) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/conversations/${id}`);
  }

  let conversation: Awaited<ReturnType<typeof getConversationDetail>>;

  try {
    conversation = await getConversationDetail(id, session.user.id);
  } catch (error) {
    if (error instanceof ConversationNotFoundError) {
      notFound();
    }

    if (error instanceof ConversationForbiddenError) {
      redirect("/products");
    }

    throw error;
  }

  const isSeller = session.user.id === conversation.sellerId;
  const otherUser = isSeller ? conversation.buyer : conversation.seller;

  return (
    <main className="chat-page">
      <section className="chat-shell">
        <header className="chat-header">
          <Link href="/conversations" className="chat-back-link">
            ← 대화 목록
          </Link>

          <div className="dm-avatar" aria-hidden="true">
            {otherUser.nickname.slice(0, 1).toUpperCase()}
          </div>

          <div>
            <h1>{otherUser.nickname}</h1>
            <p>
              {conversation.product.title} ·{" "}
              {conversation.product.price.toLocaleString()}원
            </p>
          </div>

          <Link
            href={`/products/${conversation.product.id}`}
            className="button-link secondary-button chat-product-link"
          >
            상품 보기
          </Link>
        </header>

        <aside className="chat-product-summary">
          <div>
            <p className="eyebrow">Product</p>
            <h2>{conversation.product.title}</h2>
          </div>
          <div className="meta-row">
            <span className="badge">
              {conversation.product.price.toLocaleString()}원
            </span>
            <span
              className={`badge badge-${conversation.product.status.toLowerCase()}`}
            >
              {conversation.product.status}
            </span>
            <span className="badge">판매자 {conversation.seller.nickname}</span>
            <span className="badge">구매자 {conversation.buyer.nickname}</span>
          </div>
        </aside>

        <section className="offer-strip">
          <div className="section-heading">
            <h2>흥정 제안</h2>
            <span className="badge">{conversation.offers.length}건</span>
          </div>

        {conversation.offers.length === 0 ? (
          <p className="muted">아직 흥정 제안이 없습니다.</p>
        ) : (
          <ul className="offer-list">
            {conversation.offers.map((offer) => (
              <li key={offer.id} className="offer-card">
                <div>
                  <p>
                    <strong>{offer.buyer.nickname}</strong>님이{" "}
                    <strong>{offer.proposedPrice.toLocaleString()}원</strong>에
                    제안했습니다.
                  </p>
                  <p>{offer.createdAt.toLocaleString("ko-KR")}</p>
                </div>
                {offer.message && <p>{offer.message}</p>}
                <span className="badge">{offer.status}</span>
                {isSeller && offer.status === "PENDING" && (
                  <OfferActionButton offerId={offer.id} />
                )}
              </li>
            ))}
          </ul>
        )}
        </section>

        {conversation.messages.length === 0 ? (
          <div className="chat-empty">
            <p>아직 메시지가 없습니다.</p>
          </div>
        ) : (
          <ul className="chat-thread">
            {conversation.messages.map((message) => (
              <li
                key={message.id}
                className={
                  message.sender.id === session.user.id
                    ? "chat-message mine"
                    : "chat-message theirs"
                }
              >
                {message.sender.id !== session.user.id && (
                  <div className="dm-avatar small" aria-hidden="true">
                    {message.sender.nickname.slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div className="chat-bubble-wrap">
                  <p className="chat-sender">{message.sender.nickname}</p>
                  <div className="chat-bubble">
                    {message.content.split("\n").map((line, index) => (
                      <p key={`${message.id}-${index}`}>{line}</p>
                    ))}
                  </div>
                  <time>
                    {message.createdAt.toLocaleString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
        <ReplyMessageForm conversationId={conversation.id} />
      </section>
    </main>
  );
}
