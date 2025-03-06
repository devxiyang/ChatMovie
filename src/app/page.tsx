'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Movie, Mood } from '@/types/movies';
import { getMoviesByMood, getRandomRecommendedMovies } from '@/lib/movies';
import MovieCard from '@/components/MovieCard';

// 定义心情选项
const MOODS = [
  { id: 'trending', emoji: '🔥', title: 'Trending' },
  { id: 'action' as Mood, emoji: '⚔️', title: 'Action' },
  { id: 'romance' as Mood, emoji: '💝', title: 'Romance' },
  { id: 'animation' as Mood, emoji: '🧸', title: 'Animation' },
  { id: 'horror' as Mood, emoji: '👻', title: 'Horror' },
  { id: 'special' as Mood, emoji: '✨', title: 'Special' },
  { id: 'relaxed' as Mood, emoji: '😌', title: 'Drakor' },
  { id: 'happy' as Mood, emoji: '😄', title: 'Comedy' },
  { id: 'thoughtful' as Mood, emoji: '🤔', title: 'Drama' },
];

// 导航选项
const NAV_ITEMS = [
  { id: 'movie', label: 'Movie', active: true },
  { id: 'series', label: 'Series', active: false },
  { id: 'originals', label: 'Originals', active: false },
];

export default function HomePage() {
  const [selectedMood, setSelectedMood] = useState<string>('trending');
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 加载精选电影
    const featured = getRandomRecommendedMovies(5);
    setFeaturedMovies(featured);
    
    // 加载热门电影
    const trending = getRandomRecommendedMovies(12);
    setTrendingMovies(trending);
    setRecommendedMovies(trending);
    
    setIsLoading(false);
  }, []);

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    
    if (moodId === 'trending') {
      setRecommendedMovies(trendingMovies);
    } else {
      const movies = getMoviesByMood(moodId as Mood, 12);
      setRecommendedMovies(movies);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[var(--color-text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-16 pb-12">
      {/* 顶部导航 */}
      <nav className="navbar">
        <div className="container-custom h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* 网站Logo */}
            <h1 className="text-2xl font-bold">Flix.id</h1>
            
            {/* 导航选项 */}
            <div className="hidden md:flex items-center">
              {NAV_ITEMS.map(item => (
                <button 
                  key={item.id}
                  className={`nav-item ${item.active ? 'active' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 搜索和个人资料 */}
          <div className="flex items-center gap-4">
            {/* 搜索按钮 */}
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-surface)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            {/* 通知 */}
            <div className="relative">
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-surface)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">1</span>
            </div>
            
            {/* 个人资料 */}
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium">Sarah J</div>
                <div className="text-xs text-[var(--color-text-secondary)]">Premium</div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </nav>

      {/* 主轮播区 */}
      <section className="carousel-section">
        <div className="container-custom">
          <div className="carousel-container">
            {featuredMovies.slice(0, 2).map((movie, index) => (
              <div
                key={movie.id}
                className={`carousel-slide ${index === 0 ? 'opacity-100' : 'opacity-0'}`}
              >
                {movie.backdrop_url && (
                  <Image
                    src={movie.backdrop_url}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                )}
                <div className="carousel-content">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">{movie.title}</h2>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="rating-badge">{movie.score_percent}%</span>
                    <span className="text-[var(--color-text-secondary)]">
                      {new Date(movie.release_date).getFullYear()}
                    </span>
                    {movie.genres && movie.genres.length > 0 && (
                      <span className="text-[var(--color-text-secondary)]">
                        {movie.genres[0].name}
                      </span>
                    )}
                  </div>
                  <p className="max-w-xl text-[var(--color-text-secondary)] line-clamp-2 mb-4">
                    {movie.overview}
                  </p>
                  <button className="primary-button">Play Movie</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 类别选择 */}
      <section className="mb-6">
        <div className="container-custom">
          <div className="category-scroller">
            {MOODS.map((mood) => (
              <button
                key={mood.id}
                className={`category-item ${selectedMood === mood.id ? 'active' : ''}`}
                onClick={() => handleMoodSelect(mood.id)}
              >
                <span className="mood-emoji">{mood.emoji}</span>
                <span className="mood-title">{mood.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 电影展示区 */}
      <section>
        <div className="container-custom">
          <h2 className="section-title">
            {selectedMood === 'trending' 
              ? 'Trending in Animation' 
              : `${MOODS.find(m => m.id === selectedMood)?.title || 'Movies'}`}
          </h2>
          
          <div className="movie-grid">
            {recommendedMovies.map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
} 