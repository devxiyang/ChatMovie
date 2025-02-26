'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Star, Calendar, Info, X, ImageOff, ThumbsUp, Heart, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  vote_average: number;
  genres?: string[] | { id: number; name: string }[];
}

interface MovieSearchResultsProps {
  movies: Movie[];
  onClose?: () => void;
  language?: 'en' | 'zh'; // Add language prop for UI text
}

export function MovieSearchResults({ movies, onClose, language = 'en' }: MovieSearchResultsProps) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [visibleMovies, setVisibleMovies] = useState(8);
  const [favoriteMovies, setFavoriteMovies] = useState<Record<number, boolean>>({});
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  if (!movies || movies.length === 0) {
    return null;
  }

  // Localized text dictionary
  const text = {
    en: {
      found: "Found",
      movies: "movies",
      clickForDetails: "Click card for details",
      showMore: "Show more movies",
      favorite: "Favorite",
      favorited: "Favorited",
      noOverview: "No overview available",
      viewDetails: "View Details",
      watchTrailer: "Watch Trailer"
    },
    zh: {
      found: "找到",
      movies: "部电影",
      clickForDetails: "点击卡片查看详情",
      showMore: "显示更多电影",
      favorite: "收藏",
      favorited: "已收藏",
      noOverview: "暂无简介",
      viewDetails: "查看详情",
      watchTrailer: "观看预告片"
    }
  };

  // Use the appropriate text based on language
  const t = text[language];

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
  const getPosterUrl = (path: string | null) => {
    if (!path) return '';
    if (path.startsWith('http')) {
      return path;
    }
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  // 切换收藏状态
  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteMovies(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 显示更多电影
  const handleShowMore = () => {
    setVisibleMovies(prev => Math.min(prev + 8, movies.length));
  };

  // Handle image errors
  const handleImageError = (id: number) => {
    setImgErrors(prev => ({
      ...prev,
      [id]: true
    }));
    console.error(`Image failed to load for movie ID: ${id}`);
  };

  return (
    <div className="mt-4 mb-6 w-full bg-background/50 p-4 rounded-lg border shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>{t.found} {movies.length} {t.movies}</span>
          {movies.length > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {t.clickForDetails}
            </span>
          )}
        </h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X size={16} />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {movies.slice(0, visibleMovies).map((movie) => (
          <div 
            key={movie.id}
            className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
            onClick={() => {
              setSelectedMovie(movie);
              setDialogOpen(true);
            }}
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden">
              <div className={cn(
                "absolute inset-0 bg-gray-200 dark:bg-gray-800 flex items-center justify-center",
                !imgErrors[movie.id] && movie.poster_path && "opacity-0"
              )}>
                <ImageOff className="h-12 w-12 text-gray-400" />
              </div>
              
              {movie.poster_path && !imgErrors[movie.id] && (
                <img
                  src={getPosterUrl(movie.poster_path)}
                  alt={movie.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                  onError={() => handleImageError(movie.id)}
                />
              )}
              
              {/* 收藏按钮 */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity",
                  favoriteMovies[movie.id] && "opacity-100 text-red-500"
                )}
                onClick={(e) => toggleFavorite(movie.id, e)}
              >
                <Heart className={cn("h-4 w-4", favoriteMovies[movie.id] && "fill-current")} />
              </Button>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6 z-10">
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
      {visibleMovies < movies.length && (
        <div className="mt-3 text-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleShowMore}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            {t.showMore} ({movies.length - visibleMovies})
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
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                {(!selectedMovie.poster_path || imgErrors[selectedMovie.id]) && <ImageOff className="h-16 w-16 text-gray-400" />}
                
                {selectedMovie.poster_path && !imgErrors[selectedMovie.id] && (
                  <img
                    src={getPosterUrl(selectedMovie.poster_path)}
                    alt={selectedMovie.title}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(selectedMovie.id)}
                  />
                )}
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
                  
                  {/* 收藏按钮 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "ml-auto text-muted-foreground",
                      favoriteMovies[selectedMovie.id] && "text-red-500"
                    )}
                    onClick={(e) => toggleFavorite(selectedMovie.id, e)}
                  >
                    <Heart className={cn("h-4 w-4 mr-1", favoriteMovies[selectedMovie.id] && "fill-current")} />
                    {favoriteMovies[selectedMovie.id] ? t.favorited : t.favorite}
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {getGenres(selectedMovie).map((genre, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                      {genre}
                    </span>
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 max-h-[150px] overflow-y-auto">
                  {selectedMovie.overview || t.noOverview}
                </p>
                
                <div className="mt-auto space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => window.open(`https://www.themoviedb.org/movie/${selectedMovie.id}`, '_blank')}
                  >
                    <Info className="mr-2 h-4 w-4" />
                    {t.viewDetails}
                  </Button>
                  
                  <Button 
                    className="w-full flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedMovie.title + ' trailer')}`, '_blank')}
                  >
                    <Play className="h-4 w-4" />
                    {t.watchTrailer}
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