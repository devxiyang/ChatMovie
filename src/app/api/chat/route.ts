import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Define the schema for movie search parameters
const movieSearchSchema = z.object({
  search: z.object({
    genres: z.string().describe('Comma-separated genre IDs (e.g., "28" for Action, "35" for Comedy)'),
    keywords: z.string().describe('Comma-separated keywords for the movie search'),
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
  })
});

// System prompt to guide AI in understanding user's movie preferences
const systemPrompt = `You are a professional movie recommendation assistant. Your task is to help users find movies based on their preferences.

When a user describes what kind of movie they want to watch, analyze their requirements and provide appropriate search parameters.

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

First respond to the user in a friendly way, then provide the search parameters.`;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const userMessage = messages[messages.length - 1].content;

  // First, let's get a friendly response
  const response = await generateObject({
    model: google('gemini-2.0-flash'),
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    schema: movieSearchSchema,
  });

  // Format the response
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  return new Response(JSON.stringify(response), { headers });
} 