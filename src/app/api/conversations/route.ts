import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import { startConversationSchema } from "@/lib/validations/message";
import {
  ConversationNotAllowedError,
  ProductNotFoundForConversationError,
  startConversation,
} from "@/services/conversation.service";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

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

  const result = startConversationSchema.safeParse(body);

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
    const conversation = await startConversation(
      session.user.id,
      result.data,
    );

    const resultData = await startConversation(session.user.id, result.data);

    return NextResponse.json(
    {
        message: "문의 메시지가 전송되었습니다.",
        conversation: resultData.conversation,
        sentMessage: resultData.message,
    },
    { status: 201 },
    );
  } catch (error) {
    if (error instanceof ProductNotFoundForConversationError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error instanceof ConversationNotAllowedError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    console.error("대화 시작 실패:", error);

    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}