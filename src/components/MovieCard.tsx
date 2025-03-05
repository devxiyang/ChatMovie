import React from 'react';
import Image from 'next/image';
import { Movie } from '@/types/movies';

interface MovieCardProps {
  movie: Movie;
  showDetails?: boolean;
}

export default function MovieCard({ movie, showDetails = true }: MovieCardProps) {
  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg movie-card">
      {/* 胶片边框装饰 */}
      <div className="absolute inset-0 border-[3px] border-black z-10 pointer-events-none"></div>
      <div className="absolute left-0 top-4 bottom-4 w-[6px] bg-black flex flex-col gap-4 justify-center z-10 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-full h-[8px] bg-[#0c0c0c] border border-[#1e1e1e] rounded-[1px]"></div>
        ))}
      </div>
      
      {/* 电影海报 */}
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
        <div className="h-full w-full bg-neutral-800 flex items-center justify-center p-4">
          <span className="text-center font-medium text-gray-300">{movie.title}</span>
        </div>
      )}
      
      {/* 评分标签 */}
      <div className="absolute top-2 right-2 bg-black/80 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold text-xs shadow-glow z-20">
        {movie.score_percent}%
      </div>
      
      {/* 电影标题 - 在底部显示 */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent py-4 px-3 z-10">
        <h3 className="text-white font-medium line-clamp-2 text-sm drop-shadow-md pl-4">
          {movie.title} 
          <span className="text-white/70 ml-1">
            ({movie.release_date.split('-')[0]})
          </span>
        </h3>
      </div>
    </div>
  );
} 