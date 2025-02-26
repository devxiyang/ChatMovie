import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "心情电影 | 根据您的心情找到最适合的电影",
  description: "根据您当前的心情，获取最适合观看的电影推荐",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
              <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                <div className="flex gap-5 items-center">
                  <Link href={"/"} className="text-xl font-bold flex items-center">
                    <span className="mr-2">🎬</span>
                    心情电影
                  </Link>
                </div>
                <div className="flex items-center gap-4">
                  {hasEnvVars && <HeaderAuth />}
                  <ThemeSwitcher />
                </div>
              </div>
            </nav>
            
            <main className="flex-grow">
              {children}
            </main>
            
            <footer className="mt-auto p-4 border-t bg-muted/40 text-center text-sm text-muted-foreground">
              <p>© 2023 心情电影 - 根据您的心情找到最适合的电影</p>
              <p className="mt-1">电影数据由 <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TMDb</a> 提供</p>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
