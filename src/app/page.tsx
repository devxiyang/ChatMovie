import React from 'react';
import MoodSelector from '@/components/MoodSelector';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 页面头部 */}
      <header className="py-4 px-6 flex justify-center items-center">
        <h1 className="text-3xl font-bold">Mood2Movie</h1>
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