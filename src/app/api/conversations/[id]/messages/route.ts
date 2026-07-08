import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import { sendMessageSchema } from "@/lib/validations/message";
import {
  ConversationForbiddenError,
  ConversationNotFoundError,
  sendMessageToConversation,
} from "@/services/conversation.service";

type ConversationMessagesRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  context: ConversationMessagesRouteContext,
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  const { id } = await context.params;

  const contentType = request.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return NextResponse.json(
      { message: "JSON 요청만 허용됩니다." },
      { status: 415 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "올바른 JSON 형식이 아닙니다." },
      { status: 400 },
    );
  }

  const result = sendMessageSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        message: "입력값을 확인해주세요.",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const message = await sendMessageToConversation(
      id,
      session.user.id,
      result.data,
    );

    return NextResponse.json(
      {
        message: "메시지가 전송되었습니다.",
        sentMessage: message,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ConversationNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error instanceof ConversationForbiddenError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    console.error("메시지 전송 실패:", error);

    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}