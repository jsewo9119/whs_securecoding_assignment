import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import { updateProductSchema } from "@/lib/validations/product";
import {
  ProductImageUploadError,
  saveProductImage,
} from "@/lib/upload/product-image";
import {
  deleteProduct,
  ProductForbiddenError,
  ProductNotFoundError,
  updateProduct,
} from "@/services/product.service";

type ProductRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: ProductRouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  const { id } = await context.params;

  const contentType = request.headers.get("content-type");

  if (!contentType?.includes("multipart/form-data")) {
    return NextResponse.json(
      { message: "multipart/form-data 요청만 허용됩니다." },
      { status: 415 },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "올바른 form-data 형식이 아닙니다." },
      { status: 400 },
    );
  }

  let imageUrl: string | undefined;

  try {
    const imageFile = formData.get("image");
    imageUrl = await saveProductImage(
      imageFile instanceof File ? imageFile : null,
    );
  } catch (error) {
    if (error instanceof ProductImageUploadError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    throw error;
  }

  const body = {
    title: formData.get("title"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    ...(imageUrl ? { imageUrl } : {}),
    isNegotiable: formData.get("isNegotiable") === "on",
  };

  const result = updateProductSchema.safeParse(body);

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
    const product = await updateProduct(id, session.user.id, result.data);

    return NextResponse.json({
      message: "상품이 수정되었습니다.",
      product,
    });
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error instanceof ProductForbiddenError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    console.error("상품 수정 실패:", error);

    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: ProductRouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  const { id } = await context.params;

  try {
    await deleteProduct(id, session.user.id);

    return NextResponse.json({
      message: "상품이 삭제되었습니다.",
    });
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error instanceof ProductForbiddenError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    console.error("상품 삭제 실패:", error);

    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
