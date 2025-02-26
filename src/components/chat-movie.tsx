'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { MovieDetail } from '@/components/movie-detail';
import { discoverMovies } from '@/lib/tmdb';

// Define the expected structure of the searchMovies tool result
interface SearchMoviesResult {
  count: number;
  movies: any[];
}

export function ChatMovie() {
  const [movies, setMovies] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onResponse: (response) => {
      console.log('Chat response received');
      setError(null);
      setMovies([]);
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
          
          // Handle the search results
          if (args.movies && Array.isArray(args.movies) && args.movies.length > 0) {
            setMovies(args.movies);
          } else {
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

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto p-4 gap-4">
      <Card className="flex-1 p-4 overflow-auto">
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${
                message.role === 'assistant' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === 'assistant'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {(isLoading || isSearching) && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {isLoading ? 'Thinking...' : 'Searching movies...'}
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 py-4">
          {error}
        </div>
      )}

      {movies.length > 0 && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {movies.map((movie) => (
            <MovieDetail key={movie.id} {...movie} />
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex gap-2"
      >
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Describe the movie you want to watch, e.g.: I want to watch a heartwarming Japanese film..."
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
} 