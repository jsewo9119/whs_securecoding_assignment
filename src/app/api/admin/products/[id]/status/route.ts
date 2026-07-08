import { NextResponse } from "next/server";
import { ProductStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  AdminTargetNotFoundError,
  updateProductStatusByAdmin,
} from "@/services/admin.service";

type AdminProductStatusRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: AdminProductStatusRouteContext,
) {
  await requireAdmin();
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

  if (
    typeof body !== "object" ||
    body === null ||
    !("status" in body) ||
    (body.status !== ProductStatus.SELLING &&
      body.status !== ProductStatus.BLOCKED)
  ) {
    return NextResponse.json(
      { message: "상태값이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const product = await updateProductStatusByAdmin(id, body.status);

    return NextResponse.json({
      message: "상품 상태가 변경되었습니다.",
      product,
    });
  } catch (error) {
    if (error instanceof AdminTargetNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    console.error("상품 상태 변경 실패:", error);

    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}