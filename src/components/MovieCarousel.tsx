'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Movie } from '@/types/movies';

interface MovieCarouselProps {
  movies: Movie[];
  autoplaySpeed?: number;
}

export default function MovieCarousel({ movies, autoplaySpeed = 5000 }: MovieCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // 设置自动播放
  useEffect(() => {
    if (movies.length <= 1) return;
    
    startAutoplay();
    
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [movies.length, autoplaySpeed]);
  
  // 启动自动播放
  const startAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
    
    autoplayRef.current = setInterval(() => {
      goToNextSlide();
    }, autoplaySpeed);
  };
  
  // 暂停自动播放
  const pauseAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  };
  
  // 处理轮播导航
  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlide) return;
    
    setIsAnimating(true);
    setCurrentSlide(index);
    
    // 重置动画状态
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
    
    // 重置自动播放
    pauseAutoplay();
    startAutoplay();
  };
  
  const goToNextSlide = () => {
    goToSlide((currentSlide + 1) % movies.length);
  };
  
  const goToPrevSlide = () => {
    goToSlide((currentSlide - 1 + movies.length) % movies.length);
  };
  
  // 如果没有电影数据
  if (!movies || movies.length === 0) {
    return (
      <div className="hero-carousel bg-zinc-900 flex items-center justify-center">
        <p className="text-zinc-500">暂无电影数据</p>
      </div>
    );
  }
  
  return (
    <div 
      className="hero-carousel relative overflow-hidden"
      onMouseEnter={pauseAutoplay}
      onMouseLeave={startAutoplay}
    >
      {/* 电影幻灯片 */}
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          ref={(el) => { slidesRef.current[index] = el; }}
          className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
        >
          {/* 背景图片 */}
          {movie.backdrop_url ? (
            <Image
              src={movie.backdrop_url}
              alt={movie.title}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 bg-zinc-900"></div>
          )}
          
          {/* 内容浮层 */}
          <div className="hero-content">
            <h2 className="hero-title">{movie.title}</h2>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-red-600 px-2 py-1 rounded text-sm font-bold">
                {movie.score_percent}%
              </span>
              <span className="text-zinc-400">
                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'}
              </span>
              <span className="text-zinc-400">
                {movie.genres.slice(0, 2).map(g => g.name).join(' / ')}
              </span>
            </div>
            <p className="hero-description line-clamp-2 md:line-clamp-3">
              {movie.overview}
            </p>
            
            {/* AI评论/推荐 */}
            {movie.ai_review && (
              <div className="hidden md:block mt-3 italic text-sm text-zinc-300 line-clamp-2 pb-3">
                "{movie.ai_review.split('.')[0]}."
              </div>
            )}
            
            <button 
              className="cinema-button mt-4"
              onClick={() => console.log('View details for:', movie.title)}
            >
              了解详情
            </button>
          </div>
          
          {/* 胶片穿孔装饰 - 左侧 */}
          <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-around py-6 pointer-events-none">
            <div className="h-full flex flex-col justify-around">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-4 h-6 mx-auto bg-black border border-zinc-800"></div>
              ))}
            </div>
          </div>
        </div>
      ))}
      
      {/* 导航按钮 - 仅在多个幻灯片时显示 */}
      {movies.length > 1 && (
        <>
          <button 
            className="absolute left-12 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 transition-colors text-white"
            onClick={goToPrevSlide}
            aria-label="上一张"
          >
            ❮
          </button>
          <button 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 transition-colors text-white"
            onClick={goToNextSlide}
            aria-label="下一张"
          >
            ❯
          </button>
        </>
      )}
      
      {/* 幻灯片指示器 */}
      {movies.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {movies.map((_, index) => (
            <button
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-gray-500'
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`转到幻灯片 ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
} 