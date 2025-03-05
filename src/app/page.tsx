'use client';

import React, { useState, useEffect } from 'react';
import MoodSelector from '@/components/MoodSelector';
import Image from 'next/image';
import { Mood } from '@/types/movies';

export default function HomePage() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  
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
    const moodSelectorElement = document.querySelector('.mood-selector-container');
    if (moodSelectorElement) {
      moodSelectorElement.scrollIntoView({ behavior: 'smooth' });
    }
    
    // 触发MoodSelector组件中的showMoodSelector状态
    localStorage.setItem('showMoodSelector', 'true');
    window.dispatchEvent(new Event('storage'));
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-900">
      {/* 页面头部 */}
      <header className="py-4 px-6 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Image
            src="/popcorn.png"
            alt="Popcorn"
            width={32}
            height={32}
          />
        </div>
        <div className="flex items-center gap-2">
          {selectedMood && (
            <div className="text-lg flex items-center gap-2 mr-4">
              <span>Feeling</span>
              <span className="text-xl">{getEmojiForMood(selectedMood)}</span>
              <span>{getMoodLabel(selectedMood)}</span>
            </div>
          )}
          <button 
            onClick={handleEditMood}
            className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            {selectedMood ? `${getEmojiForMood(selectedMood)} EDIT MOOD` : '😊 SELECT MOOD'}
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