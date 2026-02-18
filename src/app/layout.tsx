import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PyLearn K12 - 파이썬 학습 플랫폼",
  description: "K12 학생들을 위한 인터랙티브 파이썬 학습 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        <div style={{ position: "relative", zIndex: 1, height: "100vh" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
