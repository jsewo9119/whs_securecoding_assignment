"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setErrorMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <main>
      <h1>로그인</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">이메일</label>
          <input id="email" name="email" type="email" required />
        </div>

        <div>
          <label htmlFor="password">비밀번호</label>
          <input id="password" name="password" type="password" required />
        </div>

        {errorMessage && <p>{errorMessage}</p>}

        <button type="submit">로그인</button>
      </form>
    </main>
  );
}