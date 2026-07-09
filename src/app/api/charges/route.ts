import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import { createChargeRequestSchema } from "@/lib/validations/charge";
import {
  ChargeRequestNotAllowedError,
  createChargeRequest,
} from "@/services/charge.service";

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

  const result = createChargeRequestSchema.safeParse(body);

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
    const chargeRequest = await createChargeRequest(
      session.user.id,
      result.data,
    );

    return NextResponse.json(
      {
        message: "충전 요청이 생성되었습니다.",
        chargeRequest,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ChargeRequestNotAllowedError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.error("충전 요청 생성 실패:", error);

    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
