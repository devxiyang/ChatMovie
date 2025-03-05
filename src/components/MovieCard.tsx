import React from 'react';
import Image from 'next/image';
import { Movie } from '@/types/movies';

interface MovieCardProps {
  movie: Movie;
  showDetails?: boolean;
}

export default function MovieCard({ movie, showDetails = true }: MovieCardProps) {
  return (
    <div className="overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-xl h-full">
      <div className="relative aspect-[2/3] w-full overflow-hidden">
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
        <div className="absolute top-2 right-2 bg-primary/90 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold text-xs shadow-md">
          {movie.score_percent}%
        </div>
        
        {/* 电影标题 - 在底部显示 */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent py-3 px-3">
          <h3 className="text-white font-medium line-clamp-2 text-sm">
            {movie.title} 
            <span className="text-white/70 ml-1">
              ({movie.release_date.split('-')[0]})
            </span>
          </h3>
        </div>
      </div>
      
      {/* 简化的详情区域，与mood2movie一致 */}
      {showDetails && (
        <div className="p-2">
          <div className="flex flex-wrap gap-1">
            {movie.genres.slice(0, 2).map(genre => (
              <span key={genre.id} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                {genre.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 