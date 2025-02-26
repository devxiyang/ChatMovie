'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Star, Calendar, Info, X } from 'lucide-react';
import { MovieVideo } from '@/lib/tmdb';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date?: string;
  vote_average: number;
  genres?: string[] | { id: number; name: string }[];
}

interface MovieSearchResultsProps {
  movies: Movie[];
  onClose?: () => void;
}

export function MovieSearchResults({ movies, onClose }: MovieSearchResultsProps) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!movies || movies.length === 0) {
    return null;
  }

  // 从电影对象中提取年份
  const getYear = (movie: Movie) => {
    if (movie.release_date) {
      return new Date(movie.release_date).getFullYear();
    }
    return null;
  };

  // 从电影对象中提取类型
  const getGenres = (movie: Movie): string[] => {
    if (!movie.genres) return [];
    
    if (Array.isArray(movie.genres)) {
      if (typeof movie.genres[0] === 'string') {
        return movie.genres as string[];
      }
      return (movie.genres as { id: number; name: string }[]).map(g => g.name);
    }
    
    return [];
  };

  // 构建海报URL
  const getPosterUrl = (path: string) => {
    if (path.startsWith('http')) {
      return path;
    }
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  return (
    <div className="mt-4 mb-6 w-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">找到 {movies.length} 部电影</h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X size={16} />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {movies.slice(0, 8).map((movie) => (
          <div 
            key={movie.id}
            className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={() => {
              setSelectedMovie(movie);
              setDialogOpen(true);
            }}
          >
            <div className="relative aspect-[2/3] w-full">
              <Image
                src={getPosterUrl(movie.poster_path)}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                <h4 className="text-white font-medium text-sm truncate">{movie.title}</h4>
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    {movie.vote_average.toFixed(1)}
                  </span>
                  {getYear(movie) && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {getYear(movie)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 更多电影按钮 */}
      {movies.length > 8 && (
        <div className="mt-3 text-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // 这里可以实现显示更多电影的逻辑
              console.log('显示更多电影');
            }}
          >
            显示更多 ({movies.length - 8} 部)
          </Button>
        </div>
      )}
      
      {/* 电影详情对话框 */}
      {selectedMovie && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden">
            <DialogHeader className="p-4 bg-primary text-primary-foreground">
              <DialogTitle className="text-xl">{selectedMovie.title}</DialogTitle>
            </DialogHeader>
            
            <div className="grid md:grid-cols-2 gap-4 p-4">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                <Image
                  src={getPosterUrl(selectedMovie.poster_path)}
                  alt={selectedMovie.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1 text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{selectedMovie.vote_average.toFixed(1)}</span>
                  </div>
                  
                  {getYear(selectedMovie) && (
                    <div className="flex items-center gap-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                      <Calendar className="w-4 h-4" />
                      <span>{getYear(selectedMovie)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {getGenres(selectedMovie).map((genre, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                      {genre}
                    </span>
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedMovie.overview || "暂无简介"}
                </p>
                
                <div className="mt-auto space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => window.open(`https://www.themoviedb.org/movie/${selectedMovie.id}`, '_blank')}
                  >
                    <Info className="mr-2 h-4 w-4" />
                    查看详情
                  </Button>
                  
                  <Button 
                    className="w-full flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedMovie.title + ' trailer')}`, '_blank')}
                  >
                    <Play className="h-4 w-4" />
                    观看预告片
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 