'use client';

import React, { useState } from 'react';
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

  if (!isOpen) return null;

  // 提取电影年份
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  
  // 计算时长（模拟，因为我们的数据中可能没有时长）
  const runtime = '2h 10min';
  
  // 格式化评分
  const rating = movie.vote_average ? `${Math.round(movie.vote_average * 10) / 10}/10` : '';

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col modal-animation">
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
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">{movie.title}</h2>
          
          <div className="flex items-center gap-2 mb-4 text-gray-300">
            <span>{releaseYear}</span>
            <span>•</span>
            <span>{runtime}</span>
            <span>•</span>
            <span className="font-medium">{rating}</span>
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
            <button onClick={onPrevious} className="nav-button">
              <span>↩ BACK</span>
            </button>
            
            <button onClick={onClose} className="nav-button bg-red-700 hover:bg-red-600">
              <span>HIDE</span>
            </button>
            
            <button onClick={onNext} className="nav-button">
              <span>NEXT ↪</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 