import { google } from '@ai-sdk/google';
import { streamText, Message, tool } from 'ai';
import { z } from 'zod';
import { discoverMovies } from '@/lib/tmdb';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// System prompt to guide AI in understanding user's movie preferences
const systemPrompt = `You are a professional movie recommendation assistant. Your task is to help users find movies based on their preferences.

When a user describes what kind of movie they want to watch, you should:
1. Analyze their requirements
2. Use the searchMovies tool to find matching movies
3. Present the results in a friendly way

Genre ID reference:
28: Action, 12: Adventure, 16: Animation, 35: Comedy, 80: Crime, 
99: Documentary, 18: Drama, 10751: Family, 14: Fantasy, 36: History, 
27: Horror, 10402: Music, 9648: Mystery, 10749: Romance, 
878: Science Fiction, 53: Thriller, 10752: War, 37: Western

After getting the search results, format your response like this:
"Based on your preferences, I found these movies for you: [List movies here]"`;

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  const result = streamText({
    model: google('gemini-2.0-flash'),
    messages,
    system: systemPrompt,
    maxSteps: 15,
    temperature: 0.7,
    tools: {
      searchMovies: tool({
        description: 'Search for movies based on genres and keywords',
        parameters: z.object({
          genres: z.string().describe('Comma-separated genre IDs, e.g.: 28,12,16'),
          keywords: z.string().describe('Comma-separated keywords, e.g.: action,adventure'),
          options: z.object({
            vote_average_gte: z.number().optional().describe('Minimum vote average'),
            sort_by: z.string().optional().describe('Sort order (e.g., popularity.desc)'),
            with_original_language: z.string().optional().describe('Original language (e.g., en, ja)'),
            primary_release_year: z.number().optional().describe('Release year'),
            with_runtime_gte: z.number().optional().describe('Minimum runtime in minutes'),
            with_runtime_lte: z.number().optional().describe('Maximum runtime in minutes'),
            without_genres: z.string().optional().describe('Excluded genre IDs')
          }).optional()
        }),
        execute: async ({ genres, keywords, options }) => {
          try {
            const searchOptions = {
              language: 'en-US',
              with_genres: genres,
              with_keywords: keywords,
              include_adult: false,
              ...options && {
                'vote_average.gte': options.vote_average_gte,
                'sort_by': options.sort_by,
                'with_original_language': options.with_original_language,
                'primary_release_year': options.primary_release_year,
                'with_runtime.gte': options.with_runtime_gte,
                'with_runtime.lte': options.with_runtime_lte,
                'without_genres': options.without_genres
              }
            };
            
            const movies = await discoverMovies(searchOptions);
            return { success: true, movies };
          } catch (error) {
            console.error('Movie search error:', error);
            return { 
              success: false, 
              error: 'Failed to search movies',
              movies: [] 
            };
          }
        }
      })
    },
    
    onError: (error) => {
      console.error('Streaming error:', error);
    },
  });

  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  return result.toDataStreamResponse({
    headers,
  });
} 