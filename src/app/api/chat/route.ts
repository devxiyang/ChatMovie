import { google } from '@ai-sdk/google';
import { Message } from 'ai';
import { z } from 'zod';
import { tool, streamText } from 'ai';
import { discoverMovies, DiscoverMovieOptions } from '@/lib/tmdb';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Mood to genre and keyword mapping for better recommendations
interface MoodRecommendation {
  genres: string;
  keywords: string;
}

const moodToRecommendation: Record<string, MoodRecommendation> = {
  // Happy/Positive moods
  happy: { genres: '35,10751', keywords: 'fun,happy,comedy,feel-good' },
  cheerful: { genres: '35,10751', keywords: 'fun,happy,comedy' },
  excited: { genres: '28,12', keywords: 'exciting,adventure,thrill' },
  relaxed: { genres: '35,10751,10402', keywords: 'relaxing,calm' },
  
  // Thoughtful moods
  reflective: { genres: '18', keywords: 'philosophical,thought-provoking' },
  melancholic: { genres: '18', keywords: 'nostalgic,sentimental' },
  thoughtful: { genres: '99,18,36', keywords: 'documentary,educational,intellectual' },
  
  // Emotional moods
  sad: { genres: '18,9648', keywords: 'melancholy,sad,depression' },
  romantic: { genres: '10749', keywords: 'love,romance,relationship' },
  hopeful: { genres: '18,10751', keywords: 'inspirational,uplifting,hope' },
  
  // Exciting moods
  adventurous: { genres: '12,28', keywords: 'adventure,journey,exploration' },
  thrilling: { genres: '28,12,53', keywords: 'action,adventure,exciting' },
  tense: { genres: '53,80,9648', keywords: 'suspense,thriller,tension' },
  
  // Specific moods
  humorous: { genres: '35', keywords: 'comedy,parody,funny' },
  mysterious: { genres: '9648,80', keywords: 'mystery,suspense,twist' },
  scared: { genres: '27,53', keywords: 'horror,scary,fear' },
  dreamy: { genres: '14,10751', keywords: 'fantasy,magical,beautiful' },
  strange: { genres: '14,878', keywords: 'surreal,bizarre,quirky' }
};

// System prompt to guide AI in understanding user's movie preferences
const systemPrompt = `You are a professional movie recommendation assistant who specializes in finding the perfect movies based on user preferences, moods, and interests. Your primary goal is to immediately help users discover movies they'll love.

LANGUAGE INSTRUCTIONS:
1. Detect the language the user is using (English or Chinese) in their message.
2. Always respond in the SAME language the user is using.
3. If the user writes in Chinese, respond in Chinese.
4. If the user writes in English, respond in English.
5. ALWAYS use English for search parameters regardless of conversation language.

RECOMMENDATION GUIDELINES:
1. When a user expresses ANY interest in movies or mentions ANY mood or feeling, IMMEDIATELY call the searchMovies tool.
2. Look for emotional cues or mood indicators in the user's message and map them to appropriate genres and keywords.
3. For mood-based requests, interpret the user's emotional state and select relevant genres/keywords.
4. If you recognize a mood like "happy," "sad," "excited," "reflective," etc., use it to guide your genre selections.
5. Be sensitive to subtle emotional cues that might indicate what kind of movie experience the user wants.

CONVERSATION APPROACH:
1. Don't ask clarifying questions before searching - make your best guess based on context.
2. Be decisive and make reasonable assumptions rather than asking for more details.
3. Keep responses brief, friendly, and focused on the recommended movies.
4. Highlight 2-3 particularly good matches from the results with a brief explanation why.
5. Always sound enthusiastic about your recommendations!

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

User: "I'm feeling sad today, need a movie"
Assistant: [Call searchMovies with genres: "18" and keywords: "melancholy,sad"]

User: "我今天很开心，想看电影" (I'm happy today, want to watch a movie)
Assistant: [Call searchMovies with genres: "35,10751" and keywords: "fun,happy,comedy"] (Then respond in Chinese)

User: "推荐一部让人放松的电影" (Recommend a relaxing movie)
Assistant: [Call searchMovies with genres: "35,10751" and keywords: "relaxing,calm"] (Then respond in Chinese)`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Use streamText with the searchMovies tool
  const result = streamText({
    model: google('gemini-2.0-flash'),
    messages,
    system: systemPrompt,
    tools: {
      searchMovies: tool({
        description: 'Search for movies based on genres, keywords, moods, and other options',
        parameters: z.object({
          genres: z.string().optional().describe('Comma-separated genre IDs (e.g., "28" for Action, "35" for Comedy)'),
          keywords: z.string().optional().describe('Comma-separated keywords for the movie search'),
          mood: z.string().optional().describe('A specific mood or feeling (e.g., "happy", "sad", "reflective")'),
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
        execute: async ({ genres, keywords, mood, options }) => {
          console.log('searchMovies tool called with:', { genres, keywords, mood, options });

          // Build search options as a properly typed object
          const searchOptions: DiscoverMovieOptions = {
            language: 'en-US',
            include_adult: false,
            sort_by: 'popularity.desc', 
            'vote_average.gte': 5.0,
            'vote_count.gte': 50,
            ...(options || {})
          };
          
          // Apply mood-based filters if provided
          if (mood && moodToRecommendation[mood.toLowerCase()]) {
            const moodFilters = moodToRecommendation[mood.toLowerCase()];
            if (!genres && moodFilters.genres) {
              searchOptions.with_genres = moodFilters.genres;
            }
            if (!keywords && moodFilters.keywords) {
              searchOptions.with_keywords = moodFilters.keywords;
            }
          }
          
          // Add genres if provided (explicit genres take precedence over mood-based ones)
          if (genres && genres.trim()) {
            searchOptions.with_genres = genres;
          }
          
          // Add keywords if provided (explicit keywords take precedence over mood-based ones)
          if (keywords && keywords.trim()) {
            searchOptions.with_keywords = keywords;
          }
          
          // If neither genres nor keywords provided, use default popular search
          if ((!searchOptions.with_genres || !searchOptions.with_genres.trim()) && 
              (!searchOptions.with_keywords || !searchOptions.with_keywords.trim())) {
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
    maxSteps: 5 // Allow up to 2 steps: 1. Initial response, 2. After tool call
  });

  return result.toDataStreamResponse();
} 