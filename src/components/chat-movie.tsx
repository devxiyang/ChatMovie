'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Trash2, Film, ThumbsUp, X, ImageOff, Star, Calendar, Heart, Info, Play, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from "@/lib/utils";

// Example movie suggestions in English and Chinese
const MOVIE_SUGGESTIONS = {
  en: [
    "I want to watch an action adventure movie",
    "Recommend a romantic comedy",
    "What are some good sci-fi films",
    "I like mystery thriller movies",
    "Suggest some award-winning classic films",
    "What are the latest animated movies",
    "I want to watch a movie about travel",
    "What are some good family-friendly movies",
    "I want to see a dark comedy",
    "I'm feeling sad today, recommend a movie"
  ],
  zh: [
    "我想看一部动作冒险电影",
    "推荐一部浪漫喜剧",
    "有哪些好看的科幻电影",
    "我喜欢悬疑惊悚片",
    "推荐一些获奖的经典电影",
    "最新的动画电影有哪些",
    "我想看关于旅行的电影",
    "有什么适合全家观看的电影",
    "我想看一部黑色喜剧",
    "我今天感到有点伤心，推荐一部电影"
  ]
};

// Movie interface
interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  vote_average: number;
  genres?: string[] | { id: number; name: string }[];
}

export function ChatMovie() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [favoriteMovies, setFavoriteMovies] = useState<Record<number, boolean>>({});
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  
  // Initialize suggestions based on detected language
  useEffect(() => {
    // Use browser language as initial guess, defaulting to English
    const browserLang = navigator.language.toLowerCase();
    const initialLang = browserLang.startsWith('zh') ? 'zh' : 'en';
    setLanguage(initialLang);
    
    // Set random suggestions in the detected language
    const langSuggestions = MOVIE_SUGGESTIONS[initialLang];
    setSuggestions(langSuggestions.sort(() => 0.5 - Math.random()).slice(0, 3));
  }, []);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    onResponse: (response) => {
      console.log('Chat response received');
      setError(null);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setError(language === 'en'
        ? "An error occurred while communicating with the AI. Please try again."
        : "与AI通信时发生错误。请重试。");
    }
  });

  // Detect language from user input
  useEffect(() => {
    if (input && input.trim()) {
      // Simple language detection - if contains Chinese characters, assume Chinese
      const containsChinese = /[\u4E00-\u9FFF]/.test(input);
      if (containsChinese && language !== 'zh') {
        setLanguage('zh');
        // Update suggestions for Chinese
        setSuggestions(MOVIE_SUGGESTIONS.zh.sort(() => 0.5 - Math.random()).slice(0, 3));
      } else if (!containsChinese && language !== 'en') {
        setLanguage('en');
        // Update suggestions for English
        setSuggestions(MOVIE_SUGGESTIONS.en.sort(() => 0.5 - Math.random()).slice(0, 3));
      }
    }
  }, [input, language]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Clear conversation
  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  // Use suggestion
  const handleUseSuggestion = (suggestion: string) => {
    // Create a mock form submit event
    const formEvent = {
      preventDefault: () => {},
      currentTarget: {
        elements: {
          message: { value: suggestion }
        }
      }
    } as unknown as React.FormEvent<HTMLFormElement>;
    
    // Update input value and submit
    handleInputChange({ target: { value: suggestion } } as React.ChangeEvent<HTMLInputElement>);
    setTimeout(() => handleSubmit(formEvent), 100);
  };

  // Handle image errors
  const handleImageError = (id: number) => {
    setImgErrors(prev => ({
      ...prev,
      [id]: true
    }));
    console.error(`Image failed to load for movie ID: ${id}`);
  };

  // Toggle favorite status
  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteMovies(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Get year from movie
  const getYear = (movie: Movie) => {
    if (movie.release_date) {
      return new Date(movie.release_date).getFullYear();
    }
    return null;
  };

  // Get genres from movie
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

  // Build poster URL
  const getPosterUrl = (path: string | null) => {
    if (!path) return '';
    if (path.startsWith('http')) {
      return path;
    }
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  // Render movie cards component
  const MovieCards = ({ movies }: { movies: Movie[] }) => {
    if (!movies || movies.length === 0) return null;
    
    return (
      <div className="rounded-lg p-4 bg-muted/50 border border-border shadow-sm w-full mt-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {t.found} {movies.length} {t.movies}
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-2">
          {movies.slice(0, 4).map((movie) => (
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
                  <ImageOff className="h-8 w-8 text-gray-400" />
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
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6 z-10">
                  <h4 className="text-white font-medium text-xs truncate">{movie.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <span className="flex items-center gap-1">
                      <Star className="w-2 h-2 text-yellow-500" />
                      {(movie.vote_average !== undefined ? movie.vote_average : 0).toFixed(1)}
                    </span>
                    {getYear(movie) && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-2 h-2" />
                        {getYear(movie)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {movies.length > 4 && (
          <Button 
            variant="outline" 
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              // Show all movies in dialog
              setSelectedMovie(movies[0]);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            {t.showMore} ({movies.length - 4})
          </Button>
        )}
      </div>
    );
  };

  // Localized text based on detected language
  const t = {
    en: {
      title: "Movie AI Assistant",
      clearChat: "Clear Chat",
      assistantTitle: "Movie Recommendation Assistant",
      assistantDescription: "Tell me what kind of movie you'd like to watch, and I'll immediately recommend the perfect options for you!",
      thinking: "Thinking...",
      searching: "Searching for movies...",
      inputPlaceholder: "Describe the movie you want to watch...",
      hintText: "You can ask any movie-related questions or describe the type of movie you want to watch",
      movieResults: "Movie Results",
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
      title: "电影AI助手",
      clearChat: "清空对话",
      assistantTitle: "电影推荐助手",
      assistantDescription: "告诉我您想看什么类型的电影，我会立即为您推荐最适合的选择！",
      thinking: "思考中...",
      searching: "正在搜索电影...",
      inputPlaceholder: "描述您想看的电影...",
      hintText: "您可以提问任何与电影相关的问题，或描述您想观看的电影类型",
      movieResults: "电影结果",
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
  }[language];

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-4 gap-4">
      {/* Title bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Film className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{t.title}</h2>
        </div>
        
        {messages.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearChat}
            className="text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {t.clearChat}
          </Button>
        )}
      </div>
      
      {/* Chat card */}
      <Card className="flex-1 flex flex-col overflow-hidden border-muted">
        {/* Message area */}
        <div 
          ref={messageContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{ maxHeight: 'calc(100vh - 240px)' }}
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Film className="h-12 w-12 text-muted mb-4" />
              <h3 className="text-xl font-medium mb-2">{t.assistantTitle}</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {t.assistantDescription}
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((suggestion, i) => (
                  <Button 
                    key={i} 
                    variant="outline" 
                    size="sm"
                    className="text-sm"
                    onClick={() => handleUseSuggestion(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Display messages with tool invocations */}
              {messages.map((message, i) => (
                <div key={i} className="space-y-2">
                  {/* Regular message */}
                  <div
                    className={cn(
                      "flex",
                      message.role === 'assistant' ? "justify-start" : "justify-end"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-lg px-4 py-2 max-w-[85%] shadow-sm",
                        message.role === 'assistant' 
                          ? "bg-muted text-muted-foreground" 
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                  
                  {/* Tool invocations */}
                  {message.toolInvocations?.map((toolInvocation) => {
                    const { toolName, toolCallId, state } = toolInvocation;
                    
                    // Handle searchMovies tool
                    if (toolName === 'searchMovies') {
                      if (state === 'partial-call') {
                        // Loading state
                        return (
                          <div key={toolCallId} className="flex justify-start w-full">
                            <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>{t.searching}</span>
                            </div>
                          </div>
                        );
                      } else if (state === 'result') {
                        // Result state
                        const { result } = toolInvocation as any;
                        if (result && result.movies && result.movies.length > 0) {
                          return (
                            <div key={toolCallId} className="flex justify-start w-full">
                              <MovieCards movies={result.movies} />
                            </div>
                          );
                        } else {
                          // No movies found
                          return (
                            <div key={toolCallId} className="flex justify-start w-full">
                              <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg px-4 py-2 flex items-center gap-2">
                                <X className="h-4 w-4" />
                                <span>
                                  {language === 'en' 
                                    ? "No movies found matching your criteria. Try a different description."
                                    : "找不到符合您条件的电影。请尝试不同的描述。"}
                                </span>
                              </div>
                            </div>
                          );
                        }
                      }
                    }
                    
                    return null;
                  })}
                </div>
              ))}
              
              {/* Error message */}
              {error && (
                <div className="flex justify-start w-full">
                  <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg px-4 py-2 flex items-center gap-2">
                    <X className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              {/* Auto-scroll reference */}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        {/* Status indicator */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground p-2 border-t border-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">{t.thinking}</span>
          </div>
        )}
        
        {/* Input form */}
        <form
          onSubmit={handleSubmit}
          className="p-2 border-t border-muted flex gap-2"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={t.inputPlaceholder}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>

      {/* Movie detail dialog */}
      {selectedMovie && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden">
            <DialogHeader className="p-4 bg-primary text-primary-foreground">
              <DialogTitle className="text-xl">{selectedMovie.title}</DialogTitle>
            </DialogHeader>
            
            <div className="p-4">
              {/* Selected movie details */}
              <div className="grid md:grid-cols-2 gap-4">
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
                      <span>{(selectedMovie.vote_average !== undefined ? selectedMovie.vote_average : 0).toFixed(1)}</span>
                    </div>
                    
                    {getYear(selectedMovie) && (
                      <div className="flex items-center gap-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                        <Calendar className="w-4 h-4" />
                        <span>{getYear(selectedMovie)}</span>
                      </div>
                    )}
                    
                    {/* Favorite button */}
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
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Bottom hint */}
      <div className="text-center text-xs text-muted-foreground">
        <p>{t.hintText}</p>
      </div>
    </div>
  );
} 