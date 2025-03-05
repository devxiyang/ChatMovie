'use client';

import React, { useState, useEffect } from 'react';
import MoodSelector from '@/components/MoodSelector';
import Image from 'next/image';
import { Mood } from '@/types/movies';

export default function HomePage() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [filmTransition, setFilmTransition] = useState(false);
  
  // 胶片切换效果
  const triggerFilmTransition = () => {
    setFilmTransition(true);
    setTimeout(() => setFilmTransition(false), 400);
  };
  
  // 从本地存储加载已选心情
  useEffect(() => {
    const savedMood = localStorage.getItem('selectedMood');
    if (savedMood) {
      setSelectedMood(savedMood as Mood);
    }
  }, []);
  
  // 监听心情变化
  useEffect(() => {
    const handleStorageChange = () => {
      const currentMood = localStorage.getItem('selectedMood');
      if (currentMood) {
        setSelectedMood(currentMood as Mood);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const handleEditMood = () => {
    triggerFilmTransition();
    
    setTimeout(() => {
      const moodSelectorElement = document.querySelector('.mood-selector-container');
      if (moodSelectorElement) {
        moodSelectorElement.scrollIntoView({ behavior: 'smooth' });
      }
      
      // 触发MoodSelector组件中的showMoodSelector状态
      localStorage.setItem('showMoodSelector', 'true');
      window.dispatchEvent(new Event('storage'));
    }, 300);
  };
  
  // 创建胶片穿孔
  const renderFilmPerforations = () => {
    const count = 20; // 穿孔数量
    const holes = [];
    
    for (let i = 0; i < count; i++) {
      holes.push(<div key={i} className="film-hole"></div>);
    }
    
    return <div className="film-perforations">{holes}</div>;
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      {/* 胶片质感效果 */}
      <div className="movie-grain"></div>
      <div className="film-border"></div>
      {renderFilmPerforations()}
      <div className="projector-flicker"></div>
      
      {/* 胶片切换效果 */}
      <div className={`film-transition ${filmTransition ? 'active' : ''}`}></div>
      
      {/* 页面头部 */}
      <header className="py-4 px-6 flex justify-between items-center border-b border-neutral-800 bg-black/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Image
            src="/popcorn.png"
            alt="Popcorn"
            width={32}
            height={32}
            className="drop-shadow-glow"
          />
        </div>
        <div className="flex items-center gap-2">
          {selectedMood && (
            <div className="text-lg flex items-center gap-2 mr-4 text-gray-200">
              <span>Feeling</span>
              <span className="text-xl">{getEmojiForMood(selectedMood)}</span>
              <span>{getMoodLabel(selectedMood)}</span>
            </div>
          )}
          <button 
            onClick={handleEditMood}
            className="red-button px-4 py-2 hover:bg-red-700"
          >
            {selectedMood ? `${getEmojiForMood(selectedMood)} EDIT MOOD` : '😊 SELECT MOOD'}
          </button>
        </div>
      </header>
      
      {/* 主要内容区 */}
      <main className="flex-grow flex flex-col p-4 md:p-8 pl-8 md:pl-12">
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

// 辅助函数 - 获取心情对应的表情
function getEmojiForMood(mood: Mood): string {
  const emojiMap: Record<Mood, string> = {
    happy: '😊',
    sad: '😢',
    excited: '🤩',
    relaxed: '😌',
    romantic: '💖',
    thoughtful: '🤔',
    nostalgic: '🕰️',
    adventurous: '🚀',
    inspired: '✨'
  };
  
  return emojiMap[mood] || '😊';
}

// 辅助函数 - 获取心情对应的文本标签
function getMoodLabel(mood: Mood): string {
  const labelMap: Record<Mood, string> = {
    happy: 'Cheerful',
    sad: 'Sad',
    excited: 'Excited',
    relaxed: 'Relaxed',
    romantic: 'Romantic',
    thoughtful: 'Thoughtful',
    nostalgic: 'Nostalgic',
    adventurous: 'Adventurous',
    inspired: 'Inspired'
  };
  
  return labelMap[mood] || 'Cheerful';
} 