import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "萌點3D | 3D 公仔客製化與大量列印服務 (Q醬為您導覽)",
  description: "萌點3D 提供 Q 版人像公仔、寵物公仔、角色/AI圖轉公仔、企業展示樣品、大量 3D 列印服務，由吉祥物 Q醬 為您提供貼心導覽與最快速的線上成本估價服務。",
  keywords: ["3D公仔", "3D列印", "公仔客製化", "AI圖轉公仔", "3D建模", "萌點3D", "Q醬"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="h-full scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col bg-brand-cream text-brand-dark font-sans selection:bg-brand-orange/20 selection:text-brand-orange-hover">
        <Header />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
