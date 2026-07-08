import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tiny Market",
  description: "Tiny second-hand shopping platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <header className="site-header">
          <Link href="/" className="site-logo">
            Tiny Market
          </Link>

          <nav className="site-nav" aria-label="주요 메뉴">
            <Link href="/products">상품</Link>
            <Link href="/products/new">상품 등록</Link>
            <Link href="/conversations">내 대화</Link>
            <Link href="/transfers/new">송금</Link>
            <Link href="/mypage">마이페이지</Link>
            <Link href="/login">로그인</Link>
          </nav>
        </header>

        <div className="page-shell">{children}</div>
      </body>
    </html>
  );
}
