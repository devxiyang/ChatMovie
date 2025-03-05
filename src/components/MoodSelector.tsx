'use client';

import React, { useState } from 'react';
import { Mood, Movie } from '@/types/movies';
import { getMoviesByMood } from '@/lib/movies';
import MovieCard from './MovieCard';
import MovieDetailsModal from './MovieDetailsModal';

interface MoodOption {
  mood: Mood;
  emoji: string;
  label: string;
}

const moodOptions: MoodOption[] = [
  { mood: 'happy', emoji: '😊', label: '开心' },
  { mood: 'sad', emoji: '😢', label: '伤感' },
  { mood: 'excited', emoji: '🤩', label: '兴奋' },
  { mood: 'relaxed', emoji: '😌', label: '放松' },
  { mood: 'romantic', emoji: '💖', label: '浪漫' },
  { mood: 'thoughtful', emoji: '🤔', label: '深思' },
  { mood: 'nostalgic', emoji: '🕰️', label: '怀旧' },
  { mood: 'adventurous', emoji: '🚀', label: '冒险' },
  { mood: 'inspired', emoji: '✨', label: '受鼓舞' },
];

export default function MoodSelector() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleMoodSelect = (mood: Mood) => {
    setIsLoading(true);
    setSelectedMood(mood);
    
    // 延迟一点以显示加载状态
    setTimeout(() => {
      const movies = getMoviesByMood(mood, 12);
      setRecommendedMovies(movies);
      setIsLoading(false);
      
      // 平滑滚动到推荐区域
      if (movies.length > 0) {
        document.getElementById('recommendations')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start' 
        });
      }
    }, 400);
  };

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const resetSelection = () => {
    setSelectedMood(null);
    setRecommendedMovies([]);
    
    // 平滑滚动回顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* 心情选择区 */}
      <div className={`transition-all duration-500 ${selectedMood && recommendedMovies.length > 0 ? 'scale-95 opacity-90' : ''}`}>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
          {moodOptions.map((option) => (
            <button
              key={option.mood}
              onClick={() => handleMoodSelect(option.mood)}
              className={`flex flex-col items-center justify-center p-5 rounded-xl transition-all duration-200 
                ${selectedMood === option.mood 
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                  : 'bg-card hover:bg-primary/10 hover:scale-105'}
              `}
            >
              <span className="text-5xl mb-3">{option.emoji}</span>
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div className="flex justify-center my-16">
          <div className="animate-bounce-slow text-4xl">🎬</div>
        </div>
      )}

      {/* 推荐电影区 */}
      {selectedMood && recommendedMovies.length > 0 && !isLoading && (
        <section id="recommendations" className="mt-16 mb-10 animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold flex items-center">
              <span className="text-3xl mr-2">
                {moodOptions.find(m => m.mood === selectedMood)?.emoji}
              </span>
              <span>适合{moodOptions.find(m => m.mood === selectedMood)?.label}心情的电影</span>
            </h2>
            <button 
              onClick={resetSelection}
              className="text-sm px-4 py-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              重新选择
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {recommendedMovies.map(movie => (
              <div 
                key={movie.id} 
                onClick={() => handleMovieSelect(movie)}
                className="cursor-pointer"
              >
                <MovieCard movie={movie} showDetails={false} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 电影详情模态框 */}
      {selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
} 