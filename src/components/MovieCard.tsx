import React from 'react';
import Image from 'next/image';
import { Movie } from '@/types/movies';

interface MovieCardProps {
  movie: Movie;
  showDetails?: boolean;
}

export default function MovieCard({ movie, showDetails = true }: MovieCardProps) {
  return (
    <div className="movie-card-animation overflow-hidden rounded-lg bg-white dark:bg-card shadow-md">
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        {movie.poster_url ? (
          <Image
            src={movie.poster_url}
            alt={movie.title}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground p-4">
            <span className="text-center">{movie.title}</span>
          </div>
        )}
        
        {/* 渐变遮罩和标题 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100">
          <div className="absolute bottom-2 left-2 right-2">
            <h3 className="text-white font-medium line-clamp-2 text-sm">{movie.title}</h3>
            {movie.release_date && (
              <p className="text-white/70 text-xs mt-1">
                {movie.release_date.split('-')[0]}
              </p>
            )}
          </div>
        </div>
        
        {/* 评分标签 */}
        <div className="absolute top-2 right-2 bg-primary/90 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold text-xs shadow-lg">
          {movie.score_percent}%
        </div>
      </div>
      
      {/* 详情区域（可选） */}
      {showDetails && (
        <div className="p-3">
          <div className="flex justify-between items-center mt-1">
            <div className="flex flex-wrap gap-1 mt-1">
              {movie.genres.slice(0, 1).map(genre => (
                <span key={genre.id} className="text-xs px-2 py-0.5 bg-muted rounded-full">
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 