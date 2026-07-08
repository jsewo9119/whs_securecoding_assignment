import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import {
  getProductForEdit,
  ProductForbiddenError,
  ProductNotFoundError,
} from "@/services/product.service";
import { EditProductForm } from "./EditProductForm";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/products/${id}/edit`);
  }

  try {
    const product = await getProductForEdit(id, session.user.id);

    return (
      <main>
        <h1>상품 수정</h1>
        <EditProductForm product={product} />
      </main>
    );
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      notFound();
    }

    if (error instanceof ProductForbiddenError) {
      redirect(`/products/${id}`);
    }

    throw error;
  }
}