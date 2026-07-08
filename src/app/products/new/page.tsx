import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { NewProductForm } from "./NewProductForm";

export default async function NewProductPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/products/new");
  }

  return (
    <main>
      <h1>상품 등록</h1>
      <NewProductForm />
    </main>
  );
}