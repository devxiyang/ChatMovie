'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mood, Movie } from '@/types/movies';
import { getMoviesByMood } from '@/lib/movies';
import MovieCard from './MovieCard';
import MovieDetailsModal from './MovieDetailsModal';
import Image from 'next/image';

interface MoodOption {
  id: Mood;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

interface MoodSelectorProps {
  selectedMood: Mood | null;
  onMoodSelect: (mood: Mood | null) => void;
}

export default function MoodSelector({ selectedMood, onMoodSelect }: MoodSelectorProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const moviesRef = useRef<HTMLDivElement>(null);

  // 心情选项
  const moodOptions: MoodOption[] = [
    {
      id: 'happy',
      label: '愉悦',
      emoji: '😄',
      description: '轻松、搞笑、令人振奋的电影',
      color: 'from-yellow-500 to-orange-400'
    },
    {
      id: 'sad',
      label: '感伤',
      emoji: '😢',
      description: '感人、催泪、情感丰富的电影',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'excited',
      label: '兴奋',
      emoji: '🤩',
      description: '刺激、精彩、激动人心的电影',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'relaxed',
      label: '放松',
      emoji: '😌',
      description: '平静、治愈、舒缓的电影',
      color: 'from-green-400 to-teal-500'
    },
    {
      id: 'romantic',
      label: '浪漫',
      emoji: '💘',
      description: '爱情、温馨、甜蜜的电影',
      color: 'from-pink-400 to-red-400'
    },
    {
      id: 'thoughtful',
      label: '深思',
      emoji: '🤔',
      description: '发人深省、哲理性强的电影',
      color: 'from-gray-600 to-gray-800'
    },
    {
      id: 'nostalgic',
      label: '怀旧',
      emoji: '🕰️',
      description: '经典、复古、怀旧的电影',
      color: 'from-amber-500 to-yellow-600'
    },
    {
      id: 'adventurous',
      label: '冒险',
      emoji: '🚀',
      description: '探险、奇幻、开拓性的电影',
      color: 'from-blue-600 to-indigo-800'
    },
    {
      id: 'inspired',
      label: '启发',
      emoji: '✨',
      description: '励志、鼓舞人心的电影',
      color: 'from-emerald-500 to-green-600'
    }
  ];

  // 当选择一个新心情时
  const handleMoodSelect = async (mood: Mood) => {
    // 保存到localstorage
    localStorage.setItem('selectedMood', mood);
    onMoodSelect(mood);
    
    setIsLoading(true);
    
    try {
      // 获取电影推荐
      const recommended = getMoviesByMood(mood, 12);
      
      // 设置状态并平滑滚动到电影区
      setTimeout(() => {
        setMovies(recommended);
        setIsLoading(false);
        
        // 平滑滚动到电影列表
        if (moviesRef.current) {
          moviesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 600);
    } catch (error) {
      console.error('获取电影失败:', error);
      setIsLoading(false);
    }
  };
  
  // 载入已选心情的电影
  useEffect(() => {
    if (selectedMood) {
      handleMoodSelect(selectedMood);
    }
  }, []);
  
  // 处理电影卡片点击
  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
  };
  
  // 关闭详情模态框
  const handleCloseModal = () => {
    setSelectedMovie(null);
  };
  
  // 渲染心情选择器
  const renderMoodSelector = () => {
    return (
      <div className="mood-container">
        {moodOptions.map((option) => (
          <div
            key={option.id}
            className={`mood-item ${selectedMood === option.id ? 'selected' : ''}`}
            onClick={() => handleMoodSelect(option.id)}
            style={{
              background: selectedMood === option.id 
                ? `linear-gradient(135deg, rgba(229, 9, 20, 0.1), rgba(229, 9, 20, 0.2))` 
                : undefined
            }}
          >
            <div className="mood-emoji">{option.emoji}</div>
            <div className="mood-label">{option.label}</div>
          </div>
        ))}
      </div>
    );
  };
  
  // 渲染电影列表
  const renderMovies = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <div className="relative">
            <svg className="animate-spin w-10 h-10 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="mt-3 text-zinc-400 text-sm text-center">加载中...</div>
          </div>
        </div>
      );
    }
    
    if (movies.length === 0 && selectedMood) {
      return (
        <div className="text-center py-12">
          <p className="text-zinc-400">没有找到匹配的电影</p>
        </div>
      );
    }
    
    return (
      <div className="movie-grid" ref={moviesRef}>
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card" onClick={() => handleMovieSelect(movie)}>
            {movie.poster_url ? (
              <Image
                src={movie.poster_url}
                alt={movie.title}
                fill
                sizes="(max-width: 640px) 140px, 180px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center p-4">
                <span className="text-center">{movie.title}</span>
              </div>
            )}
            
            <div className="movie-info">
              <h3 className="movie-title">{movie.title}</h3>
              <div className="movie-meta">
                <span className="movie-rating">{movie.score_percent}%</span>
                <span>
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'}
                </span>
              </div>
            </div>
            
            {/* AI推荐标记 */}
            {movie.mood_tags && movie.mood_tags.some(tag => 
              tag.toLowerCase().includes(selectedMood?.toLowerCase() || '')
            ) && (
              <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded z-10">
                AI推荐
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="mood-selector">
      {/* 心情选择区 */}
      {!selectedMood || movies.length === 0 ? renderMoodSelector() : null}
      
      {/* 电影展示区 */}
      {selectedMood && (
        <div className="movies-container mt-8">
          <h2 className="text-2xl font-bold mb-6">
            为您推荐的电影
            {isLoading ? '' : ` (${movies.length})`}
          </h2>
          {renderMovies()}
        </div>
      )}
      
      {/* 电影详情模态框 */}
      {selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          isOpen={!!selectedMovie}
          onClose={handleCloseModal}
          onNext={() => {
            const currentIndex = movies.findIndex(m => m.id === selectedMovie.id);
            const nextMovie = movies[(currentIndex + 1) % movies.length];
            setSelectedMovie(nextMovie);
          }}
          onPrevious={() => {
            const currentIndex = movies.findIndex(m => m.id === selectedMovie.id);
            const prevMovie = movies[(currentIndex - 1 + movies.length) % movies.length];
            setSelectedMovie(prevMovie);
          }}
        />
      )}
    </div>
  );
} 