import type { Metadata } from "next";
import { Courier_Prime, VT323, Space_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

// 使用黑客风格等宽字体
const matrixFont = VT323({ 
  weight: ['400'],
  subsets: ["latin"] 
});

export const metadata: Metadata = {
  title: "The Matrix of Movies - Enter the System",
  description: "Discover movies that match your emotional pattern in the system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${matrixFont.className} bg-black text-green-500`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
