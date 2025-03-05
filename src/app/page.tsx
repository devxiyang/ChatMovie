import React from 'react';
import Link from 'next/link';
import MoodSelector from '@/components/MoodSelector';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 页面头部 */}
      <header className="py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mood2Movie</h1>
        <div>
          <Link href="/sign-in">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition">
              登录
            </button>
          </Link>
        </div>
      </header>
      
      {/* 主要内容区 */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <div className="max-w-4xl w-full mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            根据心情发现最佳电影
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            每一种情绪都能找到适合的电影。告诉我们你现在的感受，我们将为你推荐最符合心情的电影。
          </p>
          
          <div className="mb-8">
            <h2 className="text-2xl font-medium mb-8">你现在的心情是？</h2>
            <MoodSelector />
          </div>
        </div>
      </main>
      
      {/* 页脚 */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© 2023 Mood2Movie. 选择情绪，发现电影。</p>
      </footer>
    </div>
  );
} 