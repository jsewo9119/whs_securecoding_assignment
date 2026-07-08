import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import { createOfferSchema } from "@/lib/validations/message";
import {
  createOffer,
  OfferNotAllowedError,
  OfferNotFoundError,
} from "@/services/offer.service";

type ProductOffersRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  context: ProductOffersRouteContext,
) {
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

  const result = createOfferSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        message: "입력값을 확인해주세요.",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { id } = await context.params;

  try {
    const offerResult = await createOffer(id, session.user.id, result.data);

    return NextResponse.json(
      {
        message: "흥정 요청이 전송되었습니다.",
        ...offerResult,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof OfferNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error instanceof OfferNotAllowedError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.error("흥정 요청 실패:", error);

    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
