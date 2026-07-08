import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import {
  acceptOffer,
  OfferForbiddenError,
  OfferNotAllowedError,
  OfferNotFoundError,
} from "@/services/offer.service";

type OfferAcceptRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _request: Request,
  context: OfferAcceptRouteContext,
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  const { id } = await context.params;

  try {
    const result = await acceptOffer(id, session.user.id);

    return NextResponse.json({
      message: "흥정 요청을 수락했습니다.",
      ...result,
    });
  } catch (error) {
    if (error instanceof OfferNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error instanceof OfferForbiddenError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    if (error instanceof OfferNotAllowedError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.error("흥정 수락 실패:", error);

    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
