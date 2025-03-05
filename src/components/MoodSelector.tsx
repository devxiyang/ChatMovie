'use client';

import React, { useState, useEffect } from 'react';
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
  { mood: 'happy', emoji: '😊', label: 'Cheerful' },
  { mood: 'sad', emoji: '😢', label: 'Sad' },
  { mood: 'excited', emoji: '🤩', label: 'Excited' },
  { mood: 'relaxed', emoji: '😌', label: 'Relaxed' },
  { mood: 'romantic', emoji: '💖', label: 'Romantic' },
  { mood: 'thoughtful', emoji: '🤔', label: 'Thoughtful' },
];

export default function MoodSelector() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedMovieIndex, setSelectedMovieIndex] = useState<number>(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(true);

  // 从本地存储中加载上次选择的心情
  useEffect(() => {
    const savedMood = localStorage.getItem('selectedMood');
    if (savedMood) {
      const mood = savedMood as Mood;
      setSelectedMood(mood);
      setIsLoading(true);
      setTimeout(() => {
        const movies = getMoviesByMood(mood, 12);
        setRecommendedMovies(movies);
        setIsLoading(false);
        setShowMoodSelector(false);
      }, 400);
    }
  }, []);

  // 监听showMoodSelector的变化
  useEffect(() => {
    const handleStorageChange = () => {
      if (localStorage.getItem('showMoodSelector') === 'true') {
        setShowMoodSelector(true);
        localStorage.removeItem('showMoodSelector');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleMoodSelect = (mood: Mood) => {
    setIsLoading(true);
    setSelectedMood(mood);
    localStorage.setItem('selectedMood', mood);
    
    setTimeout(() => {
      const movies = getMoviesByMood(mood, 12);
      setRecommendedMovies(movies);
      setIsLoading(false);
      setShowMoodSelector(false);
    }, 400);
  };

  const handleMovieSelect = (movie: Movie) => {
    const index = recommendedMovies.findIndex(m => m.id === movie.id);
    setSelectedMovieIndex(index);
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleNextMovie = () => {
    if (selectedMovieIndex < recommendedMovies.length - 1) {
      const nextIndex = selectedMovieIndex + 1;
      setSelectedMovieIndex(nextIndex);
      setSelectedMovie(recommendedMovies[nextIndex]);
    }
  };

  const handlePreviousMovie = () => {
    if (selectedMovieIndex > 0) {
      const prevIndex = selectedMovieIndex - 1;
      setSelectedMovieIndex(prevIndex);
      setSelectedMovie(recommendedMovies[prevIndex]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* 心情选择区 */}
      {showMoodSelector && (
        <div className="mood-selector-container animate-fade-in">
          <div className="grid grid-cols-3 md:grid-cols-3 gap-8 justify-center">
            {moodOptions.map((option) => (
              <button
                key={option.mood}
                onClick={() => handleMoodSelect(option.mood)}
                className={`flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl transition-all duration-200 hover:transform hover:shadow-lg
                  ${selectedMood === option.mood 
                    ? 'bg-red-600 text-white scale-105 shadow-xl' 
                    : 'bg-gray-800 hover:bg-gray-700'}
                `}
              >
                <span className="text-6xl md:text-7xl mb-4">{option.emoji}</span>
                <span className="font-medium text-lg">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && (
        <div className="flex justify-center my-16">
          <div className="loading-bar w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-500"></div>
          </div>
        </div>
      )}

      {/* 推荐电影区 */}
      {selectedMood && recommendedMovies.length > 0 && !isLoading && !showMoodSelector && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-fade-in">
          {recommendedMovies.map(movie => (
            <div 
              key={movie.id} 
              onClick={() => handleMovieSelect(movie)}
              className="cursor-pointer transform transition-transform hover:scale-105"
            >
              <MovieCard movie={movie} showDetails={false} />
            </div>
          ))}
        </div>
      )}

      {/* 电影详情模态框 */}
      {selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          isOpen={isModalOpen}
          onClose={closeModal}
          onNext={handleNextMovie}
          onPrevious={handlePreviousMovie}
        />
      )}
    </div>
  );
} 