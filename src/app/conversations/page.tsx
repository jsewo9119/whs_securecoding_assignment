import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { listMyConversations } from "@/services/conversation.service";

export default async function ConversationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/conversations");
  }

  const conversations = await listMyConversations(session.user.id);

  return (
    <main>
      <h1>내 대화</h1>

      <nav>
        <Link href="/products">상품 목록으로</Link>
      </nav>

      {conversations.length === 0 ? (
        <p>아직 대화가 없습니다.</p>
      ) : (
        <ul>
          {conversations.map((conversation) => {
            const otherUser =
              conversation.sellerId === session.user.id
                ? conversation.buyer
                : conversation.seller;

            const latestMessage = conversation.messages[0];

            return (
              <li key={conversation.id}>
                <Link href={`/conversations/${conversation.id}`}>
                  <h2>{conversation.product.title}</h2>
                </Link>

                <p>상대방: {otherUser.nickname}</p>
                <p>{conversation.product.price.toLocaleString()}원</p>
                <p>상품 상태: {conversation.product.status}</p>

                {latestMessage ? (
                  <p>
                    최근 메시지: {latestMessage.sender.nickname}:{" "}
                    {latestMessage.content}
                  </p>
                ) : (
                  <p>최근 메시지가 없습니다.</p>
                )}

                <p>업데이트: {conversation.updatedAt.toLocaleString("ko-KR")}</p>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}