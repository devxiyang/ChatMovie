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
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    onResponse: (response) => {
      console.log('Chat response received:', response);
      setError(null);
      setMovies([]);
    },
    onFinish: async (message) => {
      try {
        console.log('Processing finished message:', message);
        setIsSearching(true);
        setError(null);
        
        // Parse the response as JSON
        let response;
        try {
          response = JSON.parse(message.content);
          console.log('Parsed response:', response);
        } catch (e) {
          console.error('Failed to parse response:', e);
          setError("Failed to parse AI response. Please try again.");
          return;
        }
        
        // Update the message to show only the text response
        if (response.text) {
          console.log('Updating message with text:', response.text);
          const updatedMessages = messages.map((msg, i) => 
            i === messages.length - 1 ? { ...msg, content: response.text } : msg
          );
          setMessages(updatedMessages);
        } else {
          console.warn('No text response found in:', response);
        }

        if (!response.search) {
          console.warn('No search parameters found in response');
          setError("Could not understand the search criteria. Please try again with a different description.");
          return;
        }

        // Build search options from the validated response
        const searchOptions = {
          language: 'en-US',
          with_genres: response.search.genres,
          with_keywords: response.search.keywords,
          include_adult: false,
          ...response.search.options
        };
        console.log('Search options:', searchOptions);

        // Perform the search
        const movieResults = await discoverMovies(searchOptions);
        console.log('Movie results:', movieResults);
        
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
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setError("An error occurred while communicating with the AI. Please try again.");
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