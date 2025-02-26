'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Trash2, Film, ThumbsUp, X } from "lucide-react";
import { MovieSearchResults } from '@/components/movie-search-results';
import { cn } from "@/lib/utils";

// Example movie suggestions
const MOVIE_SUGGESTIONS = [
  "I want to watch an action adventure movie",
  "Recommend a romantic comedy",
  "What are some good sci-fi films",
  "I like mystery thriller movies",
  "Suggest some award-winning classic films",
  "What are the latest animated movies",
  "I want to watch a movie about travel",
  "What are some good family-friendly movies",
  "I want to see a dark comedy"
];

export function ChatMovie() {
  const [movies, setMovies] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMovies, setShowMovies] = useState(true);
  const [suggestions] = useState(() => 
    MOVIE_SUGGESTIONS.sort(() => 0.5 - Math.random()).slice(0, 3)
  );
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  
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
            setError("No movies found matching your criteria. Try a different description.");
          }
        } catch (e) {
          console.error('Error processing search results:', e);
          setError("Failed to process movie search results.");
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
      setError("An error occurred while communicating with the AI. Please try again.");
      setIsSearching(false);
    }
  });

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

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-4 gap-4">
      {/* Title bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Film className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Movie AI Assistant</h2>
        </div>
        
        {messages.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearChat}
            className="text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear Chat
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
              <h3 className="text-xl font-medium mb-2">Movie Recommendation Assistant</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Tell me what kind of movie you'd like to watch, and I'll immediately recommend the perfect options for you!
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
            <span className="text-sm">{isLoading ? 'Thinking...' : 'Searching for movies...'}</span>
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
            placeholder="Describe the movie you want to watch..."
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
        <p>You can ask any movie-related questions or describe the type of movie you want to watch</p>
      </div>
    </div>
  );
} 