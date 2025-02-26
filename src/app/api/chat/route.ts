import { google } from '@ai-sdk/google';
import { Message } from 'ai';
import { z } from 'zod';
import { tool, streamText } from 'ai';
import { discoverMovies, DiscoverMovieOptions } from '@/lib/tmdb';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// System prompt to guide AI in understanding user's movie preferences
const systemPrompt = `You are a professional movie recommendation assistant. Your task is to help users find movies based on their preferences.

When a user describes what kind of movie they want to watch, use the searchMovies tool to find matching movies.

First respond in a friendly way, acknowledging their request, and then call the searchMovies tool with appropriate parameters.

When calling searchMovies, ALWAYS include genres parameter, even if you need to guess based on the user's description. 
Do not just use keywords alone; the genres parameter is essential for finding movies.

Genre ID reference:
28: Action
12: Adventure
16: Animation
35: Comedy
80: Crime
99: Documentary
18: Drama
10751: Family
14: Fantasy
36: History
27: Horror
10402: Music
9648: Mystery
10749: Romance
878: Science Fiction
53: Thriller
10752: War
37: Western

Example:
User: "I want to watch a Jackie Chan action movie"
Assistant: I'll help you find some exciting Jackie Chan action movies!
[Then call searchMovies with genres: "28" (for Action), and keywords: "Jackie Chan"]`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Use streamText with the searchMovies tool
  const result = streamText({
    model: google('gemini-1.5-flash'),
    messages,
    system: systemPrompt,
    tools: {
      searchMovies: tool({
        description: 'Search for movies based on genres, keywords, and other options',
        parameters: z.object({
          genres: z.string().describe('Comma-separated genre IDs (e.g., "28" for Action, "35" for Comedy). This parameter is REQUIRED.'),
          keywords: z.string().optional().describe('Comma-separated keywords for the movie search'),
          options: z.object({
            vote_average_gte: z.number().optional().describe('Minimum vote average (1-10)'),
            sort_by: z.string().optional().describe('Sort order (e.g., popularity.desc)'),
            with_original_language: z.string().optional().describe('Original language code (e.g., en, ja)'),
            primary_release_year: z.number().optional().describe('Release year'),
            with_runtime_gte: z.number().optional().describe('Minimum runtime in minutes'),
            with_runtime_lte: z.number().optional().describe('Maximum runtime in minutes'),
            without_genres: z.string().optional().describe('Excluded genre IDs'),
            with_cast: z.string().optional().describe('Search by cast members')
          }).optional()
        }),
        execute: async ({ genres, keywords, options }) => {
          console.log('searchMovies tool called with:', { genres, keywords, options });

          // Build search options as a properly typed object
          const searchOptions: DiscoverMovieOptions = {
            language: 'en-US',
            with_genres: genres,
            include_adult: false,
            sort_by: 'popularity.desc', // 默认按流行度排序
            'vote_average.gte': 5.0, // 默认最低评分5.0
            'vote_count.gte': 50,    // 默认最低投票数50
            ...(options || {})
          };
          
          // 只有在关键词不为空时才添加
          if (keywords && keywords.trim()) {
            searchOptions.with_keywords = keywords;
          }

          console.log('searchOptions:', searchOptions);

          // Perform the actual search
          const movieResults = await discoverMovies(searchOptions);
          console.log(`Found ${movieResults.length} movies`);
          
          // 如果没有找到电影，尝试放宽条件
          let finalResults = movieResults;
          if (movieResults.length === 0) {
            console.log('No movies found, trying with relaxed criteria');
            // 移除关键词，只用类型搜索
            const relaxedOptions: DiscoverMovieOptions = {
              ...searchOptions,
              'vote_average.gte': 1.0,
              'vote_count.gte': 10
            };
            // 删除关键词属性
            if ('with_keywords' in relaxedOptions) {
              delete relaxedOptions.with_keywords;
            }
            
            console.log('Relaxed searchOptions:', relaxedOptions);
            finalResults = await discoverMovies(relaxedOptions);
            console.log(`Found ${finalResults.length} movies with relaxed criteria`);
          }

          // Format the results for the response
          const movies = finalResults.slice(0, 10).map(movie => ({
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            genres: movie.genre || movie.genres
          }));

          return {
            count: finalResults.length,
            movies: movies
          };
        }
      })
    },
    maxSteps: 2 // Allow up to 2 steps: 1. Initial response, 2. After tool call
  });

  return result.toDataStreamResponse();
} 