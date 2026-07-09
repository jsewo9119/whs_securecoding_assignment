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
      <section className="hero">
        <p className="eyebrow">Messages</p>
        <h1>내 대화</h1>
        <p>상품 문의와 흥정 메시지를 DM처럼 확인하세요.</p>
      </section>

      <nav>
        <Link href="/products">상품 목록으로</Link>
      </nav>

      {conversations.length === 0 ? (
        <div className="empty-state">
          <p>아직 대화가 없습니다.</p>
        </div>
      ) : (
        <ul className="dm-list">
          {conversations.map((conversation) => {
            const otherUser =
              conversation.sellerId === session.user.id
                ? conversation.buyer
                : conversation.seller;

            const latestMessage = conversation.messages[0];
            const roleLabel =
              conversation.sellerId === session.user.id ? "구매자" : "판매자";

            return (
              <li key={conversation.id} className="dm-list-item">
                <Link
                  href={`/conversations/${conversation.id}`}
                  className="dm-list-link"
                >
                  <div className="dm-avatar" aria-hidden="true">
                    {otherUser.nickname.slice(0, 1).toUpperCase()}
                  </div>

                  <div className="dm-list-body">
                    <div className="dm-list-top">
                      <div>
                        <h2>{otherUser.nickname}</h2>
                        <p>
                          {roleLabel} · {conversation.product.title}
                        </p>
                      </div>
                      <time>
                        {conversation.updatedAt.toLocaleString("ko-KR", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>

                    <div className="dm-list-preview">
                      {latestMessage ? (
                        <p>
                          <strong>{latestMessage.sender.nickname}</strong>{" "}
                          {latestMessage.content}
                        </p>
                      ) : (
                        <p>최근 메시지가 없습니다.</p>
                      )}
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
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
