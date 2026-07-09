import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  ChargeRequestNotAllowedError,
  ChargeRequestNotFoundError,
  rejectChargeRequest,
} from "@/services/charge.service";

type AdminChargeActionRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _request: Request,
  context: AdminChargeActionRouteContext,
) {
  await requireAdmin();
  const { id } = await context.params;

  try {
    const chargeRequest = await rejectChargeRequest(id);

    return NextResponse.json({
      message: "충전 요청을 거절했습니다.",
      chargeRequest,
    });
  } catch (error) {
    if (error instanceof ChargeRequestNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error instanceof ChargeRequestNotAllowedError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.error("충전 요청 거절 실패:", error);

    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
