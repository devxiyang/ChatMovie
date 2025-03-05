'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Movie } from '@/types/movies';
import { getMoviesByMood } from '@/lib/movies';

interface MovieDetailsModalProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export default function MovieDetailsModal({ 
  movie, 
  isOpen, 
  onClose,
  onNext,
  onPrevious
}: MovieDetailsModalProps) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [filmTransition, setFilmTransition] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 显示胶片切换效果
      setFilmTransition(true);
      setTimeout(() => setFilmTransition(false), 300);
    }
  }, [isOpen, movie]);

  if (!isOpen) return null;

  // 提取电影年份
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  
  // 计算时长（模拟，因为我们的数据中可能没有时长）
  const runtime = '2h 10min';
  
  // 格式化评分
  const rating = movie.vote_average ? `${Math.round(movie.vote_average * 10) / 10}/10` : '';

  const handleNavigation = (direction: 'prev' | 'next') => {
    setFilmTransition(true);
    setTimeout(() => {
      if (direction === 'prev' && onPrevious) {
        onPrevious();
      } else if (direction === 'next' && onNext) {
        onNext();
      }
      setTimeout(() => setFilmTransition(false), 100);
    }, 300);
  };

  const handleClose = () => {
    setFilmTransition(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="movie-grain"></div>
      
      {/* 胶片切换效果 */}
      <div className={`film-transition ${filmTransition ? 'active' : ''}`}></div>
      
      <div className="bg-neutral-900 rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col modal-animation">
        {/* 胶片边框装饰 */}
        <div className="absolute inset-0 border-[3px] border-black z-10 pointer-events-none rounded-lg"></div>
        <div className="absolute left-1 top-10 bottom-10 w-[6px] bg-black flex flex-col gap-8 justify-center z-10 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-full h-[12px] bg-[#0c0c0c] border border-[#1e1e1e] rounded-[1px]"></div>
          ))}
        </div>
        
        {/* 电影预告片区域 */}
        <div className="relative w-full">
          {showTrailer && movie.trailer_url ? (
            <div className="video-container">
              <iframe
                src={movie.trailer_url.replace('watch?v=', 'embed/') + '?autoplay=1'}
                title={`${movie.title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="relative aspect-video w-full">
              {movie.backdrop_url ? (
                <Image
                  src={movie.backdrop_url}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                />
              ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                  <span className="text-white/60">No image available</span>
                </div>
              )}
              
              {/* 电影胶片穿孔装饰 */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-black flex items-center justify-center gap-12 overflow-hidden z-20">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="w-4 h-2 bg-[#1a1a1a] rounded-[1px]"></div>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-black flex items-center justify-center gap-12 overflow-hidden z-20">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="w-4 h-2 bg-[#1a1a1a] rounded-[1px]"></div>
                ))}
              </div>
              
              {/* 播放按钮覆盖层 */}
              {movie.trailer_url && !showTrailer && (
                <div 
                  className="trailer-overlay cursor-pointer" 
                  onClick={() => setShowTrailer(true)}
                >
                  <div className="trailer-play-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286l-11.54 6.347c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* 电影信息区域 */}
        <div className="p-6 bg-gradient-to-b from-neutral-900 to-black pl-10">
          <h2 className="text-2xl font-bold mb-2 text-white">{movie.title}</h2>
          
          <div className="flex items-center gap-2 mb-4 text-gray-300">
            <span>{releaseYear}</span>
            <span>•</span>
            <span>{runtime}</span>
            <span>•</span>
            <span className="font-medium text-white">{rating}</span>
          </div>
          
          {/* 流派标签 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genres.slice(0, 4).map(genre => (
              <span key={genre.id} className="genre-pill">
                {genre.name}
              </span>
            ))}
          </div>
          
          {/* 简介 */}
          <p className="text-gray-300 mb-6 line-clamp-3">{movie.overview}</p>
          
          {/* 导航按钮 */}
          <div className="flex items-center justify-between mt-4">
            <button 
              onClick={() => handleNavigation('prev')} 
              className="nav-button"
              disabled={!onPrevious}
              style={{ opacity: !onPrevious ? 0.5 : 1 }}
            >
              <span>↩ BACK</span>
            </button>
            
            <button onClick={handleClose} className="nav-button bg-red-700 hover:bg-red-600">
              <span>HIDE</span>
            </button>
            
            <button 
              onClick={() => handleNavigation('next')} 
              className="nav-button"
              disabled={!onNext}
              style={{ opacity: !onNext ? 0.5 : 1 }}
            >
              <span>NEXT ↪</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 