import React from 'react';
import Link from 'next/link';
import MoodSelector from '@/components/MoodSelector';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 页面头部 */}
      <header className="py-4 px-6 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mood2Movie</h1>
        <div>
          <Link href="/sign-in">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:shadow-md transition">
              登录
            </button>
          </Link>
        </div>
      </header>
      
      {/* 主要内容区 */}
      <main className="flex-grow flex flex-col p-4 md:p-8">
        <div className="max-w-4xl w-full mx-auto text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            根据心情发现完美电影
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            你现在的感受是？
          </p>
        </div>
        
        <MoodSelector />
      </main>
      
      {/* 页脚 */}
      <footer className="py-4 px-6 border-t text-center text-sm text-muted-foreground">
        <p>© 2023 Mood2Movie. 选择心情，发现电影。</p>
      </footer>
    </div>
  );
} 