'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { MovieDetail } from '@/components/movie-detail';
import { discoverMovies } from '@/lib/tmdb';

export function ChatMovie() {
  const [movies, setMovies] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onResponse: (response) => {
      // Reset any previous errors when we get a new response
      setError(null);
      setMovies([]);
    },
    onFinish: async (message) => {
      try {
        setIsSearching(true);
        setError(null);
        
        // Extract JSON from the message
        const jsonMatch = message.content.match(/\{[\s\S]*?\}/);
        if (!jsonMatch) {
          setError("Could not understand the search criteria. Please try again with a different description.");
          return;
        }

        // Parse the search parameters
        const searchParams = JSON.parse(jsonMatch[0]);
        
        // Build search options
        const searchOptions = {
          language: 'en-US',
          with_genres: searchParams.genres,
          with_keywords: searchParams.keywords,
          include_adult: false,
          ...searchParams.options
        };

        // Perform the search
        const movieResults = await discoverMovies(searchOptions);
        
        if (movieResults.length === 0) {
          setError("No movies found matching your criteria. Try a different description.");
        } else {
          setMovies(movieResults);
        }
      } catch (error) {
        console.error('Failed to search movies:', error);
        setError("Sorry, something went wrong. Please try again with a different description.");
      } finally {
        setIsSearching(false);
      }
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
                {/* Remove any JSON from displayed messages */}
                {message.content.replace(/\{[\s\S]*?\}/g, '')}
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