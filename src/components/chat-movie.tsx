'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Trash2, Film, ThumbsUp, X } from "lucide-react";
import { MovieSearchResults } from '@/components/movie-search-results';
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

export function ChatMovie() {
  const [movies, setMovies] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMovies, setShowMovies] = useState(true);
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
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
    onToolCall: async (event: any) => {
      console.log('Tool call received:', event);
      
      // Check if this is the searchMovies function call
      const toolCall = event.toolCall;
      if (!toolCall) {
        console.log('No toolCall in event', event);
        return;
      }
      
      if (toolCall.type === 'function' && 
          toolCall.function?.name === 'searchMovies') {
        setIsSearching(true);
        try {
          // Parse arguments if needed
          const rawArgs = toolCall.function.arguments;
          const args = typeof rawArgs === 'string' 
            ? JSON.parse(rawArgs) 
            : rawArgs;
            
          console.log('Search movies args:', args);
          
          // Process search results
          if (args.movies && Array.isArray(args.movies) && args.movies.length > 0) {
            console.log(`Found ${args.movies.length} movies`);
            if (args.movies[0]) {
              console.log('First movie:', args.movies[0].title);
              console.log('First movie poster path:', args.movies[0].poster_path);
            }
            setMovies(args.movies);
            setShowMovies(true);
          } else {
            console.warn('No movies found in search results');
            setError(language === 'en' 
              ? "No movies found matching your criteria. Try a different description."
              : "找不到符合您条件的电影。请尝试不同的描述。");
          }
        } catch (e) {
          console.error('Error processing search results:', e);
          setError(language === 'en'
            ? "Failed to process movie search results."
            : "处理电影搜索结果时出错。");
        } finally {
          setIsSearching(false);
        }
      }
    },
    onFinish: async () => {
      setIsSearching(false);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setError(language === 'en'
        ? "An error occurred while communicating with the AI. Please try again."
        : "与AI通信时发生错误。请重试。");
      setIsSearching(false);
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
  }, [messages, movies]);

  // Clear conversation
  const handleClearChat = () => {
    setMessages([]);
    setMovies([]);
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
      hintText: "You can ask any movie-related questions or describe the type of movie you want to watch"
    },
    zh: {
      title: "电影AI助手",
      clearChat: "清空对话",
      assistantTitle: "电影推荐助手",
      assistantDescription: "告诉我您想看什么类型的电影，我会立即为您推荐最适合的选择！",
      thinking: "思考中...",
      searching: "正在搜索电影...",
      inputPlaceholder: "描述您想看的电影...",
      hintText: "您可以提问任何与电影相关的问题，或描述您想观看的电影类型"
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
              {messages.map((message, i) => (
                <div
                  key={i}
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
              ))}
              
              {/* Movie search results display */}
              {showMovies && movies.length > 0 && !error && (
                <div className="flex justify-start w-full">
                  <div className="max-w-full w-full">
                    <MovieSearchResults 
                      movies={movies} 
                      onClose={() => setShowMovies(false)}
                      language={language}
                    />
                  </div>
                </div>
              )}
              
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
        {(isLoading || isSearching) && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground p-2 border-t border-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">{isLoading ? t.thinking : t.searching}</span>
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
            disabled={isLoading || isSearching}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={isLoading || isSearching || !input.trim()}
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>

      {/* Bottom hint */}
      <div className="text-center text-xs text-muted-foreground">
        <p>{t.hintText}</p>
      </div>
    </div>
  );
} 