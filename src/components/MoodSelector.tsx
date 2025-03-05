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
  color: string;
}

const moodOptions: MoodOption[] = [
  { mood: 'happy', emoji: '😊', label: '开心', color: 'bg-yellow-100 hover:bg-yellow-200' },
  { mood: 'sad', emoji: '😢', label: '伤感', color: 'bg-blue-100 hover:bg-blue-200' },
  { mood: 'excited', emoji: '🤩', label: '兴奋', color: 'bg-pink-100 hover:bg-pink-200' },
  { mood: 'relaxed', emoji: '😌', label: '放松', color: 'bg-green-100 hover:bg-green-200' },
  { mood: 'romantic', emoji: '💖', label: '浪漫', color: 'bg-red-100 hover:bg-red-200' },
  { mood: 'thoughtful', emoji: '🤔', label: '深思', color: 'bg-purple-100 hover:bg-purple-200' },
  { mood: 'nostalgic', emoji: '🕰️', label: '怀旧', color: 'bg-amber-100 hover:bg-amber-200' },
  { mood: 'adventurous', emoji: '🚀', label: '冒险', color: 'bg-cyan-100 hover:bg-cyan-200' },
  { mood: 'inspired', emoji: '✨', label: '受鼓舞', color: 'bg-indigo-100 hover:bg-indigo-200' },
];

export default function MoodSelector() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    const movies = getMoviesByMood(mood, 12);
    setRecommendedMovies(movies);
    
    // 平滑滚动到推荐区域
    if (movies.length > 0) {
      setTimeout(() => {
        document.getElementById('recommendations')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
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
    <div>
      {/* 心情选择区 */}
      <div className={`transition-all duration-500 ${selectedMood ? 'scale-90 opacity-80' : ''}`}>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 max-w-3xl mx-auto">
          {moodOptions.map((option) => (
            <button
              key={option.mood}
              onClick={() => handleMoodSelect(option.mood)}
              className={`flex flex-col items-center justify-center p-6 rounded-xl transition-transform duration-200 hover:scale-110 cursor-pointer ${option.color}`}
            >
              <span className="text-5xl mb-3">{option.emoji}</span>
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 推荐电影区 */}
      {selectedMood && recommendedMovies.length > 0 && (
        <section id="recommendations" className="mt-20 mb-10 animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold flex items-center">
              <span className="text-3xl mr-2">
                {moodOptions.find(m => m.mood === selectedMood)?.emoji}
              </span>
              {moodOptions.find(m => m.mood === selectedMood)?.label}电影推荐
            </h2>
            <button 
              onClick={resetSelection}
              className="text-sm px-3 py-1 rounded bg-muted hover:bg-muted/80 transition-colors"
            >
              重新选择
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {recommendedMovies.map(movie => (
              <div 
                key={movie.id} 
                onClick={() => handleMovieSelect(movie)}
                className="cursor-pointer transition-transform duration-200 hover:scale-105"
              >
                <MovieCard movie={movie} />
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