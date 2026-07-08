import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main>
      <h1>로그인</h1>

      <Suspense fallback={<p>로그인 화면을 불러오는 중입니다...</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}