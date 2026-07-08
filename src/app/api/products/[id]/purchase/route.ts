import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import {
  PurchaseInsufficientBalanceError,
  PurchaseNotAllowedError,
  PurchaseNotFoundError,
  reservePurchase,
} from "@/services/purchase.service";

type ProductPurchaseRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _request: Request,
  context: ProductPurchaseRouteContext,
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
    const result = await reservePurchase(id, session.user.id);

    return NextResponse.json(
      {
        message: "구매 예약이 완료되었습니다.",
        purchase: result.purchase,
        product: result.product,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof PurchaseNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (
      error instanceof PurchaseNotAllowedError ||
      error instanceof PurchaseInsufficientBalanceError
    ) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.error("구매 예약 실패:", error);

    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
