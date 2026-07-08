import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import {
  confirmPurchase,
  PurchaseForbiddenError,
  PurchaseNotAllowedError,
  PurchaseNotFoundError,
} from "@/services/purchase.service";

type PurchaseRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, context: PurchaseRouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  const { id } = await context.params;

  try {
    const result = await confirmPurchase(id, session.user.id);

    return NextResponse.json({
      message: "구매가 확정되었습니다.",
      purchase: result.purchase,
      transfer: result.transfer,
    });
  } catch (error) {
    if (error instanceof PurchaseNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error instanceof PurchaseForbiddenError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    if (error instanceof PurchaseNotAllowedError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.error("구매 확정 실패:", error);

    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
