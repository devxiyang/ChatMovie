'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mood, Movie } from '@/types/movies';
import { getMoviesByMood } from '@/lib/movies';
import MovieCard from './MovieCard';
import MovieDetailsModal from './MovieDetailsModal';
import AIRecommendation from './AIRecommendation';

interface MoodOption {
  id: Mood;
  label: string;
  icon: string;
  description: string;
}

export default function MoodSelector() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(4);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [filmTransition, setFilmTransition] = useState(false);
  const recommendationsRef = useRef<HTMLDivElement>(null);

  const moodOptions: MoodOption[] = [
    {
      id: 'happy',
      label: '开心',
      icon: '😊',
      description: '寻找能让你开怀大笑的电影'
    },
    {
      id: 'sad',
      label: '伤感',
      icon: '😢',
      description: '寻找能引起共鸣的情感电影'
    },
    {
      id: 'excited',
      label: '兴奋',
      icon: '🤩',
      description: '寻找紧张刺激的冒险电影'
    },
    {
      id: 'romantic',
      label: '浪漫',
      icon: '💖',
      description: '寻找温馨感人的爱情电影'
    },
    {
      id: 'thoughtful',
      label: '深思',
      icon: '🤔',
      description: '寻找引人深思的哲理电影'
    },
    {
      id: 'relaxed',
      label: '放松',
      icon: '😌',
      description: '寻找轻松舒适的休闲电影'
    }
  ];

  useEffect(() => {
    // 响应式调整每页显示数量
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesPerView(1);
      } else if (window.innerWidth < 768) {
        setSlidesPerView(2);
      } else if (window.innerWidth < 1024) {
        setSlidesPerView(3);
      } else {
        setSlidesPerView(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMoodSelect = async (mood: Mood) => {
    if (selectedMood === mood) return;
    
    setIsLoading(true);
    setSelectedMood(mood);
    setMovies([]);
    setShowAI(false);
    setCurrentSlide(0);
    
    // 电影加载时的胶片过渡效果
    setFilmTransition(true);
    setTimeout(() => setFilmTransition(false), 800);
    
    try {
      // 增加延迟以显示加载动画
      setTimeout(async () => {
        const moodMovies = await getMoviesByMood(mood);
        setMovies(moodMovies);
        setIsSlideshow(true);
        setIsLoading(false);
        
        // 滚动到推荐区域
        if (recommendationsRef.current) {
          recommendationsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 800);
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      setIsLoading(false);
    }
  };

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  const handleReset = () => {
    setSelectedMood(null);
    setMovies([]);
    setIsSlideshow(false);
    setShowAI(false);
  };

  const toggleAIMode = () => {
    if (!selectedMood) return;
    setShowAI(!showAI);
  };

  // 幻灯片导航功能
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const goToNextSlide = () => {
    const maxSlide = Math.ceil(movies.length / slidesPerView) - 1;
    setCurrentSlide((prev) => (prev < maxSlide ? prev + 1 : maxSlide));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">你现在的心情是?</h2>
        <p className="text-gray-300">选择一种心情，我们将为你推荐合适的电影</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-12">
        {moodOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleMoodSelect(option.id)}
            className={`flex flex-col items-center justify-center p-4 rounded-lg transition-transform hover:scale-105 ${
              selectedMood === option.id 
                ? 'bg-red-600 text-white shadow-lg' 
                : 'bg-neutral-800 text-gray-200 hover:bg-neutral-700'
            }`}
          >
            <span className="text-4xl mb-2">{option.icon}</span>
            <span className="font-medium">{option.label}</span>
          </button>
        ))}
      </div>

      {selectedMood && (
        <div ref={recommendationsRef} className="mt-16 relative">
          {/* 胶片过渡效果 */}
          {filmTransition && (
            <div className="absolute inset-0 bg-black z-10 film-transition-effect"></div>
          )}
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {showAI ? 'AI推荐' : `${moodOptions.find(m => m.id === selectedMood)?.label}心情的电影`}
              </h3>
              <p className="text-gray-400">
                {moodOptions.find(m => m.id === selectedMood)?.description}
              </p>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={toggleAIMode} 
                className={`px-4 py-2 rounded-md transition-colors ${
                  showAI 
                    ? 'bg-red-600 text-white' 
                    : 'bg-neutral-800 text-gray-200 hover:bg-neutral-700'
                }`}
              >
                {showAI ? '常规推荐' : 'AI推荐'}
              </button>
              
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-neutral-800 rounded-md text-gray-200 hover:bg-neutral-700 transition-colors"
              >
                重新选择
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="relative w-full max-w-2xl">
                <div className="loading-bar h-2 bg-neutral-800 w-full rounded overflow-hidden">
                  <div className="h-full"></div>
                </div>
                <p className="text-center text-gray-400 mt-4">电影加载中，请稍等...</p>
              </div>
            </div>
          ) : showAI ? (
            <AIRecommendation mood={selectedMood} onMovieSelect={handleMovieSelect} />
          ) : isSlideshow && movies.length > 0 ? (
            <div className="mb-16">
              {/* 幻灯片导航控制 */}
              <div className="relative film-slideshow-container">
                {/* 胶片边框装饰 */}
                <div className="absolute left-0 top-0 bottom-0 w-10 film-reel-decoration z-0"></div>
                <div className="absolute right-0 top-0 bottom-0 w-10 film-reel-decoration z-0"></div>
                
                {/* 幻灯片内容 */}
                <div 
                  className="flex transition-transform duration-500 transform px-12"
                  style={{ transform: `translateX(-${currentSlide * (100 / slidesPerView)}%)` }}
                >
                  {movies.map((movie, index) => (
                    <div 
                      key={movie.id} 
                      className="flex-shrink-0 p-3"
                      style={{ width: `${100 / slidesPerView}%` }}
                    >
                      <div 
                        onClick={() => handleMovieSelect(movie)}
                        className="cursor-pointer"
                      >
                        <MovieCard movie={movie} showDetails={false} />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 导航按钮 */}
                {currentSlide > 0 && (
                  <button 
                    onClick={goToPrevSlide}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 z-10"
                  >
                    ←
                  </button>
                )}
                
                {currentSlide < Math.ceil(movies.length / slidesPerView) - 1 && (
                  <button 
                    onClick={goToNextSlide}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 z-10"
                  >
                    →
                  </button>
                )}
                
                {/* 幻灯片指示器 */}
                <div className="flex justify-center mt-6">
                  {Array.from({ length: Math.ceil(movies.length / slidesPerView) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 mx-1 rounded-full ${
                        currentSlide === index ? 'bg-red-600' : 'bg-neutral-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : selectedMood && !showAI && movies.length === 0 && !isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">没有找到匹配的电影，请尝试其他心情或使用AI推荐。</p>
            </div>
          ) : null}
        </div>
      )}

      {selectedMovie && (
        <MovieDetailsModal 
          movie={selectedMovie} 
          isOpen={true}
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
} 