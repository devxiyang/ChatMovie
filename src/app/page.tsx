'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Mood } from '@/types/movies';
import MovieCarousel from '@/components/MovieCarousel';
import MoodSelector from '@/components/MoodSelector';
import { getRandomRecommendedMovies } from '@/lib/movies';

export default function HomePage() {
  // 状态管理
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [filmTransition, setFilmTransition] = useState(false);
  const [featuredMovies, setFeaturedMovies] = useState(getRandomRecommendedMovies(5));
  
  // 胶片切换效果
  const triggerFilmTransition = () => {
    setFilmTransition(true);
    setTimeout(() => setFilmTransition(false), 400);
  };
  
  // 从本地存储加载已选心情
  useEffect(() => {
    const savedMood = localStorage.getItem('selectedMood');
    if (savedMood) {
      try {
        setSelectedMood(savedMood as Mood);
      } catch (e) {
        localStorage.removeItem('selectedMood');
      }
    }
    
    // 每24小时刷新一次精选电影
    const lastUpdate = localStorage.getItem('featuredMoviesUpdated');
    if (!lastUpdate || (Date.now() - parseInt(lastUpdate)) > 86400000) {
      const newFeatured = getRandomRecommendedMovies(5);
      setFeaturedMovies(newFeatured);
      localStorage.setItem('featuredMoviesUpdated', Date.now().toString());
    }
  }, []);
  
  // 监听存储变化
  useEffect(() => {
    const handleStorageChange = () => {
      const savedMood = localStorage.getItem('selectedMood');
      if (savedMood) {
        setSelectedMood(savedMood as Mood);
      } else {
        setSelectedMood(null);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // 编辑心情
  const handleEditMood = () => {
    triggerFilmTransition();
    localStorage.removeItem('selectedMood');
    setSelectedMood(null);
  };
  
  // 渲染胶片穿孔装饰
  const renderFilmPerforations = (side: 'left' | 'right') => {
    return (
      <div className={`film-perforations ${side}`}>
        {[...Array(12)].map((_, i) => (
          <div key={i} className="film-hole"></div>
        ))}
      </div>
    );
  };
  
  return (
    <main className="flex flex-col min-h-screen overflow-hidden relative">
      {/* 胶片装饰 */}
      {renderFilmPerforations('left')}
      {renderFilmPerforations('right')}
      
      {/* 胶片切换效果 */}
      <div className={`film-transition ${filmTransition ? 'active' : ''}`}></div>
      
      {/* 胶片颗粒效果 */}
      <div className="movie-grain fixed inset-0 pointer-events-none"></div>
      
      {/* 顶部轮播区 */}
      <section className="w-full bg-black/80 shadow-xl border-b border-zinc-800 pt-6 pb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-6 text-shadow">
            精选电影
          </h1>
          
          {/* 电影轮播 */}
          <MovieCarousel movies={featuredMovies} />
        </div>
      </section>
      
      {/* 心情选择区 */}
      <section className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {selectedMood ? (
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="text-4xl">{getMoodEmoji(selectedMood)}</div>
                <h2 className="text-2xl font-semibold">{getMoodLabel(selectedMood)} 心情</h2>
              </div>
              <p className="text-gray-400 mb-6">
                我们为您精选了适合 {getMoodLabel(selectedMood).toLowerCase()} 心情的电影
              </p>
              <button 
                onClick={handleEditMood}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition"
              >
                更换心情
              </button>
            </div>
          ) : (
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4 text-shadow">选择您当前的心情</h2>
              <p className="text-gray-400">
                我们将根据您的心情推荐最合适的电影
              </p>
            </div>
          )}
          
          {/* 心情选择器组件 */}
          <MoodSelector 
            onMoodSelect={setSelectedMood} 
            selectedMood={selectedMood} 
          />
        </div>
      </section>
      
      {/* 页脚 */}
      <footer className="border-t border-zinc-800 bg-black/60 py-6">
        <div className="container mx-auto px-4 text-center text-zinc-500 text-sm">
          <p>基于Top 250电影的心情推荐系统 &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </main>
  );
}

// 获取心情对应的表情
function getMoodEmoji(mood: Mood): string {
  const emojis: Record<Mood, string> = {
    happy: '😄',
    sad: '😢',
    excited: '🤩',
    relaxed: '😌',
    romantic: '💘',
    thoughtful: '🤔',
    nostalgic: '🕰️',
    adventurous: '🚀',
    inspired: '✨'
  };
  
  return emojis[mood] || '🎬';
}

// 获取心情标签
function getMoodLabel(mood: Mood): string {
  const labels: Record<Mood, string> = {
    happy: '愉悦',
    sad: '感伤',
    excited: '兴奋',
    relaxed: '放松',
    romantic: '浪漫',
    thoughtful: '深思',
    nostalgic: '怀旧',
    adventurous: '冒险',
    inspired: '启发'
  };
  
  return labels[mood] || mood;
} 