import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import { createProduct, listProducts } from "@/services/product.service";
import { createProductSchema } from "@/lib/validations/product";
import {
  ProductImageUploadError,
  saveProductImage,
} from "@/lib/upload/product-image";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

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
    imageUrl,
    isNegotiable: formData.get("isNegotiable") === "on",
  };

  const result = createProductSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        message: "입력값을 확인해주세요.",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const product = await createProduct(session.user.id, result.data);

  return NextResponse.json(
    {
      message: "상품이 등록되었습니다.",
      product,
    },
    { status: 201 },
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q") ?? undefined;
  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");

  const page = pageParam ? Number(pageParam) : 1;
  const pageSize = pageSizeParam ? Number(pageSizeParam) : 20;

  if (!Number.isInteger(page) || page < 1) {
    return NextResponse.json(
      { message: "page 값이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) {
    return NextResponse.json(
      { message: "pageSize 값이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const products = await listProducts({
    q,
    page,
    pageSize,
  });

  return NextResponse.json({
    products,
    page,
    pageSize,
  });
}
