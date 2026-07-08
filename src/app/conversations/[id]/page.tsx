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

  return (
    <main>
      <nav>
        <Link href="/products">상품 목록으로</Link>
      </nav>

      <h1>대화</h1>

      <section>
        <h2>{conversation.product.title}</h2>
        <p>{conversation.product.price.toLocaleString()}원</p>
        <p>상품 상태: {conversation.product.status}</p>
        <p>판매자: {conversation.seller.nickname}</p>
        <p>구매자: {conversation.buyer.nickname}</p>
      </section>

      <section>
        <h2>흥정 제안</h2>

        {conversation.offers.length === 0 ? (
          <p>아직 흥정 제안이 없습니다.</p>
        ) : (
          <ul>
            {conversation.offers.map((offer) => (
              <li key={offer.id}>
                <p>
                  <strong>{offer.buyer.nickname}</strong> →{" "}
                  {offer.proposedPrice.toLocaleString()}원
                </p>
                {offer.message && <p>{offer.message}</p>}
                <p>상태: {offer.status}</p>
                <p>{offer.createdAt.toLocaleString("ko-KR")}</p>
                {isSeller && offer.status === "PENDING" && (
                  <OfferActionButton offerId={offer.id} />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>메시지</h2>

        {conversation.messages.length === 0 ? (
          <p>아직 메시지가 없습니다.</p>
        ) : (
          <ul>
            {conversation.messages.map((message) => (
              <li key={message.id}>
                <p>
                  <strong>{message.sender.nickname}</strong>: {message.content}
                </p>
                <p>{message.createdAt.toLocaleString("ko-KR")}</p>
              </li>
            ))}
          </ul>
        )}
        <ReplyMessageForm conversationId={conversation.id} />
      </section>
    </main>
  );
}
