import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/validations/auth";
import {
  createUser,
  DuplicateUserError,
} from "@/services/auth.service";

export async function POST(request: Request) {
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

  const result = signupSchema.safeParse(body);

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
    const user = await createUser(result.data);

    return NextResponse.json(
      {
        message: "회원가입이 완료되었습니다.",
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof DuplicateUserError) {
      return NextResponse.json(
        { message: error.message },
        { status: 409 },
      );
    }

    console.error("회원가입 처리 실패:", error);

    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}