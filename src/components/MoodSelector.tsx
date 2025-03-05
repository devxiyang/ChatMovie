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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleMoodSelect = (mood: Mood) => {
    setIsLoading(true);
    setSelectedMood(mood);
    
    setTimeout(() => {
      const movies = getMoviesByMood(mood, 12);
      setRecommendedMovies(movies);
      setIsLoading(false);
    }, 400);
  };

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* 心情显示区 */}
      {selectedMood && !isLoading && (
        <div className="text-xl mb-8 flex items-center gap-2">
          <span>Feeling</span>
          <span className="text-2xl">{moodOptions.find(m => m.mood === selectedMood)?.emoji}</span>
          <span>{moodOptions.find(m => m.mood === selectedMood)?.label}</span>
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && (
        <div className="flex justify-center my-16">
          <div className="loading-bar w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary"></div>
          </div>
        </div>
      )}

      {/* 推荐电影区 */}
      {selectedMood && recommendedMovies.length > 0 && !isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
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
        />
      )}
    </div>
  );
} 