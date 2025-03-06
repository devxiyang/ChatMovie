import React from 'react';
import Image from 'next/image';
import { Movie } from '@/types/movies';

interface MovieCardProps {
  movie: Movie;
  onClick?: () => void;
  showRating?: boolean;
  className?: string;
}

export default function MovieCard({ 
  movie, 
  onClick, 
  showRating = true,
  className = ''
}: MovieCardProps) {
  // 获取年份
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  
  return (
    <div 
      className={`movie-card group ${className}`}
      onClick={onClick}
    >
      {/* 海报图片 */}
      {movie.poster_url ? (
        <Image
          src={movie.poster_url}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          priority={false}
        />
      ) : (
        <div className="absolute inset-0 bg-[var(--color-card)] flex items-center justify-center p-4">
          <span className="text-center text-sm text-[var(--color-text-secondary)]">
            {movie.title}
          </span>
        </div>
      )}

      {/* 评分徽章 */}
      {showRating && (
        <div className="absolute top-2 left-2 rating-badge z-10">
          {movie.score_percent}%
        </div>
      )}

      {/* 电影信息覆盖层 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-base font-medium mb-1 truncate">{movie.title}</h3>
          
          <div className="flex items-center text-xs text-[var(--color-text-secondary)]">
            {year && <span>{year}</span>}
            
            {movie.genres && movie.genres.length > 0 && (
              <>
                <span className="mx-1">•</span>
                <span>{movie.genres[0].name}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 