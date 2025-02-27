import './globals.css';
import type { Metadata } from 'next';
import { Inter, Courier_Prime, VT323, Space_Mono } from 'next/font/google';
import { ThemeProvider } from "next-themes";

// 默认Inter字体
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Matrix主题字体
const matrixFont = VT323({ 
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-vt323',
});

export const metadata: Metadata = {
  title: 'The Matrix of Movies - Enter the System',
  description: 'Discover movies that match your emotional pattern in the system.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${matrixFont.className} bg-black text-green-500 antialiased text-base`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <main className="min-h-screen">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
