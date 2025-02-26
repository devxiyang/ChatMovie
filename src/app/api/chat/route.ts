import { google } from '@ai-sdk/google';
import { Message } from 'ai';
import { z } from 'zod';
import { tool, streamText } from 'ai';
import { discoverMovies, DiscoverMovieOptions } from '@/lib/tmdb';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// System prompt to guide AI in understanding user's movie preferences
const systemPrompt = `You are a professional movie recommendation assistant. Your primary goal is to help users discover movies by immediately using the searchMovies tool with appropriate parameters.

LANGUAGE INSTRUCTIONS:
1. Detect the language the user is using (English or Chinese) in their message.
2. Always respond in the SAME language the user is using.
3. If the user writes in Chinese, respond in Chinese.
4. If the user writes in English, respond in English.
5. ALWAYS use English for search parameters regardless of conversation language.

IMPORTANT INSTRUCTIONS:
1. When a user expresses ANY interest in finding or watching movies, IMMEDIATELY call the searchMovies tool.
2. DO NOT ask clarifying questions before using the tool - make your best guess based on available information.
3. Make reasonable assumptions based on the user's request - if they mention a genre or actor, include it in your search.
4. Be decisive and make assumptions when necessary rather than asking for more details.
5. Keep your text responses short and to the point.

After getting results:
- Acknowledge their request with a very brief friendly message (1-2 sentences maximum)
- Focus on highlighting 2-3 interesting movies from the results
- Do not describe every movie in detail

Genre ID reference (use numeric IDs when including genres):
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

Examples:
User: "I want to watch a sci-fi movie"
Assistant: [Call searchMovies with genres: "878"]

User: "I'm in the mood for something funny"
Assistant: [Call searchMovies with genres: "35"]

User: "Show me movies with Tom Cruise"
Assistant: [Call searchMovies with keywords: "Tom Cruise"]

User: "我想看科幻电影" (I want to watch sci-fi movies)
Assistant: [Call searchMovies with genres: "878"] (Then respond in Chinese)

User: "给我推荐一些喜剧电影" (Recommend me some comedy movies)
Assistant: [Call searchMovies with genres: "35"] (Then respond in Chinese)`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Use streamText with the searchMovies tool
  const result = streamText({
    model: google('gemini-2.0-flash'),
    messages,
    system: systemPrompt,
    tools: {
      searchMovies: tool({
        description: 'Search for movies based on genres, keywords, and other options',
        parameters: z.object({
          genres: z.string().optional().describe('Comma-separated genre IDs (e.g., "28" for Action, "35" for Comedy)'),
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
            include_adult: false,
            sort_by: 'popularity.desc', 
            'vote_average.gte': 5.0,
            'vote_count.gte': 50,
            ...(options || {})
          };
          
          // Add genres if provided
          if (genres && genres.trim()) {
            searchOptions.with_genres = genres;
          }
          
          // Add keywords if provided
          if (keywords && keywords.trim()) {
            searchOptions.with_keywords = keywords;
          }
          
          // If neither genres nor keywords provided, use default popular search
          if ((!genres || !genres.trim()) && (!keywords || !keywords.trim())) {
            console.log('No genres or keywords provided, using default popular search');
          }

          console.log('searchOptions:', searchOptions);

          // Perform the actual search
          const movieResults = await discoverMovies(searchOptions);
          console.log(`Found ${movieResults.length} movies`);
          
          // If no movies found, try with relaxed criteria
          let finalResults = movieResults;
          if (movieResults.length === 0) {
            console.log('No movies found, trying with relaxed criteria');
            const relaxedOptions: DiscoverMovieOptions = {
              ...searchOptions,
              'vote_average.gte': 1.0,
              'vote_count.gte': 10
            };
            
            console.log('Relaxed searchOptions:', relaxedOptions);
            finalResults = await discoverMovies(relaxedOptions);
            console.log(`Found ${finalResults.length} movies with relaxed criteria`);
            
            // If still no movies, try with very broad criteria
            if (finalResults.length === 0) {
              const broadGenres = "12,28,14,18,27,35,878,53"; // Include common genres
              const veryRelaxedOptions: DiscoverMovieOptions = {
                ...relaxedOptions,
                with_genres: broadGenres,
                'vote_average.gte': 0,
                'vote_count.gte': 5
              };
              
              console.log('Very relaxed searchOptions:', veryRelaxedOptions);
              finalResults = await discoverMovies(veryRelaxedOptions);
              console.log(`Found ${finalResults.length} movies with very relaxed criteria`);
            }
          }

          // Format the results for the response
          const movies = finalResults.slice(0, 12).map(movie => ({
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