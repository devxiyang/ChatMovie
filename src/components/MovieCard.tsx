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
            className="object-cover transition-transform duration-500 hover:scale-110"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground p-4">
            {movie.title}
          </div>
        )}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/70 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white font-medium line-clamp-2">{movie.title}</p>
          </div>
        </div>
        <div className="absolute top-2 right-2 bg-primary/90 rounded-full h-10 w-10 flex items-center justify-center text-white font-bold text-sm shadow-lg">
          {movie.score_percent}%
        </div>
      </div>
      
      {showDetails && (
        <div className="p-3">
          <h3 className="font-semibold text-sm line-clamp-1 mb-1">{movie.title}</h3>
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">{movie.release_date.split('-')[0]}</p>
            <div className="flex space-x-1">
              {movie.genres.slice(0, 2).map(genre => (
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