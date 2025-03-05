import React from 'react';
import Image from 'next/image';
import { Movie } from '@/types/movies';

interface MovieCardProps {
  movie: Movie;
  showDetails?: boolean;
}

export default function MovieCard({ movie, showDetails = true }: MovieCardProps) {
  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-all duration-300">
      {movie.poster_url ? (
        <Image
          src={movie.poster_url}
          alt={movie.title}
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
      ) : (
        <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center p-4">
          <span className="text-center font-medium">{movie.title}</span>
        </div>
      )}
      
      {/* 评分标签 */}
      <div className="absolute top-2 right-2 bg-black/80 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold text-xs">
        {movie.score_percent}%
      </div>
      
      {/* 电影标题 - 在底部显示 */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent py-3 px-3">
        <h3 className="text-white font-medium line-clamp-2 text-sm">
          {movie.title} 
          <span className="text-white/70 ml-1">
            ({movie.release_date.split('-')[0]})
          </span>
        </h3>
      </div>
    </div>
  );
} 