import React from 'react';
import MoodSelector from '@/components/MoodSelector';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 页面头部 */}
      <header className="py-4 px-6 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <Image
            src="/popcorn.png"
            alt="Popcorn"
            width={32}
            height={32}
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
            😊 EDIT MOOD
          </button>
        </div>
      </header>
      
      {/* 主要内容区 */}
      <main className="flex-grow flex flex-col p-4 md:p-8">
        <div className="max-w-3xl w-full mx-auto text-center mb-8">
          <p className="text-lg text-muted-foreground mb-6">
            选择你此刻的心情，我们会推荐适合的电影
          </p>
        </div>
        
        <MoodSelector />
      </main>
      
      {/* 页脚 */}
      <footer className="py-4 px-6 text-center text-sm text-muted-foreground">
        <p>© 2023 Mood2Movie</p>
      </footer>
    </div>
  );
} 